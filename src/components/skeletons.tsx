// Server-safe skeleton primitives (no client JS). Pure Tailwind pulse blocks.
const pulse = "animate-pulse bg-surface-2";
const card = "animate-pulse rounded-[var(--radius-card)] bg-surface";

export function SkelHeader({ back = false }: { back?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-1 pt-2">
      {back && <div className={`h-9 w-9 rounded-xl ${pulse}`} />}
      <div className="space-y-2">
        <div className={`h-3 w-20 rounded-full ${pulse}`} />
        <div className={`h-6 w-36 rounded-full ${pulse}`} />
      </div>
    </div>
  );
}

export function SkelHero() {
  return <div className={`h-36 ${card}`} />;
}

export function SkelCard({ className = "" }: { className?: string }) {
  return <div className={`${card} ${className}`} />;
}

/** A list of row-shaped placeholders inside a card. */
export function SkelList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-3">
      <div className="divide-y divide-border/50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <div className={`h-10 w-10 rounded-2xl ${pulse}`} />
            <div className="flex-1 space-y-1.5">
              <div className={`h-3 w-2/3 rounded-full ${pulse}`} />
              <div className={`h-2.5 w-1/3 rounded-full ${pulse}`} />
            </div>
            <div className={`h-3 w-14 rounded-full ${pulse}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Card rows with a progress bar (budgets, goals). */
export function SkelBars({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-[var(--radius-card)] bg-surface p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-2xl ${pulse}`} />
            <div className="flex-1 space-y-1.5">
              <div className={`h-3 w-1/2 rounded-full ${pulse}`} />
              <div className={`h-2.5 w-1/3 rounded-full ${pulse}`} />
            </div>
          </div>
          <div className={`h-2 w-full rounded-full ${pulse}`} />
        </div>
      ))}
    </div>
  );
}

export function SkelChips() {
  return (
    <div className="flex gap-2 px-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`h-7 w-16 rounded-full ${pulse}`} />
      ))}
    </div>
  );
}
