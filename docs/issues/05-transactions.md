# 05 — Transactions end-to-end

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ DONE — add/edit/delete Income/Expense/Transfer via sheet (tap a row to edit); atomic transfers; correct cycle assignment; balances via BalanceEngine; date-grouped list; filter chips (All/Income/Expense/Transfer) + live search by notes/amount/category/account.

## What to build

The Transactions tab and the core logging flow. The user logs Income, Expense, and Transfer transactions via a low-friction floating action button. Transfers are atomic two-leg operations (debit source account, credit destination). Transactions can be edited and deleted. The list is filterable by Finance Cycle, account, category, and type, searchable by notes/amount, and sorted by date descending. Each transaction is assigned to the correct Finance Cycle via CycleEngine, and account balances reflect transactions via BalanceEngine.

## Acceptance criteria

- [ ] `Transaction` model: id, user_id, cycle_id, type (INCOME | EXPENSE | TRANSFER), amount, date, notes, category_id (nullable for Transfer), account_id (source), destination_account_id (nullable, Transfer only)
- [ ] Add Income: amount, account, category, date, notes
- [ ] Add Expense: amount, account, category, date, notes
- [ ] Add Transfer: amount, source account, destination account, date — atomic (both legs or neither)
- [ ] Edit and delete any transaction
- [ ] FAB for quick add on mobile
- [ ] Filter by cycle, account, category, type
- [ ] Search by notes or amount
- [ ] List sorted by date descending by default
- [ ] Transaction assigned to correct Finance Cycle (via CycleEngine)
- [ ] Account balances update correctly after add/edit/delete (via BalanceEngine)
- [ ] TransactionService enforces Transfer two-leg consistency and validation

## Blocked by

- 02 — Accounts CRUD + balance tracking
- 03 — CycleEngine + Finance Cycle configuration
- 04 — Category store
