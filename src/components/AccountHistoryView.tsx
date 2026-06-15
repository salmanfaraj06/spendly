"use client";

import { useMemo, useState, useTransition } from "react";
import { Card } from "./ui";
import { lkr } from "@/lib/format";
import { loadAccountHistoryPage } from "@/app/actions";
import type { AccountHistoryItem } from "@/lib/queries";

export function AccountHistoryView({
  accountId,
  items,
  nextCursor,
}: {
  accountId: string;
  items: AccountHistoryItem[];
  nextCursor: string | null;
}) {
  const [loadedItems, setLoadedItems] = useState(items);
  const [cursor, setCursor] = useState(nextCursor);
  const [pending, startTransition] = useTransition();

  const groups = useMemo(() => {
    const grouped = new Map<string, AccountHistoryItem[]>();
    for (const item of loadedItems) {
      if (!grouped.has(item.date)) grouped.set(item.date, []);
      grouped.get(item.date)!.push(item);
    }
    return [...grouped.entries()];
  }, [loadedItems]);

  if (loadedItems.length === 0) {
    return <Card><p className="text-sm text-text-muted">No transactions for this account yet.</p></Card>;
  }

  return (
    <>
      {groups.map(([date, dayTxs]) => (
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
      ))}

      {cursor && (
        <button
          onClick={() =>
            startTransition(async () => {
              const page = await loadAccountHistoryPage(accountId, cursor);
              setLoadedItems((current) => [...current, ...page.items]);
              setCursor(page.nextCursor);
            })
          }
          disabled={pending}
          className="w-full rounded-2xl border border-border bg-surface py-3 text-sm font-semibold text-text-muted shadow-[var(--shadow-card)] transition-colors active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? "Loading..." : "Load more"}
        </button>
      )}
    </>
  );
}
