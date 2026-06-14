# Finance Tracker — Domain Glossary

## Visual Identity
- **Theme**: Dark green dominant. Deep background (~`#0D1F12`), emerald/lime green accents, white text, green-tinted card surfaces.
- **Aesthetic reference**: "Smarter Spending" app inspiration — premium, editorial, mobile-first PWA.
- **Inspiration images**: `ui:ux/` folder. Used for UI/UX aesthetic reference only, not feature constraints.

## Navigation
5 bottom nav tabs: **Home**, **Transactions**, **Budget**, **Goals**, **Accounts**.
- Home: dashboard — cycle summary, today's spend, month-over-month comparison, top categories, recent transactions, inline analytics/insights
- Transactions: full list filterable by cycle/account/category; FAB to add
- Budget: category budget progress for the active Finance Cycle
- Goals: monthly goals + annual rollup
- Accounts: all accounts, balances, transfer history

## Terms

### Finance Cycle
The recurring period used to group all Transactions, Budgets, and analytics. Defined by a **start day of month** (default: 25th). The cycle boundary can be changed at any time; the new boundary applies from the next cycle onward. Changes are never retroactive.

### Transaction
A single financial event recorded manually by the user. Belongs to exactly one Finance Cycle based on its date. Has one of three types:
- **Income** — money received (e.g. salary, freelance payment)
- **Expense** — money spent (e.g. food, transport, shopping)
- **Transfer** — money moved between two Accounts (neutral; does not affect net income or expense totals)

Each Transaction is linked to an Account:
- Income → credited to one Account
- Expense → debited from one Account
- Transfer → debited from a **Source Account**, credited to a **Destination Account**

No recurring transactions — all entries are manual.

### Account
A named financial container with a tracked balance (e.g. "Commercial Bank Savings", "Cash Wallet", "Credit Card"). User-defined. Balance updates automatically as Transactions are recorded.

### Category
A label attached to an Expense Transaction. Used for budget tracking and analytics grouping. Two kinds:
- **Default Category** — pre-loaded (Food & Dining, Transport, Shopping, Groceries, Entertainment, Health, Utilities, Investment, Salary). Cannot be deleted.
- **Custom Category** — created by the user on-the-fly while adding a transaction. Persists in the user's category list for future reuse (ClickUp-style: type once, reuse forever).

Each Category has a name, icon, and color.

### Budget
An allocation of a spending limit to a Category. Defined as a **Budget Template** (persists across cycles) and materialises as a **Cycle Budget** each Finance Cycle. Tracks consumption by Expense Transactions in that Category during the cycle. Templates carry forward automatically; a specific cycle's budget can be overridden without affecting the template.

### Goal
A monthly savings or investment target (e.g. "Save LKR 50,000 this cycle"). No dedicated account or pot — progress is measured against the user's net balance change within the Finance Cycle. Goals can be reviewed month-by-month and rolled up into an annual view.

## Currency
**LKR** (Sri Lankan Rupee) — single currency, no multi-currency support.

## Authentication
**Google OAuth via Supabase Auth** — single user, no multi-user or sharing features.

## Alerts
In-app budget alerts only (e.g. "close to Food & Dining limit"). No push notifications in v1.

## Data Export
**CSV export** — multiple structured exports optimised for data analytics:
- **Transactions** — date, type, amount, category, account, notes, cycle_id, cycle_start, cycle_end
- **Budget Summaries** — cycle, category, budgeted_amount, spent_amount, remaining, utilisation_pct
- **Goal Progress** — cycle, goal_name, target_amount, achieved_amount, status
- **Account Balances** — account, opening_balance, closing_balance, total_income, total_expenses, total_transfers_in, total_transfers_out, per cycle

Exportable by date range or per Finance Cycle.
