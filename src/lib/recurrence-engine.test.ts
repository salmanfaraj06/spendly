import { describe, it, expect } from "vitest";
import { dueOccurrences, type RecurringSchedule } from "./recurrence-engine";

const d = (iso: string) => new Date(iso + "T00:00:00.000Z");

describe("RecurrenceEngine — monthly", () => {
  const base: RecurringSchedule = {
    frequency: "MONTHLY",
    dayOfMonth: 25,
    anchorDate: d("2026-01-01"),
  };

  it("produces the day-25 occurrence inside a window", () => {
    const out = dueOccurrences(base, d("2026-03-01"), d("2026-04-01"));
    expect(out).toEqual([d("2026-03-25")]);
  });

  it("produces one occurrence per month across a multi-month window", () => {
    const out = dueOccurrences(base, d("2026-03-01"), d("2026-06-01"));
    expect(out).toEqual([d("2026-03-25"), d("2026-04-25"), d("2026-05-25")]);
  });

  it("spans a year boundary", () => {
    const out = dueOccurrences(base, d("2026-12-01"), d("2027-02-01"));
    expect(out).toEqual([d("2026-12-25"), d("2027-01-25")]);
  });

  it("handles day 28 in February without rollover", () => {
    const feb: RecurringSchedule = { frequency: "MONTHLY", dayOfMonth: 28, anchorDate: d("2026-01-01") };
    const out = dueOccurrences(feb, d("2026-02-01"), d("2026-03-01"));
    expect(out).toEqual([d("2026-02-28")]);
  });

  it("never produces dates before the anchor", () => {
    const anchored: RecurringSchedule = { frequency: "MONTHLY", dayOfMonth: 25, anchorDate: d("2026-03-10") };
    const out = dueOccurrences(anchored, d("2026-01-01"), d("2026-05-01"));
    expect(out).toEqual([d("2026-03-25"), d("2026-04-25")]);
  });

  it("excludes already-handled occurrences (no double-post)", () => {
    const out = dueOccurrences(base, d("2026-03-01"), d("2026-06-01"), [d("2026-04-25")]);
    expect(out).toEqual([d("2026-03-25"), d("2026-05-25")]);
  });
});

describe("RecurrenceEngine — weekly", () => {
  const weekly: RecurringSchedule = {
    frequency: "WEEKLY",
    weekday: 1, // Monday
    anchorDate: d("2026-01-01"),
  };

  it("produces every matching weekday in the window", () => {
    // March 2026: Mondays are 2, 9, 16, 23, 30
    const out = dueOccurrences(weekly, d("2026-03-01"), d("2026-03-24"));
    expect(out).toEqual([d("2026-03-02"), d("2026-03-09"), d("2026-03-16"), d("2026-03-23")]);
  });

  it("respects the anchor for weekly", () => {
    const anchored: RecurringSchedule = { frequency: "WEEKLY", weekday: 1, anchorDate: d("2026-03-10") };
    const out = dueOccurrences(anchored, d("2026-03-01"), d("2026-03-24"));
    expect(out).toEqual([d("2026-03-16"), d("2026-03-23")]);
  });

  it("excludes handled weekly occurrences", () => {
    const out = dueOccurrences(weekly, d("2026-03-01"), d("2026-03-24"), [d("2026-03-09")]);
    expect(out).toEqual([d("2026-03-02"), d("2026-03-16"), d("2026-03-23")]);
  });
});
