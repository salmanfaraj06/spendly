# 15 — RecurrenceEngine (pure)

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ DONE — pure RecurrenceEngine (monthly day-N ≤28 / weekly), catch-up cap, dedupe; 9 unit tests.

## What to build
Pure module computing due-occurrence dates for a recurring template within a window. Monthly-on-day-N (N≤28) and weekly-on-weekday. Applies catch-up cap (current + previous cycle only) and excludes already-handled (confirmed/skipped) dates.

## Acceptance criteria
- [x] Monthly-day-N due dates across month/year boundaries and February (28)
- [x] Weekly-on-weekday sequences
- [x] Catch-up cap: only current + previous cycle surfaced
- [x] Excludes already-handled occurrence dates (no double-post)
- [x] Unit tests (Vitest), behaviour-focused, mirrors CycleEngine style

## Blocked by
None — can start immediately.
