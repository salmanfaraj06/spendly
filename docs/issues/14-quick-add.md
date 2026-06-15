# 14 — Quick-add shortcuts + deep link

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ DONE — manifest shortcuts + /transactions?add=expense|income deep link auto-opens the add sheet with type preset.

## What to build
PWA manifest `shortcuts` ("Add Expense", "Add Income") and a deep link `/?add=expense|income` that opens the add sheet pre-set on load.

## Acceptance criteria
- [x] manifest.webmanifest has shortcuts entries
- [x] `/?add=expense` and `/?add=income` open the add sheet with type preset
- [x] Works on iOS via the deep link (shortcuts best-effort)

## Blocked by
None — can start immediately.
