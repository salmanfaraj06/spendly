export type Frequency = "MONTHLY" | "WEEKLY";

export type RecurringSchedule = {
  frequency: Frequency;
  dayOfMonth?: number; // 1..28, required for MONTHLY
  weekday?: number; // 0..6 (Sun..Sat), required for WEEKLY
  anchorDate: Date; // recurrence does not produce dates before this
};

const DAY = 24 * 60 * 60 * 1000;
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));

/**
 * All occurrence dates for `schedule` within [windowStart, windowEnd) (both UTC
 * midnight), excluding any in `handled` (already confirmed or skipped) and any
 * before the anchor. Pure — no I/O.
 */
export function dueOccurrences(
  schedule: RecurringSchedule,
  windowStart: Date,
  windowEnd: Date,
  handled: Date[] = [],
): Date[] {
  const handledSet = new Set(handled.map((d) => d.getTime()));
  const anchor = schedule.anchorDate.getTime();
  const out: Date[] = [];

  const start = windowStart.getTime() < anchor ? schedule.anchorDate : windowStart;

  if (schedule.frequency === "MONTHLY") {
    const day = schedule.dayOfMonth ?? 1;
    let y = start.getUTCFullYear();
    let m = start.getUTCMonth();
    // Walk month by month from the window start.
    for (let guard = 0; guard < 600; guard++) {
      const date = utc(y, m, day);
      if (date.getTime() >= windowEnd.getTime()) break;
      if (date.getTime() >= start.getTime() && date.getTime() >= anchor) {
        if (!handledSet.has(date.getTime())) out.push(date);
      }
      m += 1;
      if (m > 11) { m = 0; y += 1; }
    }
  } else {
    const weekday = schedule.weekday ?? 0;
    // First on-or-after window start matching the weekday.
    let cursor = new Date(start.getTime());
    cursor.setUTCHours(0, 0, 0, 0);
    const delta = (weekday - cursor.getUTCDay() + 7) % 7;
    cursor = new Date(cursor.getTime() + delta * DAY);
    while (cursor.getTime() < windowEnd.getTime()) {
      if (cursor.getTime() >= anchor && !handledSet.has(cursor.getTime())) {
        out.push(new Date(cursor.getTime()));
      }
      cursor = new Date(cursor.getTime() + 7 * DAY);
    }
  }

  return out;
}
