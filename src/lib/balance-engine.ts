export type TxType = "INCOME" | "EXPENSE" | "TRANSFER";

export type Transaction = {
  type: TxType;
  amount: number;
  accountId: string; // source for EXPENSE/TRANSFER, destination for INCOME
  destinationAccountId?: string | null; // only for TRANSFER
};

/**
 * Current balance of `accountId` = opening balance + net effect of transactions.
 *
 * - INCOME credits its account
 * - EXPENSE debits its account
 * - TRANSFER debits the source account and credits the destination account
 *
 * Derived state — never stored.
 */
export function accountBalance(
  accountId: string,
  openingBalance: number,
  transactions: Transaction[],
): number {
  return transactions.reduce((balance, tx) => {
    switch (tx.type) {
      case "INCOME":
        return tx.accountId === accountId ? balance + tx.amount : balance;
      case "EXPENSE":
        return tx.accountId === accountId ? balance - tx.amount : balance;
      case "TRANSFER": {
        let next = balance;
        if (tx.accountId === accountId) next -= tx.amount;
        if (tx.destinationAccountId === accountId) next += tx.amount;
        return next;
      }
    }
  }, openingBalance);
}
