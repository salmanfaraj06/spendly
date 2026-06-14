import { toCsv } from "./csv";

export type TransactionRow = {
  date: string;
  type: string;
  amount: number;
  category: string;
  account: string;
  notes: string;
  cycleId: string;
  cycleStart: string;
  cycleEnd: string;
};

export type BudgetSummaryRow = {
  cycle: string;
  category: string;
  budgetedAmount: number;
  spentAmount: number;
  remaining: number;
  utilisationPct: number;
};

export type GoalProgressRow = {
  cycle: string;
  goalName: string;
  targetAmount: number;
  achievedAmount: number;
  status: string;
};

export type AccountBalanceRow = {
  account: string;
  cycle: string;
  openingBalance: number;
  closingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalTransfersIn: number;
  totalTransfersOut: number;
};

const TRANSACTION_COLUMNS = [
  "date", "type", "amount", "category", "account",
  "notes", "cycle_id", "cycle_start", "cycle_end",
];
const BUDGET_COLUMNS = [
  "cycle", "category", "budgeted_amount", "spent_amount",
  "remaining", "utilisation_pct",
];
const GOAL_COLUMNS = [
  "cycle", "goal_name", "target_amount", "achieved_amount", "status",
];
const ACCOUNT_COLUMNS = [
  "account", "cycle", "opening_balance", "closing_balance",
  "total_income", "total_expenses", "total_transfers_in", "total_transfers_out",
];

export function exportTransactionsCsv(rows: TransactionRow[]): string {
  return toCsv(
    TRANSACTION_COLUMNS,
    rows.map((r) => ({
      date: r.date, type: r.type, amount: r.amount, category: r.category,
      account: r.account, notes: r.notes, cycle_id: r.cycleId,
      cycle_start: r.cycleStart, cycle_end: r.cycleEnd,
    })),
  );
}

export function exportBudgetSummariesCsv(rows: BudgetSummaryRow[]): string {
  return toCsv(
    BUDGET_COLUMNS,
    rows.map((r) => ({
      cycle: r.cycle, category: r.category, budgeted_amount: r.budgetedAmount,
      spent_amount: r.spentAmount, remaining: r.remaining,
      utilisation_pct: r.utilisationPct,
    })),
  );
}

export function exportGoalProgressCsv(rows: GoalProgressRow[]): string {
  return toCsv(
    GOAL_COLUMNS,
    rows.map((r) => ({
      cycle: r.cycle, goal_name: r.goalName, target_amount: r.targetAmount,
      achieved_amount: r.achievedAmount, status: r.status,
    })),
  );
}

export function exportAccountBalancesCsv(rows: AccountBalanceRow[]): string {
  return toCsv(
    ACCOUNT_COLUMNS,
    rows.map((r) => ({
      account: r.account, cycle: r.cycle, opening_balance: r.openingBalance,
      closing_balance: r.closingBalance, total_income: r.totalIncome,
      total_expenses: r.totalExpenses, total_transfers_in: r.totalTransfersIn,
      total_transfers_out: r.totalTransfersOut,
    })),
  );
}
