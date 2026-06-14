# 06 — Budgets (templates + cycle tracking)

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ DONE — BudgetTemplate/CycleBudget models; set template via sheet; materialisation + utilisation via BudgetEngine (8 tests); progress bars + near/over alerts; per-cycle override (tap a budget card); past-cycle budget view via cycle navigator.

## What to build

The Budget tab. The user sets a monthly budget per category as a Budget Template that persists across cycles. Each Finance Cycle, templates materialise into Cycle Budgets. A specific cycle's budget can be overridden without affecting the template. Each category shows spent-vs-budget with a progress bar. In-app alerts fire when approaching (e.g. 80%) or exceeding a budget. Past cycles' budget performance is viewable.

## Acceptance criteria

- [ ] `BudgetTemplate` model: id, user_id, category_id, amount_lkr (one per category, updated in place)
- [ ] `CycleBudget` model: id, cycle_id, category_id, amount_lkr, is_override
- [ ] Set/edit a category budget template
- [ ] Templates auto-materialise into the current cycle
- [ ] Per-cycle override that does not change the template
- [ ] Spent-vs-budget shown per category with progress bar (spent = Expense transactions in that category for the cycle)
- [ ] In-app alert at near-limit (e.g. 80%) and over-limit
- [ ] Categories without a budget are surfaced
- [ ] Past-cycle budget performance view
- [ ] BudgetEngine module: materialisation, override, utilisation %, exceeded detection
- [ ] Unit tests for BudgetEngine: materialisation from template, override behaviour, utilisation %, exceeded detection

## Blocked by

- 05 — Transactions end-to-end
