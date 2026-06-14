"use client";

import { useState, useTransition } from "react";
import { inputClass, labelClass } from "./Sheet";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  findOrCreateCategory,
} from "@/app/actions";

export type Account = { id: string; name: string; icon: string | null };
export type Category = { id: string; name: string; icon: string | null };
export type TxType = "EXPENSE" | "INCOME" | "TRANSFER";

export type EditingTx = {
  id: string;
  type: TxType;
  amount: number;
  date: string;
  notes: string;
  categoryId: string | null;
  accountId: string;
  destinationAccountId: string | null;
};

const today = () => new Date().toISOString().slice(0, 10);

export function TransactionForm({
  accounts,
  categories,
  editing,
  onDone,
}: {
  accounts: Account[];
  categories: Category[];
  editing?: EditingTx;
  onDone: () => void;
}) {
  const [type, setType] = useState<TxType>(editing?.type ?? "EXPENSE");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [accountId, setAccountId] = useState(editing?.accountId ?? accounts[0]?.id ?? "");
  const [destId, setDestId] = useState(
    editing?.destinationAccountId ?? accounts.find((a) => a.id !== (editing?.accountId ?? accounts[0]?.id))?.id ?? "",
  );
  const [categoryQuery, setCategoryQuery] = useState(
    editing?.categoryId ? categories.find((c) => c.id === editing.categoryId)?.name ?? "" : "",
  );
  const [categoryId, setCategoryId] = useState<string | null>(editing?.categoryId ?? null);
  const [date, setDate] = useState(editing?.date ?? today());
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [pending, start] = useTransition();

  const suggestions = categories.filter((c) =>
    c.name.toLowerCase().includes(categoryQuery.toLowerCase()),
  );
  const exactMatch = categories.find(
    (c) => c.name.toLowerCase() === categoryQuery.trim().toLowerCase(),
  );

  function submit() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    start(async () => {
      let catId = categoryId;
      if (type !== "TRANSFER" && !catId && categoryQuery.trim()) {
        catId = await findOrCreateCategory(categoryQuery.trim());
      }
      const payload = {
        type,
        amount: amt,
        date,
        notes,
        categoryId: catId,
        accountId,
        destinationAccountId: type === "TRANSFER" ? destId : null,
      };
      if (editing) await updateTransaction(editing.id, payload);
      else await createTransaction(payload);
      onDone();
    });
  }

  function remove() {
    if (!editing) return;
    start(async () => {
      await deleteTransaction(editing.id);
      onDone();
    });
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-surface p-1">
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

      <div className="space-y-4">
        <div>
          <label className={labelClass}>Amount (LKR)</label>
          <input
            className={`${inputClass} text-2xl font-bold`}
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>{type === "TRANSFER" ? "From Account" : "Account"}</label>
          <select className={inputClass} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
            ))}
          </select>
        </div>

        {type === "TRANSFER" && (
          <div>
            <label className={labelClass}>To Account</label>
            <select className={inputClass} value={destId} onChange={(e) => setDestId(e.target.value)}>
              {accounts.filter((a) => a.id !== accountId).map((a) => (
                <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
              ))}
            </select>
          </div>
        )}

        {type !== "TRANSFER" && (
          <div>
            <label className={labelClass}>Category</label>
            <input
              className={inputClass}
              placeholder="Type or pick a category…"
              value={categoryQuery}
              onChange={(e) => {
                setCategoryQuery(e.target.value);
                setCategoryId(null);
              }}
            />
            {categoryQuery && (
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCategoryId(c.id);
                      setCategoryQuery(c.name);
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      categoryId === c.id ? "bg-accent text-bg" : "bg-surface-2 text-text-muted"
                    }`}
                  >
                    {c.icon} {c.name}
                  </button>
                ))}
                {!exactMatch && categoryQuery.trim() && (
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
                    + Create “{categoryQuery.trim()}”
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <input className={inputClass} placeholder="Optional" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={pending}
          className="w-full rounded-2xl bg-accent py-4 font-semibold text-bg active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {pending ? "Saving…" : editing ? "Save Changes" : "Add Transaction"}
        </button>

        {editing && (
          <button
            onClick={remove}
            disabled={pending}
            className="w-full rounded-2xl border border-danger/40 py-3 text-sm font-semibold text-danger active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            Delete Transaction
          </button>
        )}
      </div>
    </>
  );
}
