"use client";

import { useState, useTransition } from "react";
import { Card, ProgressBar, Pill } from "./ui";
import { Sheet, inputClass, labelClass } from "./Sheet";
import { lkr } from "@/lib/format";
import { updateGoalProgress } from "@/app/actions";

export type GoalItem = {
  id: string;
  name: string;
  targetAmountLkr: number;
  achievedAmountLkr: number;
  status: "ACTIVE" | "ACHIEVED" | "MISSED";
};

export function GoalCard({ goal }: { goal: GoalItem }) {
  const [open, setOpen] = useState(false);
  const [achieved, setAchieved] = useState(String(goal.achievedAmountLkr));
  const [pending, start] = useTransition();

  const pct = goal.targetAmountLkr > 0 ? Math.round((goal.achievedAmountLkr / goal.targetAmountLkr) * 100) : 0;
  const done = goal.status === "ACHIEVED";
  const missed = goal.status === "MISSED";

  function save(status?: "ACTIVE" | "ACHIEVED" | "MISSED") {
    start(async () => {
      await updateGoalProgress(goal.id, parseFloat(achieved) || 0, status);
      setOpen(false);
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="w-full text-left active:opacity-80">
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">{goal.name}</p>
            <Pill tone={done ? "up" : missed ? "down" : "muted"}>
              {done ? "Achieved ✓" : missed ? "Missed" : `${pct}%`}
            </Pill>
          </div>
          <ProgressBar pct={pct} state={missed ? "over" : "ok"} />
          <div className="mt-2 flex justify-between text-xs text-text-muted">
            <span>{lkr(goal.achievedAmountLkr)}</span>
            <span>{lkr(goal.targetAmountLkr)}</span>
          </div>
        </Card>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={goal.name}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Amount Saved (LKR)</label>
            <input className={inputClass} inputMode="decimal" value={achieved} onChange={(e) => setAchieved(e.target.value)} />
            <p className="mt-1 text-xs text-text-dim">Target {lkr(goal.targetAmountLkr)}</p>
          </div>
          <button onClick={() => save()} disabled={pending} className="w-full rounded-2xl bg-accent py-3.5 font-semibold text-bg active:scale-[0.98] transition-transform disabled:opacity-50">
            {pending ? "Saving…" : "Update Progress"}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => save("ACHIEVED")} disabled={pending} className="rounded-2xl border border-accent/40 py-3 text-sm font-semibold text-accent active:scale-[0.98] transition-transform disabled:opacity-50">
              Mark Achieved
            </button>
            <button onClick={() => save("MISSED")} disabled={pending} className="rounded-2xl border border-danger/40 py-3 text-sm font-semibold text-danger active:scale-[0.98] transition-transform disabled:opacity-50">
              Mark Missed
            </button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
