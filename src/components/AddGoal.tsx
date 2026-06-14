"use client";

import { useState, useTransition } from "react";
import { Sheet, inputClass, labelClass } from "./Sheet";
import { createGoal } from "@/app/actions";

export function AddGoal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    if (!name.trim() || !parseFloat(target)) return;
    start(async () => {
      await createGoal({ name: name.trim(), targetAmountLkr: parseFloat(target) });
      setName("");
      setTarget("");
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-28 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-bg shadow-[0_8px_30px_rgba(52,211,153,0.4)] active:scale-95 transition-transform"
        aria-label="Add goal"
      >
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="New Goal">
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Goal Name</label>
            <input className={inputClass} placeholder="e.g. Emergency Fund" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Target Amount (LKR)</label>
            <input className={inputClass} inputMode="decimal" placeholder="0.00" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <button onClick={submit} disabled={pending} className="w-full rounded-2xl bg-accent py-4 font-semibold text-bg active:scale-[0.98] transition-transform disabled:opacity-50">
            {pending ? "Saving…" : "Create Goal"}
          </button>
        </div>
      </Sheet>
    </>
  );
}
