# 03 — CycleEngine + Finance Cycle configuration

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ DONE — CycleEngine unit-tested (11 tests); CycleConfig/FinanceCycle models; lazy cycle materialisation; non-retroactive change snapped to boundary per ADR 0001; start-day change screen (Settings); cycle navigator prev/next on Budget screen.

## What to build

The Finance Cycle system. A CycleEngine determines which Finance Cycle any given date falls into, based on a configurable start day (default 25th). The user can change the cycle start day at any time; changes apply from the next cycle onward and are never retroactive (modelled as a history of CycleConfig rows with `effective_from`). The user can navigate between past and current cycles in the UI.

## Acceptance criteria

- [ ] `CycleConfig` model: id, user_id, start_day (1–28), effective_from, created_at — one row per change
- [ ] `FinanceCycle` model: id, user_id, start_date, end_date, cycle_config_id — materialised lazily
- [ ] CycleEngine resolves the active cycle for any date from CycleConfig history
- [ ] Default start day is 25th; capped at 28 to avoid February ambiguity
- [ ] Cycle change takes effect next cycle only; historical cycles unchanged
- [ ] UI control to change start day, with confirmation it applies next cycle
- [ ] Config-change action sets `effective_from` to the current cycle's END date (snaps to boundary) — see ADR 0001; never accept an arbitrary date
- [ ] Cycle navigator (prev/next) usable across the app to scope views
- [ ] Unit tests for CycleEngine: boundary calc for various start days, month-end edge cases (28/29/30/31), cross-month cycles (e.g. 25 Jan → 24 Feb), effective_from logic, date-to-cycle resolution

## Blocked by

- 01 — Project scaffold + PWA shell + Google Auth
