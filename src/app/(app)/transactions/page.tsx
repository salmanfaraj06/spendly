import { ScreenHeader } from "@/components/ui";
import { TransactionsView, type TxItem } from "@/components/TransactionsView";
import { requireUserId } from "@/lib/auth";
import {
  getCurrentCycleView,
  getTransactions,
  getAccounts,
  getCategories,
} from "@/lib/queries";

export default async function TransactionsPage() {
  const userId = await requireUserId();
  const cycle = await getCurrentCycleView(userId);
  const [txs, accounts, categories] = await Promise.all([
    getTransactions(userId, cycle.id),
    getAccounts(userId),
    getCategories(userId),
  ]);

  const items: TxItem[] = txs.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    date: t.date,
    notes: t.notes,
    categoryId: t.category?.id ?? null,
    categoryName: t.category?.name ?? null,
    categoryIcon: t.category?.icon ?? null,
    categoryColor: t.category?.color ?? null,
    accountId: t.account.id,
    accountName: t.account.name,
    destinationAccountId: t.destinationAccount?.id ?? null,
    destinationAccountName: t.destinationAccount?.name ?? null,
  }));

  return (
    <>
      <ScreenHeader subtitle="Activity" title="Transactions" />
      <TransactionsView
        items={items}
        accounts={accounts.map((a) => ({ id: a.id, name: a.name, icon: a.icon }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon }))}
      />
    </>
  );
}
