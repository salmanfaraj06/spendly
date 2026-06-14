# 12 — Per-account history

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ Done

## What to build
Tapping an account opens `/accounts/[id]` showing its running balance and full transaction history, with transfers shown from that account's in/out perspective.

## Acceptance criteria
- [x] `/accounts/[id]` dynamic route
- [x] Shows current balance + opening balance
- [x] Full transaction history for that account (source or destination)
- [x] Transfers render as in/out relative to this account
- [x] Back navigation to Accounts

## Blocked by
None — can start immediately.
