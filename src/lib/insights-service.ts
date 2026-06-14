import "server-only";
import { prisma } from "./prisma";
import { computeFacts, type InsightInput } from "./insights-engine";
import { phraseFacts } from "./insights-phraser";
import {
  getCycleTotals,
  getSpendByCategory,
  getBudgetReport,
  getCategories,
} from "./queries";
import { previousCycleOf } from "./cycle-service";

const num = (d: { toNumber(): number } | null | undefined) => (d ? d.toNumber() : 0);

type CycleRef = { id: string; startDate: Date; endDate: Date };

/** Assemble the deterministic InsightInput for a cycle from live data. */
async function buildInput(userId: string, cycle: CycleRef): Promise<InsightInput> {
  const prev = await previousCycleOf(userId, cycle.startDate);
  const [totals, prevTotals, spend, prevSpend, budgetReport, categories, biggest] =
    await Promise.all([
      getCycleTotals(userId, cycle.id),
      getCycleTotals(userId, prev.id),
      getSpendByCategory(userId, cycle.id),
      getSpendByCategory(userId, prev.id),
      getBudgetReport(userId, cycle.id),
      getCategories(userId),
      prisma.transaction.findFirst({
        where: { userId, cycleId: cycle.id, type: "EXPENSE" },
        orderBy: { amount: "desc" },
        include: { category: true },
      }),
    ]);

  const now = Date.now();
  const span = cycle.endDate.getTime() - cycle.startDate.getTime();
  const elapsed = span > 0 ? (now - cycle.startDate.getTime()) / span : 0;

  const prevSpendByCat = new Map(prevSpend.map((s) => [s.categoryId, s.spentLkr]));
  const spendByCat = new Map(spend.map((s) => [s.categoryId, s.spentLkr]));
  const budgetByCat = new Map(budgetReport.map((r) => [r.categoryId, r.budgetedLkr]));

  const cats = categories
    .filter((c) => spendByCat.has(c.id) || prevSpendByCat.has(c.id))
    .map((c) => ({
      name: c.name,
      spent: spendByCat.get(c.id) ?? 0,
      prevSpent: prevSpendByCat.has(c.id) ? prevSpendByCat.get(c.id)! : null,
      budget: budgetByCat.get(c.id) ?? null,
    }));

  const hasPrev = prevTotals.income > 0 || prevTotals.expense > 0;

  return {
    cycleElapsedFraction: elapsed,
    income: totals.income,
    expense: totals.expense,
    prevExpense: hasPrev ? prevTotals.expense : null,
    totalBudget: budgetReport.reduce((s, r) => s + r.budgetedLkr, 0),
    categories: cats,
    biggestExpense: biggest
      ? { label: biggest.notes || biggest.category?.name || "Expense", amount: num(biggest.amount) }
      : null,
    overBudgetCount: budgetReport.filter((r) => r.state === "over").length,
    nearBudgetCount: budgetReport.filter((r) => r.state === "near").length,
  };
}

/** Return cached insight lines for the cycle, generating them if absent. */
export async function getInsights(userId: string, cycle: CycleRef): Promise<string[]> {
  const cached = await prisma.insightCache.findUnique({
    where: { userId_cycleId: { userId, cycleId: cycle.id } },
  });
  if (cached) return cached.lines as string[];
  return regenerateInsights(userId, cycle);
}

/** Force regeneration (used by the manual refresh) and update the cache. */
export async function regenerateInsights(userId: string, cycle: CycleRef): Promise<string[]> {
  const input = await buildInput(userId, cycle);
  const facts = computeFacts(input);
  const lines = await phraseFacts(facts);
  await prisma.insightCache.upsert({
    where: { userId_cycleId: { userId, cycleId: cycle.id } },
    create: { userId, cycleId: cycle.id, facts: facts as object, lines },
    update: { facts: facts as object, lines },
  });
  return lines;
}
