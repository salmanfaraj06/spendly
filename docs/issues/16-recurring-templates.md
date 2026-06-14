# 16 — Recurring templates CRUD

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ⏳ TODO

## What to build
`RecurringTransaction` model + a manage screen in Settings to create/edit/delete templates (type, amount, account(s), category, notes, frequency, day-of-month or weekday, anchor).

## Acceptance criteria
- [ ] `RecurringTransaction` model (+ occurrence ledger model for dedupe)
- [ ] Create/edit/delete recurring templates from Settings
- [ ] Monthly (day 1–28) and weekly (weekday) schedule options
- [ ] Carries full transaction fields

## Blocked by
- 15 — RecurrenceEngine
