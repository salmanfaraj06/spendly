"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRecurringTransaction, deleteRecurringTransaction, updateRecurringTransaction } from "@/app/actions";
import { lkr } from "@/lib/format";
import { Card } from "./ui";
import { Sheet, inputClass, labelClass } from "./Sheet";
import type { Account, Category, TxType } from "./TransactionForm";

type Template = {
  id: string;
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
  dayOfMonth: number | null;
  weekday: number | null;
  anchorDate: string;
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const today = () => new Date().toISOString().slice(0, 10);

export function RecurringTemplatesView({
  templates,
  accounts,
  categories,
}: {
  templates: Template[];
  accounts: Account[];
  categories: Category[];
}) {
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      {templates.length === 0 ? (
        <Card>
          <p className="text-sm font-semibold">No recurring templates yet</p>
          <p className="mt-1 text-sm text-text-muted">
            Add rent, salary, subscriptions, or other repeat items here.
          </p>
        </Card>
      ) : (
        <Card className="p-3">
          <ul className="divide-y divide-border/50">
            {templates.map((t) => (
              <li key={t.id}>
                <button onClick={() => setEditing(t)} className="flex w-full items-center gap-3 py-2.5 text-left active:opacity-70">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-lg">
                    {t.type === "TRANSFER" ? "🔄" : t.categoryIcon ?? "🔁"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.notes || t.categoryName || t.type.toLowerCase()}</p>
                    <p className="text-xs text-text-dim">
                      {scheduleLabel(t)} · {t.type === "TRANSFER" ? `${t.accountName} → ${t.destinationAccountName ?? "Account"}` : t.accountName}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{lkr(t.amount)}</p>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <button onClick={() => setCreating(true)} className="w-full rounded-[var(--radius-card)] border border-dashed border-border bg-surface/40 py-4 text-sm font-medium text-text-muted active:scale-[0.99] transition-transform">
        + New Recurring Template
      </button>

      {editing && (
        <RecurringTemplateSheet
          key={editing.id}
          title="Edit Recurring"
          initial={editing}
          accounts={accounts}
          categories={categories}
          onClose={() => setEditing(null)}
        />
      )}
      {creating && (
        <RecurringTemplateSheet
          title="New Recurring"
          accounts={accounts}
          categories={categories}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  );
}

function RecurringTemplateSheet({
  title,
  initial,
  accounts,
  categories,
  onClose,
}: {
  title: string;
  initial?: Template;
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
}) {
  const [type, setType] = useState<TxType>(initial?.type ?? "EXPENSE");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [accountId, setAccountId] = useState(initial?.accountId ?? accounts[0]?.id ?? "");
  const [destinationAccountId, setDestinationAccountId] = useState(
    initial?.destinationAccountId ?? accounts.find((a) => a.id !== (initial?.accountId ?? accounts[0]?.id))?.id ?? "",
  );
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [frequency, setFrequency] = useState<"MONTHLY" | "WEEKLY">(initial?.frequency ?? "MONTHLY");
  const [dayOfMonth, setDayOfMonth] = useState(String(initial?.dayOfMonth ?? 1));
  const [weekday, setWeekday] = useState(String(initial?.weekday ?? 1));
  const [anchorDate, setAnchorDate] = useState(initial?.anchorDate ?? today());
  const [pending, start] = useTransition();
  const router = useRouter();

  function save() {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || !accountId) return;
    if (type === "TRANSFER" && !destinationAccountId) return;

    const payload = {
      type,
      amount: parsedAmount,
      date: anchorDate,
      accountId,
      destinationAccountId: type === "TRANSFER" ? destinationAccountId : null,
      categoryId: type === "TRANSFER" ? null : categoryId || null,
      notes,
      frequency,
      dayOfMonth: frequency === "MONTHLY" ? Number(dayOfMonth) : null,
      weekday: frequency === "WEEKLY" ? Number(weekday) : null,
      anchorDate,
    };

    start(async () => {
      if (initial) await updateRecurringTransaction(initial.id, payload);
      else await createRecurringTransaction(payload);
      router.refresh();
      onClose();
    });
  }

  function remove() {
    if (!initial) return;
    start(async () => {
      await deleteRecurringTransaction(initial.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <Sheet open onClose={onClose} title={title}>
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
          <label className={labelClass}>Amount (LKR)</label>
          <input className={inputClass} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Frequency</label>
            <select className={inputClass} value={frequency} onChange={(e) => setFrequency(e.target.value as "MONTHLY" | "WEEKLY")}>
              <option value="MONTHLY">Monthly</option>
              <option value="WEEKLY">Weekly</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{frequency === "MONTHLY" ? "Day" : "Weekday"}</label>
            {frequency === "MONTHLY" ? (
              <input className={inputClass} inputMode="numeric" min={1} max={28} value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} />
            ) : (
              <select className={inputClass} value={weekday} onChange={(e) => setWeekday(e.target.value)}>
                {WEEKDAYS.map((day, index) => (
                  <option key={day} value={index}>{day}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>Start date</label>
          <input type="date" className={inputClass} value={anchorDate} onChange={(e) => setAnchorDate(e.target.value)} />
        </div>

        <button onClick={save} disabled={pending || accounts.length === 0} className="w-full rounded-2xl bg-accent py-3.5 font-semibold text-bg active:scale-[0.98] transition-transform disabled:opacity-50">
          {pending ? "Saving…" : "Save"}
        </button>
        {initial && (
          <button onClick={remove} disabled={pending} className="w-full rounded-2xl border border-danger/40 py-3 text-sm font-semibold text-danger active:scale-[0.98] transition-transform disabled:opacity-50">
            Delete Template
          </button>
        )}
      </div>
    </Sheet>
  );
}

function scheduleLabel(template: Pick<Template, "frequency" | "dayOfMonth" | "weekday">) {
  if (template.frequency === "MONTHLY") return `Monthly on day ${template.dayOfMonth ?? 1}`;
  return `Weekly on ${WEEKDAYS[template.weekday ?? 0]}`;
}
