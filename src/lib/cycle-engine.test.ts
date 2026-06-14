import { describe, it, expect } from "vitest";
import { resolveCycle, nextCycle, previousCycle } from "./cycle-engine";

const d = (iso: string) => new Date(iso + "T00:00:00.000Z");

describe("CycleEngine — resolveCycle", () => {
  it("resolves a date inside a 25th-start cycle to [25th → 24th next month)", () => {
    const configs = [{ startDay: 25, effectiveFrom: d("2026-01-01") }];

    const cycle = resolveCycle(configs, d("2026-03-10"));

    expect(cycle.start).toEqual(d("2026-02-25"));
    expect(cycle.end).toEqual(d("2026-03-25"));
  });

  it("treats the start day as inclusive — the 25th belongs to the new cycle", () => {
    const configs = [{ startDay: 25, effectiveFrom: d("2026-01-01") }];

    const cycle = resolveCycle(configs, d("2026-03-25"));

    expect(cycle.start).toEqual(d("2026-03-25"));
    expect(cycle.end).toEqual(d("2026-04-25"));
  });

  it("treats the end as exclusive — the 24th belongs to the prior cycle", () => {
    const configs = [{ startDay: 25, effectiveFrom: d("2026-01-01") }];

    const cycle = resolveCycle(configs, d("2026-03-24"));

    expect(cycle.start).toEqual(d("2026-02-25"));
    expect(cycle.end).toEqual(d("2026-03-25"));
  });

  it("spans a year boundary — 28 Dec is in the [25 Dec → 25 Jan) cycle", () => {
    const configs = [{ startDay: 25, effectiveFrom: d("2026-01-01") }];

    const cycle = resolveCycle(configs, d("2026-12-28"));

    expect(cycle.start).toEqual(d("2026-12-25"));
    expect(cycle.end).toEqual(d("2027-01-25"));
  });

  it("resolves a January date before the start day into the prior December cycle", () => {
    const configs = [{ startDay: 25, effectiveFrom: d("2026-01-01") }];

    const cycle = resolveCycle(configs, d("2027-01-10"));

    expect(cycle.start).toEqual(d("2026-12-25"));
    expect(cycle.end).toEqual(d("2027-01-25"));
  });

  it("applies the config active at the date — old start day before the change", () => {
    const configs = [
      { startDay: 25, effectiveFrom: d("2026-01-01") },
      { startDay: 1, effectiveFrom: d("2026-05-01") },
    ];

    // A March date predates the change → old 25th-start cycle applies.
    const cycle = resolveCycle(configs, d("2026-03-10"));

    expect(cycle.start).toEqual(d("2026-02-25"));
    expect(cycle.end).toEqual(d("2026-03-25"));
  });

  it("applies the newer config for dates on/after its effectiveFrom", () => {
    const configs = [
      { startDay: 25, effectiveFrom: d("2026-01-01") },
      { startDay: 1, effectiveFrom: d("2026-05-01") },
    ];

    // A May date → new 1st-start cycle applies.
    const cycle = resolveCycle(configs, d("2026-05-15"));

    expect(cycle.start).toEqual(d("2026-05-01"));
    expect(cycle.end).toEqual(d("2026-06-01"));
  });

  it("handles a 28th-start cycle across February without rollover", () => {
    const configs = [{ startDay: 28, effectiveFrom: d("2026-01-01") }];

    const cycle = resolveCycle(configs, d("2026-02-10"));

    expect(cycle.start).toEqual(d("2026-01-28"));
    expect(cycle.end).toEqual(d("2026-02-28"));
  });
});

describe("CycleEngine — navigation", () => {
  const configs = [{ startDay: 25, effectiveFrom: d("2026-01-01") }];

  it("nextCycle returns the following cycle", () => {
    const current = resolveCycle(configs, d("2026-03-10"));

    const next = nextCycle(configs, current);

    expect(next.start).toEqual(d("2026-03-25"));
    expect(next.end).toEqual(d("2026-04-25"));
  });

  it("previousCycle returns the preceding cycle", () => {
    const current = resolveCycle(configs, d("2026-03-10"));

    const prev = previousCycle(configs, current);

    expect(prev.start).toEqual(d("2026-01-25"));
    expect(prev.end).toEqual(d("2026-02-25"));
  });

  it("nextCycle crosses a config change — adopts the new start day", () => {
    const changing = [
      { startDay: 25, effectiveFrom: d("2026-01-01") },
      { startDay: 1, effectiveFrom: d("2026-05-01") },
    ];
    // Cycle [25 Apr → 25 May). The day after it (25 May) is governed
    // by the new 1st-start config → next active cycle is [1 May → 1 Jun)?
    // No: 25 May falls in [1 May → 1 Jun). So nextCycle resolves from
    // the current end date under the active config.
    const current = resolveCycle(changing, d("2026-04-26"));

    const next = nextCycle(changing, current);

    expect(next.start).toEqual(d("2026-05-01"));
    expect(next.end).toEqual(d("2026-06-01"));
  });
});
