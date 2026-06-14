# 17 — Due Occurrences (confirm-to-post)

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ Done

## What to build
Materialise Due Occurrences from templates via RecurrenceService. Home banner ("N recurring due") + dedicated review screen. Confirm (one tap), edit-before-post, or skip. Confirming posts a real Transaction in the correct cycle via the existing creation path. No double-posting.

## Acceptance criteria
- [x] Home banner shows count of due occurrences
- [x] Review screen lists all due occurrences (pre-filled)
- [x] Confirm → posts a real Transaction in the correct Finance Cycle
- [x] Edit before posting; skip records a skip
- [x] Confirmed/skipped occurrences never reappear
- [x] Catch-up respects the current+previous cycle cap

## Blocked by
- 16 — Recurring templates CRUD
