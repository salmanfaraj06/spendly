import { ScreenHeader, HeroCard } from "@/components/ui";
import { AddAccount } from "@/components/AddAccount";
import { AccountCard } from "@/components/AccountCard";
import { lkr } from "@/lib/format";
import { requireUserId } from "@/lib/auth";
import { getAccounts } from "@/lib/queries";

export default async function AccountsPage() {
  const userId = await requireUserId();
  const accounts = await getAccounts(userId);
  const total = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <>
      <ScreenHeader subtitle="Wallets" title="Accounts" />

      <HeroCard>
        <p className="text-xs font-medium uppercase tracking-widest text-on-hero/70">Net Worth</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight">{lkr(total)}</p>
        <p className="text-xs text-on-hero/70">across {accounts.length} account{accounts.length === 1 ? "" : "s"}</p>
      </HeroCard>

      {accounts.length > 0 && (
        <div className="space-y-3">
          {accounts.map((a) => (
            <AccountCard key={a.id} account={a} />
          ))}
        </div>
      )}

      <AddAccount />
    </>
  );
}
