"use client";

import { useState, useTransition } from "react";
import { Card } from "./ui";
import { Sheet, inputClass, labelClass } from "./Sheet";
import { lkr } from "@/lib/format";
import { updateAccount, deleteAccount } from "@/app/actions";

type Acc = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  openingBalance: number;
  balance: number;
};

const ICONS = ["💵", "🏦", "💳", "📱", "🪙", "💼", "🏧", "💰"];
const COLORS = ["#34d399", "#6ee7b7", "#a3e635", "#3b82f6", "#ec4899", "#eab308"];

export function AccountCard({ account }: { account: Acc }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(account.name);
  const [icon, setIcon] = useState(account.icon ?? ICONS[0]);
  const [color, setColor] = useState(account.color ?? COLORS[0]);
  const [opening, setOpening] = useState(String(account.openingBalance));
  const [pending, start] = useTransition();

  function save() {
    if (!name.trim()) return;
    start(async () => {
      await updateAccount(account.id, { name, icon, color, openingBalance: parseFloat(opening) || 0 });
      setOpen(false);
    });
  }
  function remove() {
    start(async () => {
      await deleteAccount(account.id);
      setOpen(false);
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="w-full text-left active:opacity-80">
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl" style={{ background: `${account.color ?? "#34d399"}22` }}>
            {account.icon ?? "💼"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{account.name}</p>
            <p className="text-xs text-text-dim">Opening {lkr(account.openingBalance)}</p>
          </div>
          <p className="text-base font-bold">{lkr(account.balance)}</p>
        </Card>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Edit Account">
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button key={i} onClick={() => setIcon(i)} className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${icon === i ? "bg-accent/20 ring-2 ring-accent" : "bg-surface"}`}>{i}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Colour</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} className={`h-9 w-9 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-offset-bg-elevated ring-white" : ""}`} style={{ background: c }} />
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Opening Balance (LKR)</label>
            <input className={inputClass} inputMode="decimal" value={opening} onChange={(e) => setOpening(e.target.value)} />
          </div>
          <button onClick={save} disabled={pending} className="w-full rounded-2xl bg-accent py-3.5 font-semibold text-bg active:scale-[0.98] transition-transform disabled:opacity-50">
            {pending ? "Saving…" : "Save Changes"}
          </button>
          <button onClick={remove} disabled={pending} className="w-full rounded-2xl border border-danger/40 py-3 text-sm font-semibold text-danger active:scale-[0.98] transition-transform disabled:opacity-50">
            Delete Account
          </button>
        </div>
      </Sheet>
    </>
  );
}
