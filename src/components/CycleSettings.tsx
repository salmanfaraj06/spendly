"use client";

import { useState, useTransition } from "react";
import { Card } from "./ui";
import { inputClass, labelClass } from "./Sheet";
import { updateCycleStartDay } from "@/app/actions";

export function CycleSettings({
  currentStartDay,
  nextCycleStart,
}: {
  currentStartDay: number;
  nextCycleStart: string;
}) {
  const [day, setDay] = useState(currentStartDay);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      await updateCycleStartDay(day);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <Card>
      <p className="text-sm font-semibold">Finance Cycle Start Day</p>
      <p className="mt-1 text-xs text-text-muted">
        Your cycle currently starts on day <b>{currentStartDay}</b>. Changing it applies from the next
        cycle ({nextCycleStart}) onward — past cycles are never affected.
      </p>
      <div className="mt-3">
        <label className={labelClass}>New start day (1–28)</label>
        <input
          type="number"
          min={1}
          max={28}
          className={inputClass}
          value={day}
          onChange={(e) => setDay(Math.min(28, Math.max(1, Number(e.target.value) || 1)))}
        />
      </div>
      <button
        onClick={save}
        disabled={pending || day === currentStartDay}
        className="mt-3 w-full rounded-2xl bg-accent py-3 font-semibold text-bg active:scale-[0.98] transition-transform disabled:opacity-40"
      >
        {pending ? "Saving…" : saved ? "Saved ✓" : "Update Cycle Day"}
      </button>
    </Card>
  );
}
