"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sheet, inputClass, labelClass } from "./Sheet";
import { createAccount } from "@/app/actions";

const ICONS = ["💵", "🏦", "💳", "📱", "🪙", "💼", "🏧", "💰"];
const COLORS = ["#34d399", "#6ee7b7", "#a3e635", "#3b82f6", "#ec4899", "#eab308"];

export function AddAccount() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [opening, setOpening] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit() {
    if (!name.trim()) return;
    start(async () => {
      await createAccount({
        name: name.trim(),
        icon,
        color,
        openingBalance: parseFloat(opening) || 0,
      });
      router.refresh();
      setName("");
      setOpening("");
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-[var(--radius-card)] border border-dashed border-border bg-surface/40 py-4 text-sm font-medium text-text-muted active:scale-[0.99] transition-transform"
      >
        + Add Account
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="New Account">
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input className={inputClass} placeholder="e.g. Commercial Bank" value={name} onChange={(e) => setName(e.target.value)} />
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
            <input className={inputClass} inputMode="decimal" placeholder="0.00" value={opening} onChange={(e) => setOpening(e.target.value)} />
          </div>
          <button onClick={submit} disabled={pending} className="w-full rounded-2xl bg-accent py-4 font-semibold text-bg active:scale-[0.98] transition-transform disabled:opacity-50">
            {pending ? "Saving…" : "Create Account"}
          </button>
        </div>
      </Sheet>
    </>
  );
}
