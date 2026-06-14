import { describe, it, expect } from "vitest";
import { computeFacts, type InsightInput } from "./insights-engine";

const base: InsightInput = {
  cycleElapsedFraction: 0.5,
  income: 100000,
  expense: 40000,
  prevExpense: 50000,
  totalBudget: 80000,
  categories: [
    { name: "Food & Dining", spent: 20000, prevSpent: 12000, budget: 25000 },
    { name: "Transport", spent: 5000, prevSpent: 6000, budget: 10000 },
  ],
  biggestExpense: { label: "Sneakers", amount: 14500 },
  overBudgetCount: 0,
  nearBudgetCount: 1,
};

describe("InsightsEngine — pacing", () => {
  it("flags 'ahead' when spend ratio is well below time elapsed", () => {
    // 40k/80k = 0.5 spent, 0.5 elapsed → on-track
    expect(computeFacts(base).pacing.status).toBe("on-track");
  });

  it("flags 'ahead' when under-spending the clock", () => {
    const f = computeFacts({ ...base, expense: 20000 }); // 0.25 spent vs 0.5 elapsed
    expect(f.pacing.status).toBe("ahead");
    expect(f.pacing.spentPct).toBe(25);
  });

  it("flags 'behind' when overspending the clock", () => {
    const f = computeFacts({ ...base, expense: 60000 }); // 0.75 vs 0.5
    expect(f.pacing.status).toBe("behind");
  });

  it("reports no-budget when total budget is zero", () => {
    const f = computeFacts({ ...base, totalBudget: 0 });
    expect(f.pacing.status).toBe("no-budget");
    expect(f.pacing.spentPct).toBeNull();
  });
});

describe("InsightsEngine — movers and comparisons", () => {
  it("identifies the top category mover by % increase", () => {
    // Food: 12k→20k = +66.7%; Transport decreased
    expect(computeFacts(base).topMover).toEqual({ name: "Food & Dining", deltaPct: 66.7 });
  });

  it("returns null mover when no category increased", () => {
    const f = computeFacts({
      ...base,
      categories: [{ name: "Food & Dining", spent: 5000, prevSpent: 12000, budget: 25000 }],
    });
    expect(f.topMover).toBeNull();
  });

  it("computes cycle-over-cycle spend change", () => {
    // 40k vs 50k = -20%
    expect(computeFacts(base).spendChangePct).toBe(-20);
  });

  it("returns null spend change when there is no previous cycle", () => {
    expect(computeFacts({ ...base, prevExpense: null }).spendChangePct).toBeNull();
  });
});

describe("InsightsEngine — net and warnings", () => {
  it("reports positive net savings", () => {
    const f = computeFacts(base);
    expect(f.net).toEqual({ amount: 60000, positive: true });
  });

  it("reports negative net", () => {
    const f = computeFacts({ ...base, income: 30000 });
    expect(f.net).toEqual({ amount: -10000, positive: false });
  });

  it("passes through over/near budget counts", () => {
    expect(computeFacts(base).budgetWarnings).toEqual({ over: 0, near: 1 });
  });

  it("handles empty data without throwing", () => {
    const empty: InsightInput = {
      cycleElapsedFraction: 0,
      income: 0,
      expense: 0,
      prevExpense: null,
      totalBudget: 0,
      categories: [],
      biggestExpense: null,
      overBudgetCount: 0,
      nearBudgetCount: 0,
    };
    const f = computeFacts(empty);
    expect(f.net).toEqual({ amount: 0, positive: true });
    expect(f.topMover).toBeNull();
    expect(f.biggestExpense).toBeNull();
  });
});
