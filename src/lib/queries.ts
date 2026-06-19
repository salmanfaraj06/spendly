import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import {
  materialiseCycleBudgets,
  cycleBudgetReport,
} from "./budget-engine";
import { currentCycle, ensureCycleForDate, previousCycleOf } from "./cycle-service";
import { getDueOccurrences } from "./recurrence-service";
import { cachedPerUser } from "./cache";

const num = (d: { toNumber(): number } | null | undefined) =>
  d ? d.toNumber() : 0;

export type CycleView = { id: string; startDate: Date; endDate: Date };
export const TRANSACTION_PAGE_SIZE = 50;

const txListInclude = {
  category: { select: { id: true, name: true, icon: true, color: true } },
  account: { select: { id: true, name: true, icon: true } },
  destinationAccount: { select: { id: true, name: true, icon: true } },
} as const;

type TxListRow = Prisma.TransactionGetPayload<{ include: typeof txListInclude }>;

export type TransactionListItem = {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  date: string;
  notes: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  accountId: string;
  accountName: string;
  destinationAccountId: string | null;
  destinationAccountName: string | null;
};

export type TransactionPage = {
  items: TransactionListItem[];
  nextCursor: string | null;
};

function mapTransactionListItem(t: TxListRow): TransactionListItem {
  return {
    id: t.id,
    type: t.type,
    amount: num(t.amount),
    date: t.date.toISOString().slice(0, 10),
    notes: t.notes ?? "",
    categoryId: t.category?.id ?? null,
    categoryName: t.category?.name ?? null,
    categoryIcon: t.category?.icon ?? null,
    categoryColor: t.category?.color ?? null,
    accountId: t.account.id,
    accountName: t.account.name,
    destinationAccountId: t.destinationAccount?.id ?? null,
    destinationAccountName: t.destinationAccount?.name ?? null,
  };
}

/** All accounts with derived current balances (BalanceEngine). */
export async function getAccounts(userId: string) {
  const [accounts, sourceGroups, incomingTransfers] = await Promise.all([
    prisma.account.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.groupBy({
      by: ["accountId", "type"],
      where: { userId },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.transaction.groupBy({
      by: ["destinationAccountId"],
      where: { userId, type: "TRANSFER", destinationAccountId: { not: null } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ]);

  const byAccount = new Map<
    string,
    { income: number; expense: number; transferOut: number; transferIn: number; count: number }
  >();
  const statsFor = (accountId: string) => {
    const existing = byAccount.get(accountId);
    if (existing) return existing;
    const created = { income: 0, expense: 0, transferOut: 0, transferIn: 0, count: 0 };
    byAccount.set(accountId, created);
    return created;
  };

  for (const group of sourceGroups) {
    const stats = statsFor(group.accountId);
    const amount = num(group._sum.amount);
    stats.count += group._count._all;
    if (group.type === "INCOME") stats.income += amount;
    if (group.type === "EXPENSE") stats.expense += amount;
    if (group.type === "TRANSFER") stats.transferOut += amount;
  }

  for (const group of incomingTransfers) {
    if (!group.destinationAccountId) continue;
    const stats = statsFor(group.destinationAccountId);
    stats.transferIn += num(group._sum.amount);
    stats.count += group._count._all;
  }

  return accounts.map((a) => ({
    id: a.id,
    name: a.name,
    icon: a.icon,
    color: a.color,
    openingBalance: num(a.openingBalance),
    balance:
      num(a.openingBalance) +
      (byAccount.get(a.id)?.income ?? 0) -
      (byAccount.get(a.id)?.expense ?? 0) -
      (byAccount.get(a.id)?.transferOut ?? 0) +
      (byAccount.get(a.id)?.transferIn ?? 0),
    txCount: byAccount.get(a.id)?.count ?? 0,
  }));
}

export async function getTotalBalance(userId: string) {
  const accounts = await getAccounts(userId);
  return accounts.reduce((s, a) => s + a.balance, 0);
}

export async function getProfile(userId: string) {
  return cachedPerUser(userId, "profile", () =>
    prisma.profile.findUnique({ where: { userId } }),
  );
}

export async function getCategories(userId: string) {
  return cachedPerUser(userId, "categories", () =>
    prisma.category.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
  );
}

/** Categories with their transaction counts — for the manage screen. */
export async function getCategoriesWithCounts(userId: string) {
  const cats = await prisma.category.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    include: { _count: { select: { transactions: true } } },
  });
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
    isDefault: c.isDefault,
    txCount: c._count.transactions,
  }));
}

export async function getRecurringTemplates(userId: string) {
  const [rows, accounts, categories] = await Promise.all([
    prisma.recurringTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.account.findMany({ where: { userId } }),
    prisma.category.findMany({ where: { userId } }),
  ]);
  const accountById = new Map(accounts.map((a) => [a.id, a]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    amount: num(r.amount),
    accountId: r.accountId,
    accountName: accountById.get(r.accountId)?.name ?? "Missing account",
    destinationAccountId: r.destinationAccountId,
    destinationAccountName: r.destinationAccountId
      ? accountById.get(r.destinationAccountId)?.name ?? null
      : null,
    categoryId: r.categoryId,
    categoryName: r.categoryId ? categoryById.get(r.categoryId)?.name ?? null : null,
    categoryIcon: r.categoryId ? categoryById.get(r.categoryId)?.icon ?? null : null,
    notes: r.notes ?? "",
    frequency: r.frequency,
    dayOfMonth: r.dayOfMonth,
    weekday: r.weekday,
    anchorDate: r.anchorDate.toISOString().slice(0, 10),
    active: r.active,
  }));
}

/** Transactions for one cycle, newest first, with category + account joined. */
export async function getTransactions(userId: string, cycleId: string) {
  const rows = await prisma.transaction.findMany({
    where: { userId, cycleId },
    orderBy: { date: "desc" },
    include: { category: true, account: true, destinationAccount: true },
  });
  return rows.map((t) => ({
    id: t.id,
    type: t.type,
    amount: num(t.amount),
    date: t.date.toISOString().slice(0, 10),
    notes: t.notes ?? "",
    category: t.category,
    account: t.account,
    destinationAccount: t.destinationAccount,
  }));
}

/** First page / next page of transactions for one cycle. */
export async function getTransactionPage(
  userId: string,
  cycleId: string,
  cursor?: string | null,
  pageSize = TRANSACTION_PAGE_SIZE,
): Promise<TransactionPage> {
  const rows = await prisma.transaction.findMany({
    where: { userId, cycleId },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: pageSize + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: txListInclude,
  });
  const pageRows = rows.slice(0, pageSize);
  return {
    items: pageRows.map((t) => mapTransactionListItem(t as TxListRow)),
    nextCursor: rows.length > pageSize ? pageRows[pageRows.length - 1]?.id ?? null : null,
  };
}

/** Latest transactions for dashboard previews. */
export async function getRecentTransactions(
  userId: string,
  cycleId: string,
  take = 5,
) {
  const rows = await prisma.transaction.findMany({
    where: { userId, cycleId },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take,
    include: txListInclude,
  });
  return rows.map((t) => mapTransactionListItem(t as TxListRow));
}

/** A single account with its full transaction history (source or destination). */
export async function getAccountWithHistory(userId: string, accountId: string) {
  // The account lookup, balance aggregation, and first transaction page all key
  // off (userId, accountId) — none depends on the others — so fire them together
  // (1 phase, was 3). `balanceDelta` is the movement only (opening balance passed
  // as 0); we add the real opening balance after confirming the account exists.
  const [account, balanceDelta, page] = await Promise.all([
    prisma.account.findFirst({ where: { id: accountId, userId } }),
    getAccountBalance(userId, accountId, 0),
    getAccountTransactionPage(userId, accountId),
  ]);
  if (!account) return null;

  return {
    account: {
      id: account.id,
      name: account.name,
      icon: account.icon,
      color: account.color,
      openingBalance: num(account.openingBalance),
      balance: num(account.openingBalance) + balanceDelta,
    },
    txs: page.items,
    nextCursor: page.nextCursor,
  };
}

async function getAccountBalance(
  userId: string,
  accountId: string,
  openingBalance: number,
) {
  const [sourceGroups, incomingTransfer] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, accountId },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "TRANSFER", destinationAccountId: accountId },
      _sum: { amount: true },
    }),
  ]);

  let income = 0;
  let expense = 0;
  let transferOut = 0;
  for (const group of sourceGroups) {
    const amount = num(group._sum.amount);
    if (group.type === "INCOME") income += amount;
    if (group.type === "EXPENSE") expense += amount;
    if (group.type === "TRANSFER") transferOut += amount;
  }
  return openingBalance + income - expense - transferOut + num(incomingTransfer._sum.amount);
}

export type AccountHistoryItem = {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  date: string;
  notes: string;
  category: { name: string; icon: string | null; color: string | null } | null;
  counterparty: string;
  direction: "in" | "out";
};

export type AccountHistoryPage = {
  items: AccountHistoryItem[];
  nextCursor: string | null;
};

export async function getAccountTransactionPage(
  userId: string,
  accountId: string,
  cursor?: string | null,
  pageSize = TRANSACTION_PAGE_SIZE,
): Promise<AccountHistoryPage> {
  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      OR: [{ accountId }, { destinationAccountId: accountId }],
    },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: pageSize + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { category: true, account: true, destinationAccount: true },
  });

  const pageRows = rows.slice(0, pageSize);
  const items = pageRows.map((t) => {
    const isIncomingTransfer = t.type === "TRANSFER" && t.destinationAccountId === accountId;
    return {
      id: t.id,
      type: t.type,
      amount: num(t.amount),
      date: t.date.toISOString().slice(0, 10),
      notes: t.notes ?? "",
      category: t.category,
      counterparty:
        t.type === "TRANSFER"
          ? isIncomingTransfer
            ? t.account.name
            : t.destinationAccount?.name ?? ""
          : "",
      // Effect on THIS account's balance:
      direction:
        t.type === "INCOME" || isIncomingTransfer ? ("in" as const) : ("out" as const),
    };
  });

  return {
    items,
    nextCursor: rows.length > pageSize ? pageRows[pageRows.length - 1]?.id ?? null : null,
  };
}

/**
 * One fetch of a cycle's transactions, deriving totals, today's spend,
 * spend-by-category and the recent list in memory. Replaces four separate
 * round-trips (getCycleTotals + getTodaySpend + getSpendByCategory +
 * getRecentTransactions) on the dashboard. A cycle holds ~one month of rows.
 */
export async function getCycleSnapshot(
  userId: string,
  cycleId: string,
  recentLimit = 5,
) {
  const rows = await prisma.transaction.findMany({
    where: { userId, cycleId },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    include: txListInclude,
  });

  const todayIso = new Date().toISOString().slice(0, 10);
  let income = 0;
  let expense = 0;
  let today = 0;
  const spendByCat = new Map<string, number>();

  for (const t of rows) {
    const amt = num(t.amount);
    const dateIso = t.date.toISOString().slice(0, 10);
    if (t.type === "INCOME") income += amt;
    else if (t.type === "EXPENSE") {
      expense += amt;
      if (dateIso === todayIso) today += amt;
      if (t.categoryId) spendByCat.set(t.categoryId, (spendByCat.get(t.categoryId) ?? 0) + amt);
    }
  }

  return {
    totals: { income, expense, net: income - expense },
    today,
    spend: [...spendByCat.entries()].map(([categoryId, spentLkr]) => ({ categoryId, spentLkr })),
    recent: rows.slice(0, recentLimit).map((t) => mapTransactionListItem(t as TxListRow)),
  };
}

export async function getCycleTotals(userId: string, cycleId: string) {
  const groups = await prisma.transaction.groupBy({
    by: ["type"],
    where: { userId, cycleId, type: { in: ["INCOME", "EXPENSE"] } },
    _sum: { amount: true },
  });
  let income = 0;
  let expense = 0;
  for (const group of groups) {
    if (group.type === "INCOME") income += num(group._sum.amount);
    if (group.type === "EXPENSE") expense += num(group._sum.amount);
  }
  return { income, expense, net: income - expense };
}

export async function getTodaySpend(userId: string, cycleId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const total = await prisma.transaction.aggregate({
    where: { userId, cycleId, type: "EXPENSE", date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  return num(total._sum.amount);
}

/** Per-category spend for a cycle (EXPENSE only). */
export async function getSpendByCategory(userId: string, cycleId: string) {
  const grouped = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, cycleId, type: "EXPENSE", categoryId: { not: null } },
    _sum: { amount: true },
  });
  return grouped
    .filter((g) => g.categoryId)
    .map((g) => ({ categoryId: g.categoryId as string, spentLkr: num(g._sum.amount) }));
}

/** Budget report for a cycle: templates + overrides materialised, joined to spend.
 *  Pass `precomputedSpend` to reuse a spend-by-category already loaded by the
 *  caller (avoids a duplicate query — e.g. the Home dashboard). */
export async function getBudgetReport(
  userId: string,
  cycleId: string,
  precomputedSpend?: { categoryId: string; spentLkr: number }[],
) {
  const [templates, overrides, spend, categories] = await Promise.all([
    prisma.budgetTemplate.findMany({ where: { userId } }),
    prisma.cycleBudget.findMany({ where: { cycleId } }),
    precomputedSpend ?? getSpendByCategory(userId, cycleId),
    getCategories(userId),
  ]);

  const budgets = materialiseCycleBudgets(
    templates.map((t) => ({ categoryId: t.categoryId, amountLkr: num(t.amountLkr) })),
    overrides.map((o) => ({
      categoryId: o.categoryId,
      amountLkr: num(o.amountLkr),
      isOverride: o.isOverride,
    })),
  );

  const report = cycleBudgetReport(budgets, spend);
  const catById = new Map(categories.map((c) => [c.id, c]));
  return report.map((r) => ({ ...r, category: catById.get(r.categoryId)! }));
}

export async function getGoals(userId: string, cycleId: string) {
  const rows = await prisma.goal.findMany({
    where: { userId, cycleId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((g) => ({
    id: g.id,
    name: g.name,
    targetAmountLkr: num(g.targetAmountLkr),
    achievedAmountLkr: num(g.achievedAmountLkr),
    status: g.status,
  }));
}

/** Goals across the calendar year of the given cycle — annual rollup. */
export async function getAnnualGoals(userId: string, year: number) {
  const rows = await prisma.goal.findMany({
    where: {
      userId,
      cycle: {
        startDate: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
    },
  });
  return rows.map((g) => ({
    targetAmountLkr: num(g.targetAmountLkr),
    achievedAmountLkr: num(g.achievedAmountLkr),
    status: g.status,
  }));
}

/** Expense totals for the last `count` cycles (oldest → newest), for the trend chart. */
export async function getCycleTrend(userId: string, count = 7) {
  const { loadConfigs } = await import("./cycle-service");
  const { resolveCycle, previousCycle } = await import("./cycle-engine");

  // Compute the last `count` cycle windows entirely in memory (pure engine).
  const configs = await loadConfigs(userId);
  const windows = [resolveCycle(configs, new Date())];
  for (let i = 1; i < count; i++) {
    windows.unshift(previousCycle(configs, windows[0]));
  }

  // One ranged query over the whole span, bucketed into windows in memory —
  // no per-cycle materialisation (avoids ~`count` extra round-trips by date).
  const rangeStart = windows[0].start;
  const rangeEnd = windows[windows.length - 1].end;
  const txs = await prisma.transaction.findMany({
    where: { userId, type: "EXPENSE", date: { gte: rangeStart, lt: rangeEnd } },
    select: { date: true, amount: true },
  });

  return windows.map((w) => {
    let spend = 0;
    for (const t of txs) {
      if (t.date >= w.start && t.date < w.end) spend += num(t.amount);
    }
    return { month: w.start.toLocaleDateString("en-LK", { month: "short" }), spend };
  });
}

/** Convenience: the active cycle as a plain view. */
export async function getCurrentCycleView(userId: string): Promise<CycleView> {
  const c = await currentCycle(userId);
  return { id: c.id, startDate: c.startDate, endDate: c.endDate };
}

/** The cycle covering a given ISO date (yyyy-mm-dd), or the current cycle. */
export async function getCycleViewFor(
  userId: string,
  isoDate?: string,
): Promise<CycleView> {
  if (!isoDate) return getCurrentCycleView(userId);
  const c = await ensureCycleForDate(userId, new Date(`${isoDate}T00:00:00.000Z`));
  return { id: c.id, startDate: c.startDate, endDate: c.endDate };
}

export type HomeDashboard = {
  cycle: CycleView;
  totals: { income: number; expense: number; net: number };
  today: number;
  spend: { categoryId: string; spentLkr: number }[];
  recent: TransactionListItem[];
  totalBalance: number;
  budgetReport: Awaited<ReturnType<typeof getBudgetReport>>;
  categories: Awaited<ReturnType<typeof getCategories>>;
  trend: Awaited<ReturnType<typeof getCycleTrend>>;
  dueOccurrences: Awaited<ReturnType<typeof getDueOccurrences>>;
  profile: Awaited<ReturnType<typeof getProfile>>;
  prevTotals: { income: number; expense: number; net: number };
};

/**
 * Everything the Home dashboard renders, fetched in two round-trip phases:
 *   A) resolve the current + previous cycle (cheap — cached configs, 1–2 lookups)
 *   B) one parallel batch for all dependent reads.
 *
 * This is the single seam for the dashboard's data: the ordering lives here, not
 * in the page, so adding a widget cannot silently re-introduce a serial `await`.
 * `getBudgetReport` deliberately computes its own spend rather than reusing the
 * snapshot's — that lets it run inside the batch (one extra groupBy, but in
 * parallel, so zero wall-clock) instead of waiting on the snapshot first.
 */
export async function getHomeDashboard(userId: string): Promise<HomeDashboard> {
  const cycle = await getCurrentCycleView(userId);
  const prevCycle = await previousCycleOf(userId, cycle.startDate);

  const [snapshot, totalBalance, budgetReport, categories, trend, dueOccurrences, profile, prevTotals] =
    await Promise.all([
      getCycleSnapshot(userId, cycle.id, 5),
      getTotalBalance(userId),
      getBudgetReport(userId, cycle.id),
      getCategories(userId),
      getCycleTrend(userId, 7),
      getDueOccurrences(userId),
      getProfile(userId),
      getCycleTotals(userId, prevCycle.id),
    ]);

  return {
    cycle,
    totals: snapshot.totals,
    today: snapshot.today,
    spend: snapshot.spend,
    recent: snapshot.recent,
    totalBalance,
    budgetReport,
    categories,
    trend,
    dueOccurrences,
    profile,
    prevTotals,
  };
}
