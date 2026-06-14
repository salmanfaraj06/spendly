import "server-only";
import { prisma } from "./prisma";
import { accountBalance, type Transaction as BalTx } from "./balance-engine";
import {
  materialiseCycleBudgets,
  cycleBudgetReport,
} from "./budget-engine";
import { currentCycle, ensureCycleForDate } from "./cycle-service";

const num = (d: { toNumber(): number } | null | undefined) =>
  d ? d.toNumber() : 0;

export type CycleView = { id: string; startDate: Date; endDate: Date };

/** All accounts with derived current balances (BalanceEngine). */
export async function getAccounts(userId: string) {
  const [accounts, txs] = await Promise.all([
    prisma.account.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.findMany({ where: { userId } }),
  ]);

  const balTxs: BalTx[] = txs.map((t) => ({
    type: t.type,
    amount: num(t.amount),
    accountId: t.accountId,
    destinationAccountId: t.destinationAccountId,
  }));

  return accounts.map((a) => ({
    id: a.id,
    name: a.name,
    icon: a.icon,
    color: a.color,
    openingBalance: num(a.openingBalance),
    balance: accountBalance(a.id, num(a.openingBalance), balTxs),
    txCount: txs.filter(
      (t) => t.accountId === a.id || t.destinationAccountId === a.id,
    ).length,
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

/** A single account with its full transaction history (source or destination). */
export async function getAccountWithHistory(userId: string, accountId: string) {
  const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!account) return null;

  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      OR: [{ accountId }, { destinationAccountId: accountId }],
    },
    orderBy: { date: "desc" },
    include: { category: true, account: true, destinationAccount: true },
  });

  const txs = rows.map((t) => {
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

  const balance = accountBalance(
    accountId,
    num(account.openingBalance),
    rows.map((t) => ({
      type: t.type,
      amount: num(t.amount),
      accountId: t.accountId,
      destinationAccountId: t.destinationAccountId,
    })),
  );

  return {
    account: {
      id: account.id,
      name: account.name,
      icon: account.icon,
      color: account.color,
      openingBalance: num(account.openingBalance),
      balance,
    },
    txs,
  };
}

export async function getCycleTotals(userId: string, cycleId: string) {
  const txs = await prisma.transaction.findMany({ where: { userId, cycleId } });
  let income = 0;
  let expense = 0;
  for (const t of txs) {
    if (t.type === "INCOME") income += num(t.amount);
    if (t.type === "EXPENSE") expense += num(t.amount);
  }
  return { income, expense, net: income - expense };
}

export async function getTodaySpend(userId: string, cycleId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const txs = await prisma.transaction.findMany({
    where: { userId, cycleId, type: "EXPENSE", date: { gte: start, lt: end } },
  });
  return txs.reduce((s, t) => s + num(t.amount), 0);
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
  const { previousCycleOf } = await import("./cycle-service");
  const out: { month: string; spend: number }[] = [];
  let cursor = await currentCycle(userId);
  const cycles = [cursor];
  for (let i = 1; i < count; i++) {
    cursor = await previousCycleOf(userId, cursor.startDate);
    cycles.unshift(cursor);
  }
  for (const c of cycles) {
    const totals = await getCycleTotals(userId, c.id);
    out.push({
      month: c.startDate.toLocaleDateString("en-LK", { month: "short" }),
      spend: totals.expense,
    });
  }
  return out;
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
