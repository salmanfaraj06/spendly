import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import {
  materialiseCycleBudgets,
  cycleBudgetReport,
} from "./budget-engine";
import { currentCycle, ensureCycleForDate } from "./cycle-service";

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
  return prisma.profile.findUnique({ where: { userId } });
}

export async function getCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
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
  const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!account) return null;

  const balance = await getAccountBalance(userId, accountId, num(account.openingBalance));
  const page = await getAccountTransactionPage(userId, accountId);

  return {
    account: {
      id: account.id,
      name: account.name,
      icon: account.icon,
      color: account.color,
      openingBalance: num(account.openingBalance),
      balance,
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

/** Budget report for a cycle: templates + overrides materialised, joined to spend. */
export async function getBudgetReport(userId: string, cycleId: string) {
  const [templates, overrides, spend, categories] = await Promise.all([
    prisma.budgetTemplate.findMany({ where: { userId } }),
    prisma.cycleBudget.findMany({ where: { cycleId } }),
    getSpendByCategory(userId, cycleId),
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

  const cycleViews = await Promise.all(
    windows.map((window) => ensureCycleForDate(userId, window.start)),
  );
  const spendByCycle = await prisma.transaction.groupBy({
    by: ["cycleId"],
    where: { userId, type: "EXPENSE", cycleId: { in: cycleViews.map((c) => c.id) } },
    _sum: { amount: true },
  });
  const spendByCycleId = new Map(
    spendByCycle.map((group) => [group.cycleId, num(group._sum.amount)]),
  );

  return windows.map((w, index) => {
    return {
      month: w.start.toLocaleDateString("en-LK", { month: "short" }),
      spend: spendByCycleId.get(cycleViews[index].id) ?? 0,
    };
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
