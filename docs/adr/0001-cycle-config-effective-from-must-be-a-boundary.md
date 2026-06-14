# 1. Cycle config changes take effect only at a cycle boundary

Date: 2026-06-14

## Status

Accepted

## Context

A Finance Cycle is defined by a configurable **start day of month** (default: 25th). The user can change this start day at any time. We decided that such changes are **never retroactive** — they apply from the next cycle onward.

The `CycleEngine` models config history as a list of `CycleConfig { startDay, effectiveFrom }` rows. `resolveCycle(configs, date)` picks the config in effect on a date (the latest `effectiveFrom ≤ date`) and computes the half-open cycle `[start, end)` from its `startDay`.

This creates a hazard: if a config's `effectiveFrom` falls **mid-cycle**, the date ranges produced before and after the change do not tile cleanly. Example — an active 25th-start cycle runs 25 Apr → 25 May. If the user switches to a 1st-start config with `effectiveFrom = 1 May`:

- 26 Apr resolves (old config) to `[25 Apr → 25 May)`
- 3 May resolves (new config) to `[1 May → 1 Jun)`

These two cycles **overlap** for 1–24 May. A transaction dated 10 May could be attributed to either, depending on which config is "active" — ambiguous and wrong.

## Decision

`effectiveFrom` must always be set to a **cycle boundary** — specifically, the start date of the first cycle the new configuration governs.

The config-change UI is responsible for snapping the user's request to the next boundary: when the user changes the start day, the system computes the current cycle's `end` (under the existing config) and sets the new config's `effectiveFrom` to exactly that date. The new start day therefore takes hold cleanly at the next boundary, with no overlap or gap.

The `CycleEngine` itself does not enforce this invariant — it assumes well-formed config history. Enforcement lives at the write boundary (the config-change action), not in the pure date logic.

## Consequences

- Cycles always tile the timeline with no overlaps or gaps; every date belongs to exactly one cycle.
- The "never retroactive" rule is structurally guaranteed, not merely conventional.
- The config-change UI (issue 03) MUST derive `effectiveFrom` from the current cycle's end date. It must not accept an arbitrary date.
- Any future bulk import or migration that writes `CycleConfig` rows directly must uphold this invariant, since the engine trusts it.
- Tests for `CycleEngine` only use boundary-aligned `effectiveFrom` values, matching real-world data.
