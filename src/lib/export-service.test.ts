import { describe, it, expect } from "vitest";
import { toCsv } from "./csv";
import {
  exportTransactionsCsv,
  exportBudgetSummariesCsv,
  exportGoalProgressCsv,
  exportAccountBalancesCsv,
} from "./export-service";

describe("toCsv", () => {
  it("renders a header row and data rows in column order", () => {
    const csv = toCsv(["a", "b"], [{ a: 1, b: 2 }]);
    expect(csv).toBe("a,b\n1,2");
  });

  it("quotes fields containing commas, quotes, or newlines", () => {
    const csv = toCsv(["note"], [{ note: 'Lunch, "Pizza"\nspecial' }]);
    expect(csv).toBe('note\n"Lunch, ""Pizza""\nspecial"');
  });

  it("renders empty string for missing values", () => {
    expect(toCsv(["a", "b"], [{ a: 1 }])).toBe("a,b\n1,");
  });
});

describe("ExportService — transactions", () => {
  it("emits the agreed column structure", () => {
    const csv = exportTransactionsCsv([
      {
        date: "2026-03-10", type: "EXPENSE", amount: 2500, category: "Food & Dining",
        account: "Cash Wallet", notes: "Lunch", cycleId: "c1",
        cycleStart: "2026-02-25", cycleEnd: "2026-03-25",
      },
    ]);
    const [header, row] = csv.split("\n");
    expect(header).toBe(
      "date,type,amount,category,account,notes,cycle_id,cycle_start,cycle_end",
    );
    expect(row).toBe(
      "2026-03-10,EXPENSE,2500,Food & Dining,Cash Wallet,Lunch,c1,2026-02-25,2026-03-25",
    );
  });
});

describe("ExportService — other exports", () => {
  it("emits budget summary columns", () => {
    const header = exportBudgetSummariesCsv([]).split("\n")[0];
    expect(header).toBe(
      "cycle,category,budgeted_amount,spent_amount,remaining,utilisation_pct",
    );
  });

  it("emits goal progress columns", () => {
    const header = exportGoalProgressCsv([]).split("\n")[0];
    expect(header).toBe("cycle,goal_name,target_amount,achieved_amount,status");
  });

  it("emits account balance columns", () => {
    const header = exportAccountBalancesCsv([]).split("\n")[0];
    expect(header).toBe(
      "account,cycle,opening_balance,closing_balance,total_income,total_expenses,total_transfers_in,total_transfers_out",
    );
  });
});
