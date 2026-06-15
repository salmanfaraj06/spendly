# Finance Tracker

A mobile-first PWA for tracking income, expenses, budgets, and savings goals on a customisable monthly **Finance Cycle** (default: 25th). Built with Next.js 15, Tailwind v4, Prisma + Supabase, Framer Motion, and Recharts.

See [CONTEXT.md](CONTEXT.md) for the domain glossary, [PRD.md](PRD.md) for the product spec, and [docs/issues/](docs/issues/) for the implementation backlog.

## Status

| Layer | State |
|---|---|
| **Domain engines** (Cycle, Balance, Budget, Export) | ✅ Built + unit-tested (33 tests) |
| **Prisma schema + Supabase migration** | ✅ Applied (all tables live) |
| **App shell, theme, 5-tab nav, PWA** | ✅ Built |
| **Google Auth + route protection + first-login provisioning** | ✅ Live |
| **All 5 screens on live Prisma data** | ✅ Wired (Home, Transactions, Budget, Goals, Accounts) |
| **Add flows** (transaction/account/budget/goal) | ✅ Server Actions + bottom-sheet forms |
| **CSV export** (4 types) | ✅ `/api/export/[type]` via profile menu |

**PRD 1 complete (issues 1–9)** plus **PRD 2 mostly complete (issues 10–20, except 18).** The app reads and writes real data scoped to the authenticated user and active Finance Cycle. Includes: add/edit/delete transactions with filter + search, account edit + per-account history, manage-categories screen, per-cycle budget overrides + cycle navigator, goal progress + achieved/missed, 7-month trend, date-range CSV exports, settings (cycle start-day), PWA app icons.

**PRD 2 additions:** recurring transactions (confirm-to-post Due Occurrences with Home banner + review screen), AI Smart Insights (deterministic facts phrased by OpenAI with a built-in fallback — ADR 0002), profile (name/nickname/emoji), cycle-vs-last comparison, undo/confirm safety nets, and quick-add shortcuts + deep link.

**Not yet built:** issue 18 (receipt photos) — needs a private Supabase Storage bucket + policies (HITL). `OPENAI_API_KEY` is optional: insights fall back to plain wording without it.

See [docs/issues/](docs/issues/) for per-feature status.

## Scripts

```bash
npm run dev          # Next.js dev server
npm run build        # production build
npm test             # run the engine unit tests (Vitest)
npm run test:watch   # watch mode
```

## Setup (to go live)

1. Copy `.env.example` → `.env.local` and fill in your Supabase password + anon key.
2. `npx prisma migrate dev` to create the schema in Supabase.
3. Enable Google OAuth in the Supabase Auth dashboard.

## Architecture notes

- **Deep, pure engines** in `src/lib/*-engine.ts` hold all the risky logic (cycle math, balance derivation, budget utilisation, CSV formatting) and are tested in isolation.
- Account balances are **derived, never stored** (`BalanceEngine`).
- Cycle config changes are **non-retroactive** and must land on a cycle boundary — see [ADR 0001](docs/adr/0001-cycle-config-effective-from-must-be-a-boundary.md).
