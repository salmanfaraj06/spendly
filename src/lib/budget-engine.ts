export type BudgetTemplate = { categoryId: string; amountLkr: number };

export type CycleBudget = {
  categoryId: string;
  amountLkr: number;
  isOverride: boolean;
};

export type CategorySpend = { categoryId: string; spentLkr: number };

export type BudgetStatus = {
  categoryId: string;
  budgetedLkr: number;
  spentLkr: number;
  remainingLkr: number;
  utilisationPct: number; // 0–100+, rounded to 1 dp
  state: "ok" | "near" | "over";
};

const NEAR_THRESHOLD_PCT = 80;

/**
 * Materialise the budgets for a cycle from the persisted templates,
 * letting any per-cycle overrides win.
 */
export function materialiseCycleBudgets(
  templates: BudgetTemplate[],
  overrides: CycleBudget[] = [],
): CycleBudget[] {
  const overrideByCategory = new Map(overrides.map((o) => [o.categoryId, o]));
  const result: CycleBudget[] = templates.map(
    (t) =>
      overrideByCategory.get(t.categoryId) ?? {
        categoryId: t.categoryId,
        amountLkr: t.amountLkr,
        isOverride: false,
      },
  );
  // Overrides for categories without a template still apply.
  for (const o of overrides) {
    if (!templates.some((t) => t.categoryId === o.categoryId)) result.push(o);
  }
  return result;
}

/** Utilisation for one category budget against its spend. */
export function budgetStatus(
  budget: CycleBudget,
  spentLkr: number,
): BudgetStatus {
  const remainingLkr = budget.amountLkr - spentLkr;
  const utilisationPct =
    budget.amountLkr === 0
      ? spentLkr > 0
        ? Infinity
        : 0
      : Math.round((spentLkr / budget.amountLkr) * 1000) / 10;

  let state: BudgetStatus["state"] = "ok";
  if (spentLkr > budget.amountLkr) state = "over";
  else if (utilisationPct >= NEAR_THRESHOLD_PCT) state = "near";

  return {
    categoryId: budget.categoryId,
    budgetedLkr: budget.amountLkr,
    spentLkr,
    remainingLkr,
    utilisationPct,
    state,
  };
}

/** Join cycle budgets to per-category spend, producing a status row each. */
export function cycleBudgetReport(
  budgets: CycleBudget[],
  spend: CategorySpend[],
): BudgetStatus[] {
  const spentByCategory = new Map(spend.map((s) => [s.categoryId, s.spentLkr]));
  return budgets.map((b) =>
    budgetStatus(b, spentByCategory.get(b.categoryId) ?? 0),
  );
}
