"use client";

import { useState } from "react";
import { Card } from "./ui";
import { inputClass, labelClass } from "./Sheet";

const TYPES = [
  ["transactions", "Transactions"],
  ["budgets", "Budgets"],
  ["goals", "Goals"],
  ["accounts", "Accounts"],
] as const;

export function ExportPanel() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const qs = () => {
    const p = new URLSearchParams();
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <Card>
      <p className="text-sm font-semibold">Export Data (CSV)</p>
      <p className="mt-1 text-xs text-text-muted">Optionally filter by date range.</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>From</label>
          <input type="date" className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>To</label>
          <input type="date" className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {TYPES.map(([type, label]) => (
          <a
            key={type}
            href={`/api/export/${type}${qs()}`}
            className="rounded-2xl border border-border bg-surface py-2.5 text-center text-sm font-medium text-text-muted active:scale-[0.98]"
          >
            {label}
          </a>
        ))}
      </div>
    </Card>
  );
}
