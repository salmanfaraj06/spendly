import { describe, it, expect } from "vitest";
import { accountBalance, type Transaction } from "./balance-engine";

describe("BalanceEngine — accountBalance", () => {
  it("returns the opening balance for an account with no transactions", () => {
    expect(accountBalance("a", 5000, [])).toBe(5000);
  });

  it("credits income to its account", () => {
    const txs: Transaction[] = [
      { type: "INCOME", amount: 10000, accountId: "a" },
    ];
    expect(accountBalance("a", 0, txs)).toBe(10000);
  });

  it("debits an expense from its account", () => {
    const txs: Transaction[] = [
      { type: "EXPENSE", amount: 2500, accountId: "a" },
    ];
    expect(accountBalance("a", 10000, txs)).toBe(7500);
  });

  it("debits the source account on a transfer", () => {
    const txs: Transaction[] = [
      { type: "TRANSFER", amount: 3000, accountId: "a", destinationAccountId: "b" },
    ];
    expect(accountBalance("a", 10000, txs)).toBe(7000);
  });

  it("credits the destination account on a transfer", () => {
    const txs: Transaction[] = [
      { type: "TRANSFER", amount: 3000, accountId: "a", destinationAccountId: "b" },
    ];
    expect(accountBalance("b", 1000, txs)).toBe(4000);
  });

  it("ignores transactions that do not touch the account", () => {
    const txs: Transaction[] = [
      { type: "INCOME", amount: 10000, accountId: "b" },
      { type: "EXPENSE", amount: 500, accountId: "c" },
    ];
    expect(accountBalance("a", 2000, txs)).toBe(2000);
  });

  it("aggregates a mixed sequence of transactions", () => {
    const txs: Transaction[] = [
      { type: "INCOME", amount: 50000, accountId: "a" },
      { type: "EXPENSE", amount: 2000, accountId: "a" },
      { type: "TRANSFER", amount: 10000, accountId: "a", destinationAccountId: "b" },
      { type: "TRANSFER", amount: 1500, accountId: "b", destinationAccountId: "a" },
    ];
    // 0 + 50000 - 2000 - 10000 + 1500 = 39500
    expect(accountBalance("a", 0, txs)).toBe(39500);
    // 0 + 10000 - 1500 = 8500
    expect(accountBalance("b", 0, txs)).toBe(8500);
  });
});
