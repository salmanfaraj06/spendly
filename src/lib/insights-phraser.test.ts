import { describe, it, expect } from "vitest";
import { phraseFactsFallback, buildPhrasingPrompt } from "./insights-phraser";
import type { Facts } from "./insights-engine";

const facts: Facts = {
  pacing: { elapsedPct: 50, spentPct: 25, status: "ahead" },
  topMover: { name: "Food & Dining", deltaPct: 66.7 },
  biggestExpense: { label: "Sneakers", amount: 14500 },
  spendChangePct: -20,
  budgetWarnings: { over: 0, near: 1 },
  net: { amount: 60000, positive: true },
};

describe("InsightsPhraser — deterministic fallback", () => {
  it("produces a non-empty set of sentences from facts", () => {
    const lines = phraseFactsFallback(facts);
    expect(lines.length).toBeGreaterThanOrEqual(3);
  });

  it("phrases pacing, mover, and net using the exact figures", () => {
    const text = phraseFactsFallback(facts).join(" ");
    expect(text).toContain("25%");
    expect(text).toContain("Food & Dining");
    expect(text).toContain("66.7%");
    expect(text).toContain("LKR 60,000.00");
  });

  it("describes a deficit when net is negative", () => {
    const text = phraseFactsFallback({ ...facts, net: { amount: -10000, positive: false } }).join(" ");
    expect(text).toContain("deficit");
    expect(text).toContain("LKR 10,000.00");
  });

  it("handles the no-budget pacing state", () => {
    const text = phraseFactsFallback({
      ...facts,
      pacing: { elapsedPct: 30, spentPct: null, status: "no-budget" },
    }).join(" ");
    expect(text).toContain("No budgets set");
  });
});

describe("InsightsPhraser — prompt construction (ADR 0002)", () => {
  it("instructs the model to phrase only and never compute", () => {
    const { system, user } = buildPhrasingPrompt(facts);
    expect(system.toLowerCase()).toContain("never");
    expect(user).toContain("FACTS");
    expect(user).toContain("Food & Dining");
  });
});
