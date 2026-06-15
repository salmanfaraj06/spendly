# 3. Use the session pooler for the long-running server runtime

Date: 2026-06-15

## Status

Accepted

## Context

Screen-to-screen navigation was very slow (Home ~25s in a production `npm start`
build). Profiling the HAR showed near-instant TTFB but multi-second response
streaming — i.e. the time was server-side data fetching, not transport.

Measuring the database round-trip directly revealed the cause: a warm `SELECT 1`
(zero work) cost **~801ms** through the connection the app was using. Comparison:

| Path | Warm `SELECT 1` |
| --- | --- |
| Raw TCP connect to host (Sydney) | ~204ms |
| Session-mode pooler, port 5432 | ~153ms |
| Transaction-mode pooler, port 6543 (`pgbouncer=true`) | ~801ms |

The Supabase project lives in `aws-1-ap-southeast-2` (Sydney); the user is in
Sri Lanka, so ~150ms of RTT is unavoidable. But the **transaction-mode pooler
on 6543 was adding ~650ms on top of that for every query** — Prisma interacts
poorly with transaction-mode pgbouncer (prepared-statement handling / extra
round-trips). Multiplied across the many queries each page makes, this produced
multi-second page loads.

## Decision

The application runtime connects through the **session-mode pooler (port 5432)**,
not the transaction-mode pooler (6543). `DATABASE_URL` points at 5432 with a
small `connection_limit`; the original 6543 URL is kept as
`DATABASE_URL_TXN_POOLER` for reference. `DIRECT_URL` (5432) is unchanged and
still used for migrations.

This is correct **because the app is deployed as a long-running Node server**
(`next start` on a VM/container), which holds a persistent connection pool. The
transaction pooler exists for serverless/edge runtimes (e.g. Vercel functions)
that open many short-lived connections and would exhaust direct connections.

## Consequences

- Per-query latency dropped from ~801ms to ~140ms — about **5.7× faster on
  every query**, the single largest performance win.
- **If this app is ever deployed to a serverless platform (Vercel functions,
  edge), switch `DATABASE_URL` back to the transaction pooler (6543,
  `pgbouncer=true`)** to avoid connection exhaustion. The backup value is in
  `DATABASE_URL_TXN_POOLER`.
- The genuinely transformative fix for the remaining ~150ms/query would be to
  host the database in a region closer to the user (e.g. Mumbai/Singapore), but
  that requires migrating the Supabase project and is out of scope here.
- This change is independent of the code-level round-trip reductions (batched
  7-month trend, per-request cycle memoisation, streamed insights), which remain
  valuable regardless of connection latency.
