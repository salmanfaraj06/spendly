"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmRecurringOccurrence, skipRecurringOccurrence } from "@/app/actions";
import { lkr } from "@/lib/format";
import { Card } from "./ui";
import { Sheet, inputClass, labelClass } from "./Sheet";
import type { Account, Category, TxType } from "./TransactionForm";

type DueOccurrence = {
  recurringTransactionId: string;
  dueDate: string;
  type: TxType;
  amount: number;
  accountId: string;
  accountName: string;
  destinationAccountId: string | null;
  destinationAccountName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  notes: string;
  frequency: "MONTHLY" | "WEEKLY";
};

export function DueOccurrencesView({
  occurrences,
  accounts,
  categories,
}: {
  occurrences: DueOccurrence[];
  accounts: Account[];
  categories: Category[];
}) {
  const [editing, setEditing] = useState<DueOccurrence | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function key(o: DueOccurrence) {
    return `${o.recurringTransactionId}:${o.dueDate}`;
  }

  function confirm(o: DueOccurrence) {
    const id = key(o);
    setPendingId(id);
    start(async () => {
      await confirmRecurringOccurrence(o.recurringTransactionId, o.dueDate);
      router.refresh();
      setPendingId(null);
    });
  }

  function skip(o: DueOccurrence) {
    const id = key(o);
    setPendingId(id);
    start(async () => {
      await skipRecurringOccurrence(o.recurringTransactionId, o.dueDate);
      router.refresh();
      setPendingId(null);
    });
  }

  if (occurrences.length === 0) {
    return (
      <Card>
        <p className="text-sm font-semibold">Nothing due</p>
        <p className="mt-1 text-sm text-text-muted">Recurring items you confirm or skip will disappear from here.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {occurrences.map((o) => {
          const id = key(o);
          return (
            <Card key={id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-lg">
                  {o.type === "TRANSFER" ? "🔄" : o.categoryIcon ?? "🔁"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{o.notes || o.categoryName || o.type.toLowerCase()}</p>
                  <p className="text-xs text-text-dim">
                    Due {o.dueDate} · {o.type === "TRANSFER" ? `${o.accountName} → ${o.destinationAccountName ?? "Account"}` : o.accountName}
                  </p>
                </div>
                <p className="text-sm font-bold">{lkr(o.amount)}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => confirm(o)} disabled={pending && pendingId === id} className="rounded-xl bg-accent py-2.5 text-sm font-semibold text-bg disabled:opacity-50">
                  {pending && pendingId === id ? "Posting…" : "Confirm"}
                </button>
                <button onClick={() => setEditing(o)} disabled={pending} className="rounded-xl bg-surface-2 py-2.5 text-sm font-semibold">
                  Edit
                </button>
                <button onClick={() => skip(o)} disabled={pending && pendingId === id} className="rounded-xl border border-border py-2.5 text-sm font-semibold text-text-muted disabled:opacity-50">
                  Skip
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title="Edit Before Posting">
        {editing && (
          <DueOccurrenceForm
            occurrence={editing}
            accounts={accounts}
            categories={categories}
            onDone={() => setEditing(null)}
          />
        )}
      </Sheet>
    </>
  );
}

function DueOccurrenceForm({
  occurrence,
  accounts,
  categories,
  onDone,
}: {
  occurrence: DueOccurrence;
  accounts: Account[];
  categories: Category[];
  onDone: () => void;
}) {
  const [type, setType] = useState<TxType>(occurrence.type);
  const [amount, setAmount] = useState(String(occurrence.amount));
  const [accountId, setAccountId] = useState(occurrence.accountId);
  const [destinationAccountId, setDestinationAccountId] = useState(
    occurrence.destinationAccountId ?? accounts.find((a) => a.id !== occurrence.accountId)?.id ?? "",
  );
  const [categoryId, setCategoryId] = useState(occurrence.categoryId ?? "");
  const [notes, setNotes] = useState(occurrence.notes);
  const [pending, start] = useTransition();
  const router = useRouter();

  function post() {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || !accountId) return;
    if (type === "TRANSFER" && !destinationAccountId) return;
    start(async () => {
      await confirmRecurringOccurrence(occurrence.recurringTransactionId, occurrence.dueDate, {
        type,
        amount: parsedAmount,
        accountId,
        destinationAccountId: type === "TRANSFER" ? destinationAccountId : null,
        categoryId: type === "TRANSFER" ? null : categoryId || null,
        notes,
      });
      router.refresh();
      onDone();
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-surface p-1">
        {(["EXPENSE", "INCOME", "TRANSFER"] as TxType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-xl py-2 text-sm font-semibold capitalize transition-colors ${
              type === t ? "bg-accent text-bg" : "text-text-muted"
            }`}
          >
            {t.toLowerCase()}
          </button>
        ))}
      </div>

      <div>
        <label className={labelClass}>Due date</label>
        <input className={inputClass} value={occurrence.dueDate} disabled />
      </div>

      <div>
        <label className={labelClass}>Amount (LKR)</label>
        <input className={inputClass} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>{type === "TRANSFER" ? "From Account" : "Account"}</label>
        <select className={inputClass} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
          ))}
        </select>
      </div>

      {type === "TRANSFER" ? (
        <div>
          <label className={labelClass}>To Account</label>
          <select className={inputClass} value={destinationAccountId} onChange={(e) => setDestinationAccountId(e.target.value)}>
            {accounts.filter((a) => a.id !== accountId).map((a) => (
              <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className={labelClass}>Category</label>
          <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Uncategorised</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={labelClass}>Notes</label>
        <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
      </div>

      <button onClick={post} disabled={pending} className="w-full rounded-2xl bg-accent py-3.5 font-semibold text-bg active:scale-[0.98] transition-transform disabled:opacity-50">
        {pending ? "Posting…" : "Post Transaction"}
      </button>
    </div>
  );
}
