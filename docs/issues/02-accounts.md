# 02 — Accounts CRUD + balance tracking

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ DONE — Account model; create/edit/delete via Server Actions + bottom-sheet; Accounts screen with derived balances; BalanceEngine unit-tested (7 tests). (Note: single-account drill-down history view deferred — transaction list already filterable by account.)

## What to build

The Accounts tab. The user can create a named Account (name, icon, color, opening balance), edit it, and list all accounts with their current balances. Opening a single account shows its details and (initially empty) transaction history. Current balance is derived from opening balance plus the net effect of transactions (BalanceEngine), so once transactions exist in a later slice, balances reflect them automatically.

## Acceptance criteria

- [ ] `Account` model in Prisma: id, user_id, name, icon, color, opening_balance, created_at
- [ ] Create account form (name, icon, color picker, opening balance in LKR)
- [ ] Edit and delete account
- [ ] Accounts list shows each account with current balance (= opening_balance for now; derived via BalanceEngine)
- [ ] Single-account view shows balance, per-cycle totals scaffold, and transaction history placeholder
- [ ] BalanceEngine module computes balance by replaying transactions (pure, derived — never stored)
- [ ] Balances always display as `LKR X,XXX.XX`
- [ ] Unit tests for BalanceEngine: income, expense, transfer (both legs), empty account, multiple cycles

## Blocked by

- 01 — Project scaffold + PWA shell + Google Auth
