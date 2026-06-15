import Link from "next/link";
import { notFound } from "next/navigation";
import { HeroCard } from "@/components/ui";
import { AccountHistoryView } from "@/components/AccountHistoryView";
import { lkr } from "@/lib/format";
import { requireUserId } from "@/lib/auth";
import { getAccountWithHistory } from "@/lib/queries";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  const data = await getAccountWithHistory(userId, id);
  if (!data) notFound();
  const { account, txs, nextCursor } = data;

  return (
    <>
      <header className="flex items-center gap-3 px-1 pt-2">
        <Link href="/accounts" className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-text-muted active:scale-95" aria-label="Back">
          ‹
        </Link>
        <h1 className="text-xl font-bold tracking-tight">{account.icon} {account.name}</h1>
      </header>

      <HeroCard>
        <p className="text-xs font-medium uppercase tracking-widest text-on-hero/70">Current Balance</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight">{lkr(account.balance)}</p>
        <p className="text-xs text-on-hero/70">Opening {lkr(account.openingBalance)}</p>
      </HeroCard>

      <AccountHistoryView accountId={account.id} items={txs} nextCursor={nextCursor} />
    </>
  );
}
