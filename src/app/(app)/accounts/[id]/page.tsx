import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, HeroCard } from "@/components/ui";
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
  const { account, txs } = data;

  // group by date
  const groups = new Map<string, typeof txs>();
  for (const t of txs) {
    if (!groups.has(t.date)) groups.set(t.date, []);
    groups.get(t.date)!.push(t);
  }

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

      {txs.length === 0 ? (
        <Card><p className="text-sm text-text-muted">No transactions for this account yet.</p></Card>
      ) : (
        [...groups.entries()].map(([date, dayTxs]) => (
          <div key={date} className="space-y-2">
            <p className="px-1 text-xs font-medium uppercase tracking-wider text-text-dim">{date}</p>
            <Card className="p-3">
              <ul className="divide-y divide-border/50">
                {dayTxs.map((t) => {
                  const isIn = t.direction === "in";
                  const isTransfer = t.type === "TRANSFER";
                  return (
                    <li key={t.id} className="flex items-center gap-3 py-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg" style={{ background: `${(t.category?.color ?? "#16a35a")}22` }}>
                        {isTransfer ? "🔄" : t.category?.icon ?? "💸"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{t.notes || (isTransfer ? `Transfer ${isIn ? "from" : "to"} ${t.counterparty}` : t.category?.name)}</p>
                        <p className="text-xs text-text-dim">{isTransfer ? `${isIn ? "In from" : "Out to"} ${t.counterparty}` : t.category?.name}</p>
                      </div>
                      <p className={`text-sm font-semibold ${isIn ? "text-accent" : ""}`}>
                        {isIn ? "+" : "-"}{lkr(t.amount)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        ))
      )}
    </>
  );
}
