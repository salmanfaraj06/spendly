"use client";

import { useState, useTransition } from "react";
import { Sheet, inputClass, labelClass } from "./Sheet";
import { setBudgetTemplate } from "@/app/actions";

type Category = { id: string; name: string; icon: string | null };

export function SetBudget({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    if (!categoryId || !parseFloat(amount)) return;
    start(async () => {
      await setBudgetTemplate(categoryId, parseFloat(amount));
      setAmount("");
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-28 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-bg shadow-[0_8px_30px_rgba(52,211,153,0.4)] active:scale-95 transition-transform"
        aria-label="Set budget"
      >
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Set Category Budget">
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Category</label>
            <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Monthly Budget (LKR)</label>
            <input className={inputClass} inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <p className="text-xs text-text-dim">Applies every cycle. You can override a single cycle later.</p>
          <button onClick={submit} disabled={pending} className="w-full rounded-2xl bg-accent py-4 font-semibold text-bg active:scale-[0.98] transition-transform disabled:opacity-50">
            {pending ? "Saving…" : "Save Budget"}
          </button>
        </div>
      </Sheet>
    </>
  );
}
