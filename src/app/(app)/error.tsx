"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

/**
 * Catches render/data errors in any (app) route. In production React masks the
 * message; `error.digest` is the only handle that maps to the full server-side
 * log entry (Vercel → Deployments → the failing function → Runtime Logs).
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App render error:", error.digest ?? error.message, error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-2xl">😵</p>
      <div>
        <p className="text-sm font-semibold">Something went wrong</p>
        <p className="mt-1 text-sm text-text-muted">
          We couldn&apos;t load this page. Try again in a moment.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-bg"
      >
        Try again
      </button>
      {error.digest && (
        <p className="text-xs text-text-dim">Error ID: {error.digest}</p>
      )}
    </div>
  );
}
