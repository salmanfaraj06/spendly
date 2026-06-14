# 11 — Undo / confirm safety net

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ⏳ TODO

## What to build
Undo toast for transaction delete (instant delete, 5s "Undo"). Confirmation dialog before deleting an Account or Category that still has linked transactions; empty ones delete without nagging.

## Acceptance criteria
- [ ] Deleting a transaction shows an undo toast; undo restores it
- [ ] Deleting an account/category WITH linked transactions prompts a confirm dialog
- [ ] Deleting an empty account/category proceeds with no dialog
- [ ] No window.alert/confirm — themed inline UI

## Blocked by
None — can start immediately.
