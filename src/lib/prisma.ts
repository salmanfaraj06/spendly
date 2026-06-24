import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * On Vercel we talk to Supabase through the transaction pooler (pgbouncer),
 * which multiplexes many client connections onto few real Postgres ones — so a
 * `connection_limit=1` is needlessly strict. With 1, the Home dashboard's
 * parallel query fan-out (`getHomeDashboard`) serialises on a single connection;
 * across cross-region latency that queue blew past the 10s pool timeout (P2024).
 * Widen the client pool (and give the acquire a little more headroom) so the
 * fan-out runs concurrently. Local dev keeps whatever the .env URL specifies.
 */
function resolveDbUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || !process.env.VERCEL) return url;
  try {
    const u = new URL(url);
    if (Number(u.searchParams.get("connection_limit") ?? "1") < 5) {
      u.searchParams.set("connection_limit", "5");
    }
    if (!u.searchParams.has("pool_timeout")) {
      u.searchParams.set("pool_timeout", "20");
    }
    return u.toString();
  } catch {
    return url;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolveDbUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
