# 09 — CSV exports

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ DONE — all 4 exports (transactions, budget summaries, goal progress, account balances) via `/api/export/[type]`; date-range filter UI on the Settings → Export panel (`?from=&to=`); account-balance export now per-cycle with running opening/closing + income/expense/transfer-in/out breakdown. ExportService + CSV unit-tested (7 tests).

## What to build

Structured CSV export for personal data analytics. Four export types, each filterable by date range or specific Finance Cycle. An ExportService queries and formats each CSV.

## Acceptance criteria

- [ ] Transactions export: date, type, amount, category, account, notes, cycle_id, cycle_start, cycle_end
- [ ] Budget summaries export: cycle, category, budgeted_amount, spent_amount, remaining, utilisation_pct
- [ ] Goal progress export: cycle, goal_name, target_amount, achieved_amount, status
- [ ] Account balances export: account, cycle, opening_balance, closing_balance, total_income, total_expenses, total_transfers_in, total_transfers_out
- [ ] Filter exports by date range or specific Finance Cycle
- [ ] Files download cleanly on mobile PWA
- [ ] ExportService module encapsulates queries + CSV formatting
- [ ] Unit tests for ExportService: CSV column structure, date-range + cycle filtering, all four export types

## Blocked by

- 06 — Budgets
- 07 — Goals
