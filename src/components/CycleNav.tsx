"use client";

import Link from "next/link";
import { formatDate } from "@/lib/format";

/**
 * Prev/next cycle navigator. Boundaries are passed in (computed server-side
 * via CycleEngine); links carry the target start date as `?cycle=`.
 */
export function CycleNav({
  basePath,
  startDate,
  endDate,
  prevStart,
  nextStart,
  isCurrent,
}: {
  basePath: string;
  startDate: string;
  endDate: string;
  prevStart: string;
  nextStart: string;
  isCurrent: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-2 py-2">
      <Link href={`${basePath}?cycle=${prevStart}`} className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-text-muted active:scale-95" aria-label="Previous cycle">
        ‹
      </Link>
      <div className="text-center">
        <p className="text-xs font-semibold">
          {formatDate(new Date(startDate))} – {formatDate(new Date(endDate))}
        </p>
        <p className="text-[10px] text-text-dim">{isCurrent ? "Current cycle" : "Past cycle"}</p>
      </div>
      <Link
        href={isCurrent ? basePath : `${basePath}?cycle=${nextStart}`}
        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 ${isCurrent ? "text-text-dim opacity-40" : "text-text-muted active:scale-95"}`}
        aria-label="Next cycle"
      >
        ›
      </Link>
    </div>
  );
}
