import "server-only";
import { unstable_cache } from "next/cache";

/**
 * Cross-request cache for slow-changing, per-user read data (Next.js Data Cache —
 * persists across requests/instances on Vercel; in-memory locally). NO new infra.
 *
 * Only use for data that changes rarely and is invalidated explicitly on write
 * via `revalidateTag(userTag(userId, kind))`. Never cache balance/transaction-
 * derived numbers here — those must stay live.
 */
export type CacheKind = "profile" | "categories" | "cycles";

export function userTag(userId: string, kind: CacheKind): string {
  return `${kind}:${userId}`;
}

/** Wrap a per-user loader in the Data Cache, tagged for explicit invalidation. */
export function cachedPerUser<T>(
  userId: string,
  kind: CacheKind,
  loader: () => Promise<T>,
): Promise<T> {
  return unstable_cache(loader, [kind, userId], {
    tags: [userTag(userId, kind)],
    revalidate: 600, // safety-net TTL; explicit revalidateTag is the primary path
  })();
}
