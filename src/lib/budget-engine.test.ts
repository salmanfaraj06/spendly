import { describe, it, expect } from "vitest";
import {
  materialiseCycleBudgets,
  budgetStatus,
  cycleBudgetReport,
} from "./budget-engine";

describe("BudgetEngine — materialiseCycleBudgets", () => {
  it("materialises budgets from templates when there are no overrides", () => {
    const budgets = materialiseCycleBudgets([
      { categoryId: "food", amountLkr: 20000 },
      { categoryId: "transport", amountLkr: 8000 },
    ]);

    expect(budgets).toEqual([
      { categoryId: "food", amountLkr: 20000, isOverride: false },
      { categoryId: "transport", amountLkr: 8000, isOverride: false },
    ]);
  });

  it("lets a per-cycle override win over the template", () => {
    const budgets = materialiseCycleBudgets(
      [{ categoryId: "food", amountLkr: 20000 }],
      [{ categoryId: "food", amountLkr: 30000, isOverride: true }],
    );

    expect(budgets).toEqual([
      { categoryId: "food", amountLkr: 30000, isOverride: true },
    ]);
  });

  it("keeps an override for a category that has no template", () => {
    const budgets = materialiseCycleBudgets(
      [],
      [{ categoryId: "gifts", amountLkr: 5000, isOverride: true }],
    );

    expect(budgets).toEqual([
      { categoryId: "gifts", amountLkr: 5000, isOverride: true },
    ]);
  });
});

describe("BudgetEngine — budgetStatus", () => {
  const budget = { categoryId: "food", amountLkr: 20000, isOverride: false };

  it("computes remaining and utilisation under budget", () => {
    const status = budgetStatus(budget, 5000);
    expect(status.remainingLkr).toBe(15000);
    expect(status.utilisationPct).toBe(25);
    expect(status.state).toBe("ok");
  });

  it("flags 'near' at or above 80% utilisation", () => {
    expect(budgetStatus(budget, 16000).state).toBe("near");
  });

  it("flags 'over' when spend exceeds the budget", () => {
    const status = budgetStatus(budget, 21000);
    expect(status.state).toBe("over");
    expect(status.remainingLkr).toBe(-1000);
  });

  it("rounds utilisation to one decimal place", () => {
    expect(budgetStatus(budget, 3333).utilisationPct).toBe(16.7);
  });
});

describe("BudgetEngine — cycleBudgetReport", () => {
  it("joins budgets to spend, defaulting missing spend to zero", () => {
    const report = cycleBudgetReport(
      [
        { categoryId: "food", amountLkr: 20000, isOverride: false },
        { categoryId: "transport", amountLkr: 8000, isOverride: false },
      ],
      [{ categoryId: "food", spentLkr: 17000 }],
    );

    expect(report[0]).toMatchObject({ categoryId: "food", state: "near", spentLkr: 17000 });
    expect(report[1]).toMatchObject({ categoryId: "transport", spentLkr: 0, state: "ok" });
  });
});
