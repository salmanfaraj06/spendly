# PRD 2 — Recurring, Insights, Receipts, Profile & Quality-of-Life

Builds on the shipped core (see [PRD.md](PRD.md)). Respects [ADR 0001](docs/adr/0001-cycle-config-effective-from-must-be-a-boundary.md) (cycle boundaries) and [ADR 0002](docs/adr/0002-ai-phrases-facts-never-computes.md) (AI phrases facts, never computes).

## Problem Statement

The app is a trustworthy ledger, but it's a *recording* tool, not an *advising* one, and it leans on the user for everything. As an end user I have to log every single transaction by hand — so after a few busy days I fall behind and the data rots. My regular money (salary, rent, subscriptions) repeats every cycle, yet I re-enter it manually each time. The dashboard shows me numbers but doesn't tell me what they *mean* — am I overspending, what changed, am I on track? Mistakes are unforgiving (no undo), I can't attach a receipt to remember what a charge was, I can't drill into a single account's history, and the app greets me impersonally. These gaps are what make personal trackers get abandoned.

## Solution

Reduce manual effort and turn data into understanding:

- **Recurring Transactions** pre-fill my regular money as one-tap "confirm to post" Due Occurrences — fast, but the ledger still only ever contains entries I confirmed.
- **Smart Insights** read my cycle in plain language ("pacing 12% under budget", "dining is your fastest-growing category") — with the numbers always computed correctly by the app and only the wording produced by AI.
- **Receipt photos**, **per-account history**, a **cycle-vs-last comparison**, **undo/confirm safety nets**, **quick-add shortcuts**, and a **profile** (name, nickname, emoji avatar) round it into something I'd trust for a year.

## User Stories

### Recurring Transactions
1. As a user, I want to define a recurring transaction (e.g. "Salary, monthly, day 25") so that I don't re-enter regular money every cycle.
2. As a user, I want recurring schedules of "monthly on day N" (N capped at 28) and "weekly on a weekday" so that the common cases are covered.
3. As a user, I want a recurring template to carry the same fields as a normal transaction (type, amount, account(s), category, notes) so that the posted entry is complete.
4. As a user, I want recurring transactions to NOT post automatically so that my ledger only ever contains entries I confirmed.
5. As a user, I want due recurring items to surface as pre-filled "Due Occurrences" so that confirming them takes one tap.
6. As a user, I want to confirm a Due Occurrence so that it becomes a real Transaction in the correct Finance Cycle.
7. As a user, I want to edit a Due Occurrence before posting (e.g. this month's electricity is higher) so that the posted amount is accurate.
8. As a user, I want to skip a Due Occurrence so that a month I didn't actually pay isn't recorded.
9. As a user, I want a Home banner showing how many recurring items are due so that I'm reminded the moment I open the app.
10. As a user, I want a dedicated review screen listing all Due Occurrences so that I can work through them in one place.
11. As a user, I want to manage recurring templates (create/edit/delete) in Settings so that template management is separate from daily confirmation.
12. As a user, I want missed occurrences capped to the current and previous cycle so that returning after a long absence doesn't bury me in stale suggestions.
13. As a user, I want occurrences older than the previous cycle silently skipped so that I'm not reconstructing ancient subscriptions by hand.
14. As a user, I want a confirmed occurrence to not reappear so that I never double-post the same recurrence.

### Smart Insights
15. As a user, I want a plain-language insights section on Home so that I understand what my numbers mean, not just what they are.
16. As a user, I want to know whether I'm pacing ahead of or behind my total budget relative to how far through the cycle I am.
17. As a user, I want to know my biggest category increase versus last cycle so that I can spot lifestyle creep.
18. As a user, I want to know my single biggest expense this cycle so that large charges are visible.
19. As a user, I want my total spend change versus last cycle as a percentage so that I see the trend at a glance.
20. As a user, I want to know how many categories are over or near their budget so that I can act before overspending.
21. As a user, I want to know my net (income − expenses) this cycle and whether it's positive so that I know if I saved.
22. As a user, I want insights phrased in friendly, varied language so that they read naturally.
23. As a user, I want the numbers in insights to always be correct so that I can trust them (computed by the app, never invented by AI).
24. As a user, I want insights to still appear (in plainer wording) if the AI service is unavailable so that the feature never just breaks.
25. As a user, I want insights cached for the cycle with a manual refresh so that the app isn't slow or costly on every open.

### Receipt Photos
26. As a user, I want to attach a photo to a transaction so that I can remember what a charge was for.
27. As a user, I want the photo compressed before upload so that it's quick even on mobile data.
28. As a user, I want my receipts private to me so that no one else can access them.
29. As a user, I want to view a transaction's receipt full-screen so that I can read the details.
30. As a user, I want to remove or replace a receipt so that I can fix mistakes.

### Per-Account History
31. As a user, I want to tap an account to open its own page so that I can audit it in isolation.
32. As a user, I want to see an account's running balance and full transaction history so that I can trace how it got to today's number.
33. As a user, I want transfers shown correctly from the account's perspective (in/out) so that the history reads naturally.

### Cycle Comparison
34. As a user, I want a "this cycle vs last cycle" card (income, expenses, net side by side with deltas) so that I can compare at a glance.
35. As a user, I want the 7-month trend chart to be interactive so that tapping a month reveals its totals.

### Safety Net
36. As a user, I want deleting a transaction to be instantly undoable via a toast so that an accidental tap is harmless.
37. As a user, I want a confirmation dialog before deleting an account or category that still has linked transactions so that I don't lose history by mistake.
38. As a user, I want deleting an empty account or category to go through without nagging so that low-stakes cleanup stays fast.

### Quick-Add
39. As a user, I want home-screen app shortcuts ("Add Expense", "Add Income") so that I can start logging in one tap from outside the app.
40. As a user, I want a deep link that opens the app with the add sheet already open so that shortcuts and links jump straight to logging.

### Profile
41. As a user, I want a profile with my full name, a nickname, and an emoji avatar so that the app feels personal.
42. As a user, I want my profile pre-filled from my Google name on first login so that I don't start from blank.
43. As a user, I want the Home greeting to use my nickname so that it feels like mine.
44. As a user, I want to see my (read-only) email and currency on the profile so that my account details are in one place.
45. As a user, I want to edit my profile on its own screen so that updating it is straightforward.

## Implementation Decisions

### New / modified domain terms (CONTEXT.md)
- **Recurring Transaction** — a template describing an expected repeating Transaction. Does not post automatically.
- **Due Occurrence** — a pre-filled, confirm-to-post suggestion generated when a recurrence falls due.
- **Insight** — a plain-language observation; facts computed by the app, prose by an LLM.

### Deep modules (pure, unit-tested)
1. **RecurrenceEngine** — given a recurring template (schedule + anchor) and a date window, computes the set of due occurrence dates. Handles monthly-on-day-N (≤28) and weekly-on-weekday; applies the catch-up cap (current + previous cycle only); excludes occurrences already confirmed. Pure date logic, mirrors the existing CycleEngine style.
2. **InsightsEngine** — given cycle totals, spend-by-category, budget report, and previous-cycle data, computes the 6 structured facts (budget pacing, top category mover, biggest expense, cycle-over-cycle change, over/near-budget count, net savings). Pure; no I/O, no AI.

### Thin / integration modules
3. **InsightsPhraser** — takes InsightsEngine facts, calls OpenAI to phrase them, returns sentences; falls back to a deterministic built-in template when `OPENAI_API_KEY` is missing or the call fails. Treats model output as untrusted plain text. Results cached per Finance Cycle, regenerated on demand. (Per ADR 0002.)
4. **RecurrenceService** — materialises Due Occurrences from templates via RecurrenceEngine, persists confirmations as Transactions (reusing the existing transaction creation path + cycle assignment), records skips, prevents double-posting.
5. **ReceiptService** — client-side image compression, upload to a private per-user Supabase Storage bucket, signed-URL retrieval, delete/replace.
6. **ProfileService** — read/update the Profile record; provision from Google identity on first login (extends existing `ensureUserProvisioned`).

### Schema changes (Prisma)
- **RecurringTransaction** — userId, type, amount, accountId, destinationAccountId?, categoryId?, notes?, frequency (MONTHLY | WEEKLY), dayOfMonth? (1–28), weekday? (0–6), anchorDate, active.
- **RecurringOccurrence** (or equivalent ledger of handled occurrences) — recurringTransactionId, dueDate, status (CONFIRMED | SKIPPED), postedTransactionId?. Used to dedupe and to know which dates are already handled.
- **Transaction** — add `receiptPath` (nullable) for the Storage object key.
- **Insight cache** — store generated insight prose keyed by (userId, cycleId) with the source facts, regenerated on demand.
- **Profile** — 1:1 with User: fullName, nickname, avatarEmoji. Email/currency derived (not stored separately beyond existing User.email).

### Surfaces & interactions
- Due Occurrences: Home banner ("N recurring due") + dedicated review screen; templates CRUD under Settings.
- Insights: Home section with a refresh control; cached per cycle.
- Receipts: attach control in the transaction add/edit sheet; full-screen viewer.
- Per-account history: new dynamic route `/accounts/[id]`.
- Cycle comparison: Home card; interactive trend chart (tap a month).
- Safety net: reusable undo-toast for transaction delete; confirm dialog gated on linked-transaction count for account/category delete.
- Quick-add: PWA manifest `shortcuts` entries + an app deep link that opens the add sheet on load.
- Profile: `/profile` screen; profile button opens it; greeting reads nickname.

### Configuration
- New env var `OPENAI_API_KEY` (optional — absence triggers the InsightsPhraser fallback).
- New Supabase Storage bucket (private) with per-user access policies; setup scripted.

## Testing Decisions

Good tests verify observable behaviour through a module's public interface and survive internal refactors. Prior art: the existing Vitest suites for CycleEngine, BalanceEngine, BudgetEngine, and ExportService (pure modules, behaviour-focused).

- **RecurrenceEngine** — unit tests: monthly-on-day-N due dates across month boundaries and February (day 28), weekly-on-weekday sequences, catch-up cap (only current + previous cycle surfaced), exclusion of already-confirmed/skipped occurrences, no-double-post.
- **InsightsEngine** — unit tests: each of the 6 facts computed correctly from representative inputs, including edge cases (no previous cycle, zero budget, negative net, empty data).
- **InsightsPhraser** — test the fallback path deterministically (no key → built-in template); the OpenAI call itself is a thin adapter and is not asserted against the live API.
- Not unit-tested (verified manually / integration): ReceiptService (storage I/O), ProfileService, UI components, deep-link/shortcut wiring.

## Out of Scope

- Auto-derived goal progress — **goals remain manual** (explicitly dropped during grilling).
- Custom recurrence intervals (every N days/weeks); only monthly-on-day-N and weekly.
- Auto-posting recurring transactions without confirmation.
- AI that reasons over raw data or computes figures (forbidden by ADR 0002).
- Web Share Target; native OS home-screen widgets (PWA limitation).
- Receipt OCR / auto-extraction of amount from the image.
- Image-based avatar upload (emoji avatar only for now).
- Multi-currency, push notifications, multi-user (still out per PRD 1).

## Further Notes

- Recurrence day-of-month is capped at 28 for the same February-safety reason as the Finance Cycle start day.
- Confirming a Due Occurrence routes through the existing transaction-creation path so cycle assignment and balance derivation stay consistent — recurrence never bypasses the ledger rules.
- Insight prose must be rendered as plain text and never used to drive logic; prompts pass facts as explicit values and forbid new figures (ADR 0002).
- All amounts remain LKR.
