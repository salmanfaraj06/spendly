# 17 — Due Occurrences (confirm-to-post)

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ⏳ TODO

## What to build
Materialise Due Occurrences from templates via RecurrenceService. Home banner ("N recurring due") + dedicated review screen. Confirm (one tap), edit-before-post, or skip. Confirming posts a real Transaction in the correct cycle via the existing creation path. No double-posting.

## Acceptance criteria
- [ ] Home banner shows count of due occurrences
- [ ] Review screen lists all due occurrences (pre-filled)
- [ ] Confirm → posts a real Transaction in the correct Finance Cycle
- [ ] Edit before posting; skip records a skip
- [ ] Confirmed/skipped occurrences never reappear
- [ ] Catch-up respects the current+previous cycle cap

## Blocked by
- 16 — Recurring templates CRUD
