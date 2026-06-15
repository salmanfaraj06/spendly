# 16 — Recurring templates CRUD

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ DONE — RecurringTransaction model + /recurring manage screen (create/edit/delete; monthly/weekly).

## What to build
`RecurringTransaction` model + a manage screen in Settings to create/edit/delete templates (type, amount, account(s), category, notes, frequency, day-of-month or weekday, anchor).

## Acceptance criteria
- [x] `RecurringTransaction` model (+ occurrence ledger model for dedupe)
- [x] Create/edit/delete recurring templates from Settings
- [x] Monthly (day 1–28) and weekly (weekday) schedule options
- [x] Carries full transaction fields

## Blocked by
- 15 — RecurrenceEngine
