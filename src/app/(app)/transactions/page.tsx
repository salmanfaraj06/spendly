import { ScreenHeader } from "@/components/ui";
import { TransactionsView, type TxItem } from "@/components/TransactionsView";
import { requireUserId } from "@/lib/auth";
import {
  getCurrentCycleView,
  getTransactionPage,
  getAccounts,
  getCategories,
} from "@/lib/queries";

export default async function TransactionsPage() {
  const userId = await requireUserId();
  const cycle = await getCurrentCycleView(userId);
  const [txPage, accounts, categories] = await Promise.all([
    getTransactionPage(userId, cycle.id),
    getAccounts(userId),
    getCategories(userId),
  ]);

  const items: TxItem[] = txPage.items;

  return (
    <>
      <ScreenHeader subtitle="Activity" title="Transactions" />
      <TransactionsView
        cycleId={cycle.id}
        items={items}
        nextCursor={txPage.nextCursor}
        accounts={accounts.map((a) => ({ id: a.id, name: a.name, icon: a.icon }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon }))}
      />
    </>
  );
}
