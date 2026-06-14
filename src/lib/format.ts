/** Format a number as LKR currency: `LKR 12,500.00`. */
export function lkr(amount: number): string {
  return `LKR ${amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Compact form for large headline figures: `LKR 1.2M`, `LKR 45.0K`. */
export function lkrCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `LKR ${(amount / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `LKR ${(amount / 1_000).toFixed(1)}K`;
  return lkr(amount);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
