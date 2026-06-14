# 08 — Dashboard + insights

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ DONE — Home shows total balance, today's spend, cycle income/expense/net, MoM comparison vs previous cycle, budget utilisation, category breakdown chart, recent transactions, empty-state onboarding, and a real 7-month spending trend (walks back 7 cycles via CycleEngine).

## What to build

The Home dashboard — the primary screen. Surfaces today's spend, the current cycle's total income/expense/net, a month-over-month comparison card, a category breakdown bar chart, a recent transactions list, a 7-month spending trend sparkline, and overall budget utilisation. Updates in real time as transactions are added. Composes CycleEngine + BalanceEngine + BudgetEngine via a Dashboard Aggregator.

## Acceptance criteria

- [ ] Today's total spend
- [ ] Current cycle totals: income, expenses, net balance
- [ ] Month-over-month comparison card (this cycle vs last)
- [ ] Category breakdown bar chart for current cycle
- [ ] Recent transactions list
- [ ] 7-month spending trend sparkline
- [ ] Total budget utilisation (total spent vs total budgeted)
- [ ] Real-time update as transactions are added
- [ ] Dashboard Aggregator composes the engines into one payload per cycle
- [ ] Styled to the dark-green theme, mobile-first, with animated cards

## Blocked by

- 05 — Transactions end-to-end
- 06 — Budgets
