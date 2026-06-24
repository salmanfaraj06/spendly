# Deployment & Multi-User Notes

This app is built for a small group (≈ a dozen users). Each user's data is fully
isolated at the application layer — every query is scoped by `userId`, and
cross-user reference injection on writes is blocked by `src/lib/tenant-guard.ts`.

## Multi-user readiness — status

| Concern | Status |
| --- | --- |
| Per-user data isolation | ✅ Every query filtered by `userId`; paginated loaders scope by `userId` too |
| Cross-user reference injection (passing someone else's account/category/cycle id) | ✅ Blocked by `tenant-guard` on all writes |
| Auth | ✅ Supabase Google OAuth; JWT verified in middleware, forwarded as a trusted (un-spoofable) `x-user-id` header |
| First-login provisioning | ✅ `ensureUserProvisioned` creates each user's defaults |
| Insights cost | ✅ Manual generation, cached per user per cycle |
| Secrets | ✅ `.env` git-ignored; only `NEXT_PUBLIC_*` exposed to the browser |
| **DB connections under serverless concurrency** | ⚠️ **Must use the transaction pooler on Vercel — see below** |
| Database RLS (defense-in-depth) | ➖ Not enabled; app-layer scoping is the only guard (acceptable for a trusted friend group, but see "Hardening") |

## The one thing to get right: the database connection on Vercel

`preferredRegion = "bom1"` (Mumbai) means this deploys to **Vercel serverless**
co-located with the Supabase **ap-south-1 (Mumbai)** database. (It was `syd1`
when the DB lived in Sydney; the DB moved to Mumbai, so the functions followed.)
Serverless spins up many short-lived function instances;
each opens its own DB connections. The **session pooler (port 5432) caps at ~15
connections and will exhaust** under a dozen concurrent users.

**In the Vercel dashboard, set `DATABASE_URL` to the TRANSACTION pooler:**

```
DATABASE_URL = postgresql://postgres.<ref>:<pw>@<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL   = postgresql://postgres.<ref>:<pw>@<region>.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY = ...
```

The high per-query latency we measured on the transaction pooler was a
distance artifact; **intra-region (Vercel bom1 ↔ Mumbai DB) it is single-digit
milliseconds**, so the transaction pooler is both correct *and* fast in
production. Keep the session pooler only for local development. (See
`docs/adr/0003`.)

## Database migrations

`build` does not run migrations. After changing `prisma/schema.prisma`, apply
migrations to production explicitly:

```
npx prisma migrate deploy   # uses DIRECT_URL
```

Run this against the production database before/with the deploy that needs it.

## Hardening (optional, recommended if the group grows or is less trusted)

App-layer `userId` scoping is the only thing isolating users — there is no
database Row-Level Security, because Prisma connects with a privileged role that
bypasses RLS. For a trusted friend group this is acceptable. If you want
defense-in-depth (so a single forgotten `where: { userId }` can't leak data),
enable Postgres RLS policies keyed on `auth.uid()` and have the app connect as an
authenticated role. This is a larger change — ask before undertaking it.
