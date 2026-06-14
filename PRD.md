# PRD — Personal Finance Tracker PWA

## Problem Statement

Managing personal finances across income, expenses, savings goals, and investments is fragmented and stressful. Existing apps are either too generic, lack cycle-based budgeting aligned to personal pay schedules, or don't provide the structured data exports needed for deeper personal analysis. There is no single tool that tracks transactions across accounts, enforces a custom billing cycle, monitors budgets per category, tracks monthly goals, and lets the user export everything cleanly for external analysis.

## Solution

A mobile-first Progressive Web App (PWA) that gives the user full visibility and control over their personal finances within a customisable Finance Cycle. Transactions are logged manually across multiple accounts, categorised, and measured against per-category budgets. Monthly goals track savings and investment targets. A rich dashboard surfaces insights at a glance. All data is exportable as structured CSVs for personal analytics.

## User Stories

### Onboarding & Auth
1. As a user, I want to sign in with Google so that I don't have to manage a separate password.
2. As a user, I want to be prompted to set up my first account (e.g. "Commercial Bank Savings") on first login so that I can start tracking immediately.
3. As a user, I want the app to install as a PWA on my phone so that I can access it like a native app at any time.

### Finance Cycle
4. As a user, I want my default Finance Cycle to start on the 25th of each month so that it aligns with my pay schedule.
5. As a user, I want to change my cycle start day at any time so that I can adjust if my pay schedule changes.
6. As a user, I want cycle changes to take effect from the next cycle only so that historical data is never corrupted.
7. As a user, I want to navigate between past Finance Cycles so that I can review previous periods.
8. As a user, I want to see which Finance Cycle a transaction belongs to so that I can understand its context.

### Accounts
9. As a user, I want to create named accounts (e.g. "Cash Wallet", "Credit Card") so that I can track balances across all my financial containers.
10. As a user, I want to set an opening balance for each account so that my tracked balance starts accurately.
11. As a user, I want to see each account's current balance updated in real time as I log transactions so that I always know where I stand.
12. As a user, I want to view the transaction history for a specific account so that I can audit individual accounts.
13. As a user, I want to see total income, expenses, and transfers per account per cycle so that I understand cash flow per account.

### Transactions
14. As a user, I want to log an Income transaction with amount, account, category, date, and notes so that I capture all money received.
15. As a user, I want to log an Expense transaction with amount, account, category, date, and notes so that I capture all money spent.
16. As a user, I want to log a Transfer transaction between two accounts with amount and date so that inter-account movements are accurately reflected.
17. As a user, I want transfers to debit the source account and credit the destination account simultaneously so that my balances are always consistent.
18. As a user, I want to edit or delete a transaction after logging it so that I can correct mistakes.
19. As a user, I want to filter my transaction list by Finance Cycle, account, category, and type so that I can find specific entries quickly.
20. As a user, I want to search transactions by notes or amount so that I can locate specific entries.
21. As a user, I want to add a transaction quickly via a floating action button so that logging is low-friction on mobile.
22. As a user, I want transactions sorted by date descending by default so that the most recent entries are always visible first.

### Categories
23. As a user, I want a set of default categories (Food & Dining, Transport, Shopping, Groceries, Entertainment, Health, Utilities, Investment, Salary) pre-loaded so that I can start categorising immediately.
24. As a user, I want to type a new category name while adding a transaction and have it saved permanently so that I never have to type the same category twice.
25. As a user, I want to pick a color and icon for each custom category so that the UI is visually distinct.
26. As a user, I want default categories to be protected from deletion so that core analytics always have consistent groupings.
27. As a user, I want to see all my categories in one place so that I can manage and customise them.

### Budgets
28. As a user, I want to set a monthly budget for any category (e.g. "Food & Dining = LKR 20,000") so that I have a spending limit to track against.
29. As a user, I want budget templates to automatically apply to each new Finance Cycle so that I don't have to re-enter them every month.
30. As a user, I want to override a budget for a specific cycle without affecting the template so that I can handle exceptional months.
31. As a user, I want to see how much I've spent vs. my budget for each category in the current cycle so that I know where I stand at a glance.
32. As a user, I want a visual progress bar for each category budget so that utilisation is immediately obvious.
33. As a user, I want an in-app alert when I'm approaching (e.g. 80%) or have exceeded a category budget so that I can adjust my spending.
34. As a user, I want to see which categories have no budget set so that I can decide whether to add limits.
35. As a user, I want to view budget performance for past cycles so that I can compare months.

### Goals
36. As a user, I want to create a monthly savings or investment goal with a name and target amount (LKR) so that I have a concrete target each cycle.
37. As a user, I want to track goal progress against my net balance change within the Finance Cycle so that I know if I'm on track.
38. As a user, I want to see all my goals for the current cycle with progress indicators so that my targets are always visible.
39. As a user, I want an annual rollup view that shows goal performance across all cycles in the year so that I can evaluate my overall savings discipline.
40. As a user, I want to mark a goal as achieved or missed at the end of a cycle so that my history is accurate.

### Dashboard & Insights
41. As a user, I want to see today's total spend on the Home screen so that I know what I've spent today.
42. As a user, I want to see the current Finance Cycle's total income, total expenses, and net balance prominently so that I have an instant financial snapshot.
43. As a user, I want a month-over-month comparison card showing this cycle vs. last cycle so that I can see spending trends.
44. As a user, I want a category breakdown bar chart for the current cycle so that I can see where my money is going.
45. As a user, I want a recent transactions list on the Home screen so that I can quickly verify the latest entries.
46. As a user, I want a 7-month spending trend sparkline chart so that I can see my long-term patterns.
47. As a user, I want to see total budget utilisation (total spent vs. total budgeted) for the cycle so that I have an overall budget health indicator.
48. As a user, I want the dashboard to update in real time as I add transactions so that the data is always fresh.

### Data Export
49. As a user, I want to export all transactions as a structured CSV with columns: date, type, amount, category, account, notes, cycle_id, cycle_start, cycle_end so that I can analyse them externally.
50. As a user, I want to export budget summaries as CSV with columns: cycle, category, budgeted_amount, spent_amount, remaining, utilisation_pct so that I can analyse budget performance over time.
51. As a user, I want to export goal progress as CSV with columns: cycle, goal_name, target_amount, achieved_amount, status so that I can track savings discipline.
52. As a user, I want to export account balance snapshots as CSV with columns: account, cycle, opening_balance, closing_balance, total_income, total_expenses, total_transfers_in, total_transfers_out so that I can analyse per-account cash flow.
53. As a user, I want to filter exports by date range or specific Finance Cycle so that I can export exactly the data I need.

## Implementation Decisions

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Auth**: Supabase Auth — Google OAuth only
- **PWA**: next-pwa or custom service worker via next.config
- **Animations**: Framer Motion + CSS transitions
- **Charts**: Recharts or Tremor
- **UI Components**: Community components from 21st.dev + custom

### Database Schema (key entities)

**User** — linked to Supabase Auth user id

**Account** — id, user_id, name, icon, color, opening_balance, created_at

**CycleConfig** — id, user_id, start_day (1–28), effective_from (date), created_at
- One row per config change. Active config = latest row where effective_from ≤ today.

**FinanceCycle** — id, user_id, start_date, end_date, cycle_config_id
- Materialised on demand or lazily when a transaction falls into a new period.

**Category** — id, user_id, name, icon, color, is_default (bool)

**Transaction** — id, user_id, cycle_id, type (INCOME | EXPENSE | TRANSFER), amount, date, notes, category_id (nullable for Transfer), account_id (source), destination_account_id (nullable, only for Transfer)

**BudgetTemplate** — id, user_id, category_id, amount_lkr
- One row per category. Updated in place when user changes the template.

**CycleBudget** — id, cycle_id, category_id, amount_lkr, is_override (bool)
- Materialised from template at cycle start. Override flag set when user manually changes for a specific cycle.

**Goal** — id, user_id, cycle_id, name, target_amount_lkr, achieved_amount_lkr, status (ACTIVE | ACHIEVED | MISSED)

### Modules

1. **CycleEngine** — determines the active Finance Cycle for any given date, materialises new cycles, resolves cycle boundaries from CycleConfig history. Deep module: pure date logic, fully testable in isolation.

2. **BalanceEngine** — computes current balance for any Account by replaying transactions. Called on demand, never stored (derived state). Deep module: pure aggregation, easily testable.

3. **BudgetEngine** — materialises CycleBudgets from BudgetTemplates at cycle start, computes utilisation per category. Deep module.

4. **TransactionService** — validates and persists transactions, triggers balance recalculation, enforces Transfer two-leg consistency.

5. **ExportService** — queries and formats all four CSV export types, applies date range / cycle filters.

6. **CategoryStore** — manages default + custom categories, enforces no-delete on defaults.

7. **Dashboard Aggregator** — composes CycleEngine + BalanceEngine + BudgetEngine data into a single dashboard payload per cycle. Server component or API route.

### API Design
- All data mutations via Next.js Server Actions (no separate REST layer).
- Dashboard and list pages use React Server Components with Suspense boundaries for streaming.
- Client components only where interactivity is required (forms, charts, animated cards).

### PWA
- Offline shell with cached static assets. Data mutations require connectivity.
- Installable on iOS and Android via manifest + service worker.

## Testing Decisions

### What makes a good test
Test external behaviour through the module's public interface — not implementation details. A good test breaks when observable behaviour changes, not when internal code is refactored.

### Modules to test
- **CycleEngine** — unit tests covering: cycle boundary calculation for various start days, month-end edge cases (28/29/30/31 day months), cycle change effective_from logic, which cycle a given date falls into.
- **BalanceEngine** — unit tests covering: balance after income, expense, transfer (both legs), empty account, multiple cycles.
- **BudgetEngine** — unit tests covering: materialisation from template, override behaviour, utilisation percentage calculation, exceeded budget detection.
- **ExportService** — unit tests covering: CSV column structure, correct filtering by date range and cycle, all four export types.

### No tests needed
- UI components (visual correctness verified manually)
- Dashboard Aggregator (integration of already-tested engines)
- Server Actions (thin wrappers over tested services)

## Out of Scope

- Recurring / scheduled transactions
- Multi-currency support
- Push notifications
- Multi-user / sharing / collaboration
- Bank account syncing or open banking integrations
- AI-powered categorisation
- Receipt scanning
- Mobile native app (iOS/Android) — PWA only

## Further Notes

- Currency is **LKR** throughout. No formatting ambiguity — always display as `LKR X,XXX.XX`.
- The Finance Cycle start day must be capped at 28 to avoid ambiguity in February.
- Transfers must be atomic — if either leg fails, neither is persisted.
- The 25th-of-month default means cycle boundaries will frequently cross calendar months; the CycleEngine must handle this correctly (e.g. 25 Jan → 24 Feb is one cycle).
- Default categories cannot be deleted but can be hidden from the UI if the user never uses them.
- Custom categories created during transaction entry should auto-suggest from existing categories as the user types (fuzzy match).
