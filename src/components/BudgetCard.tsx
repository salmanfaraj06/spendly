"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, ProgressBar, Pill } from "./ui";
import { Sheet, inputClass, labelClass } from "./Sheet";
import { lkr } from "@/lib/format";
import { overrideCycleBudget } from "@/app/actions";

export type BudgetItem = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  budgetedLkr: number;
  spentLkr: number;
  remainingLkr: number;
  utilisationPct: number;
  state: "ok" | "near" | "over";
};

export function BudgetCard({ item, cycleId }: { item: BudgetItem; cycleId: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(item.budgetedLkr));
  const [pending, start] = useTransition();
  const router = useRouter();

  function save() {
    start(async () => {
      await overrideCycleBudget(cycleId, item.categoryId, parseFloat(amount) || 0);
      router.refresh();
      setOpen(false);
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="w-full text-left active:opacity-80">
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg" style={{ background: `${item.categoryColor ?? "#34d399"}22` }}>
              {item.categoryIcon ?? "🏷️"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{item.categoryName}</p>
              <p className="text-xs text-text-dim">{lkr(item.spentLkr)} of {lkr(item.budgetedLkr)}</p>
            </div>
            <Pill tone={item.state === "over" ? "down" : item.state === "near" ? "muted" : "up"}>
              {Number.isFinite(item.utilisationPct) ? `${item.utilisationPct}%` : "—"}
            </Pill>
          </div>
          <ProgressBar pct={item.utilisationPct} state={item.state} />
          {item.state === "over" && <p className="mt-2 text-xs text-danger">Over budget by {lkr(Math.abs(item.remainingLkr))}</p>}
          {item.state === "near" && <p className="mt-2 text-xs text-warn">Close to your limit · {lkr(item.remainingLkr)} left</p>}
        </Card>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={`Override · ${item.categoryName}`}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Budget for this cycle only (LKR)</label>
            <input className={inputClass} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <p className="mt-1 text-xs text-text-dim">Overrides the template for this cycle. The template carries on unchanged.</p>
          </div>
          <button onClick={save} disabled={pending} className="w-full rounded-2xl bg-accent py-3.5 font-semibold text-bg active:scale-[0.98] transition-transform disabled:opacity-50">
            {pending ? "Saving…" : "Save Override"}
          </button>
        </div>
      </Sheet>
    </>
  );
}
