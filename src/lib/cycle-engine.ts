export type CycleConfig = { startDay: number; effectiveFrom: Date };
export type FinanceCycle = { start: Date; end: Date };

const utc = (y: number, m: number, day: number) =>
  new Date(Date.UTC(y, m, day, 0, 0, 0, 0));

/** The config in effect on `date`: the latest one whose effectiveFrom ≤ date. */
function activeConfig(configs: CycleConfig[], date: Date): CycleConfig {
  return configs
    .filter((c) => c.effectiveFrom.getTime() <= date.getTime())
    .reduce((a, b) => (a.effectiveFrom > b.effectiveFrom ? a : b));
}

/**
 * Resolve the Finance Cycle containing `date`.
 * Cycle is half-open: [start inclusive, end exclusive).
 */
export function resolveCycle(
  configs: CycleConfig[],
  date: Date,
): FinanceCycle {
  const startDay = activeConfig(configs, date).startDay;
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();

  // The cycle starting in this calendar month begins on `startDay`.
  // If `date` is before that, the active cycle started last month.
  let start: Date;
  if (date.getUTCDate() >= startDay) {
    start = utc(y, m, startDay);
  } else {
    start = utc(y, m - 1, startDay);
  }
  const end = utc(
    start.getUTCFullYear(),
    start.getUTCMonth() + 1,
    startDay,
  );
  return { start, end };
}

/** The cycle immediately after `cycle`, honouring any config change at the boundary. */
export function nextCycle(
  configs: CycleConfig[],
  cycle: FinanceCycle,
): FinanceCycle {
  // `cycle.end` is exclusive, so it's the first instant of the next cycle.
  return resolveCycle(configs, cycle.end);
}

/** The cycle immediately before `cycle`. */
export function previousCycle(
  configs: CycleConfig[],
  cycle: FinanceCycle,
): FinanceCycle {
  // One day before the start is inside the prior cycle.
  const dayBefore = new Date(cycle.start.getTime() - 24 * 60 * 60 * 1000);
  return resolveCycle(configs, dayBefore);
}
