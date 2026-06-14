"use client";

import { useMemo, useState } from "react";
import { Card } from "./ui";
import { Sheet } from "./Sheet";
import { AddTransaction } from "./AddTransaction";
import { TransactionForm, type Account, type Category, type EditingTx } from "./TransactionForm";
import { lkr } from "@/lib/format";

export type TxItem = {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  date: string;
  notes: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  accountId: string;
  accountName: string;
  destinationAccountId: string | null;
  destinationAccountName: string | null;
};

type Filter = "All" | "Income" | "Expense" | "Transfer";

export function TransactionsView({
  items,
  accounts,
  categories,
}: {
  items: TxItem[];
  accounts: Account[];
  categories: Category[];
}) {
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<EditingTx | null>(null);

  const filtered = useMemo(() => {
    return items.filter((t) => {
      if (filter === "Income" && t.type !== "INCOME") return false;
      if (filter === "Expense" && t.type !== "EXPENSE") return false;
      if (filter === "Transfer" && t.type !== "TRANSFER") return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${t.notes} ${t.categoryName ?? ""} ${t.accountName} ${t.amount}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, filter, search]);

  const groups = useMemo(() => {
    const m = new Map<string, TxItem[]>();
    for (const t of filtered) {
      if (!m.has(t.date)) m.set(t.date, []);
      m.get(t.date)!.push(t);
    }
    return [...m.entries()];
  }, [filtered]);

  return (
    <>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search notes, amount, category…"
        className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm shadow-[var(--shadow-card)] placeholder:text-text-dim transition-colors focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      />

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">
        {(["All", "Income", "Expense", "Transfer"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
              filter === f ? "bg-accent text-bg" : "border border-border bg-surface text-text-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <p className="text-sm text-text-muted">
            {items.length === 0
              ? "No transactions this cycle yet. Tap + to add your first one."
              : "No transactions match your filter."}
          </p>
        </Card>
      ) : (
        groups.map(([date, dayTxs]) => (
          <div key={date} className="space-y-2">
            <p className="px-1 text-xs font-medium uppercase tracking-wider text-text-dim">{date}</p>
            <Card className="p-3">
              <ul className="divide-y divide-border/50">
                {dayTxs.map((t) => {
                  const isIncome = t.type === "INCOME";
                  const isTransfer = t.type === "TRANSFER";
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() =>
                          setEditing({
                            id: t.id,
                            type: t.type,
                            amount: t.amount,
                            date: t.date,
                            notes: t.notes,
                            categoryId: t.categoryId,
                            accountId: t.accountId,
                            destinationAccountId: t.destinationAccountId,
                          })
                        }
                        className="flex w-full items-center gap-3 py-2.5 text-left active:opacity-70"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg" style={{ background: `${t.categoryColor ?? "#34d399"}22` }}>
                          {isTransfer ? "🔄" : t.categoryIcon ?? "💸"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{t.notes || (isTransfer ? "Transfer" : t.categoryName)}</p>
                          <p className="text-xs text-text-dim">
                            {isTransfer
                              ? `${t.accountName} → ${t.destinationAccountName}`
                              : `${t.categoryName ?? "Uncategorised"} · ${t.accountName}`}
                          </p>
                        </div>
                        <p className={`text-sm font-semibold ${isIncome ? "text-accent" : isTransfer ? "text-text-muted" : ""}`}>
                          {isIncome ? "+" : isTransfer ? "" : "-"}{lkr(t.amount)}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        ))
      )}

      <AddTransaction accounts={accounts} categories={categories} />

      <Sheet open={!!editing} onClose={() => setEditing(null)} title="Edit Transaction">
        {editing && (
          <TransactionForm
            accounts={accounts}
            categories={categories}
            editing={editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Sheet>
    </>
  );
}
