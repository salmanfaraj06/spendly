# 11 — Undo / confirm safety net

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ DONE — undo toast on transaction delete (restores via re-create); confirm dialog before deleting accounts/categories WITH linked transactions; empty ones delete freely.

## What to build
Undo toast for transaction delete (instant delete, 5s "Undo"). Confirmation dialog before deleting an Account or Category that still has linked transactions; empty ones delete without nagging.

## Acceptance criteria
- [x] Deleting a transaction shows an undo toast; undo restores it
- [x] Deleting an account/category WITH linked transactions prompts a confirm dialog
- [x] Deleting an empty account/category proceeds with no dialog
- [x] No window.alert/confirm — themed inline UI

## Blocked by
None — can start immediately.
