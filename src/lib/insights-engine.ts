export type InsightInput = {
  /** Fraction of the cycle elapsed, 0..1 (today relative to cycle span). */
  cycleElapsedFraction: number;
  income: number;
  expense: number;
  prevExpense: number | null; // null when there is no previous cycle
  totalBudget: number; // 0 when no budgets set
  categories: {
    name: string;
    spent: number;
    prevSpent: number | null;
    budget: number | null;
  }[];
  /** Biggest single expense this cycle, if any. */
  biggestExpense: { label: string; amount: number } | null;
  overBudgetCount: number;
  nearBudgetCount: number;
};

export type Facts = {
  pacing: {
    elapsedPct: number;
    spentPct: number | null; // null when no budget
    status: "ahead" | "behind" | "on-track" | "no-budget";
  };
  topMover: { name: string; deltaPct: number } | null;
  biggestExpense: { label: string; amount: number } | null;
  spendChangePct: number | null; // vs previous cycle, null when none
  budgetWarnings: { over: number; near: number };
  net: { amount: number; positive: boolean };
};

const pct = (n: number) => Math.round(n * 1000) / 10;

/** Compute the deterministic facts that drive Smart Insights. Pure — no AI. */
export function computeFacts(input: InsightInput): Facts {
  const elapsedPct = pct(clamp01(input.cycleElapsedFraction));

  // Budget pacing: compare spend ratio to time-elapsed ratio.
  let pacing: Facts["pacing"];
  if (input.totalBudget <= 0) {
    pacing = { elapsedPct, spentPct: null, status: "no-budget" };
  } else {
    const spentRatio = input.expense / input.totalBudget;
    const spentPct = pct(spentRatio);
    const elapsed = clamp01(input.cycleElapsedFraction);
    let status: Facts["pacing"]["status"];
    if (spentRatio > elapsed + 0.05) status = "behind"; // overspending the clock
    else if (spentRatio < elapsed - 0.05) status = "ahead";
    else status = "on-track";
    pacing = { elapsedPct, spentPct, status };
  }

  // Top category mover vs last cycle (largest positive % increase).
  let topMover: Facts["topMover"] = null;
  for (const c of input.categories) {
    if (c.prevSpent && c.prevSpent > 0 && c.spent > c.prevSpent) {
      const deltaPct = pct((c.spent - c.prevSpent) / c.prevSpent);
      if (!topMover || deltaPct > topMover.deltaPct) {
        topMover = { name: c.name, deltaPct };
      }
    }
  }

  const spendChangePct =
    input.prevExpense && input.prevExpense > 0
      ? pct((input.expense - input.prevExpense) / input.prevExpense)
      : null;

  const net = input.income - input.expense;

  return {
    pacing,
    topMover,
    biggestExpense: input.biggestExpense,
    spendChangePct,
    budgetWarnings: { over: input.overBudgetCount, near: input.nearBudgetCount },
    net: { amount: net, positive: net >= 0 },
  };
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
