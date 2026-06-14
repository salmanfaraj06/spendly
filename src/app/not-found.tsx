import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <p className="text-6xl font-extrabold tracking-tight text-accent">404</p>
      <h1 className="mt-3 text-xl font-bold">We couldn&apos;t find that page</h1>
      <p className="mt-2 max-w-xs text-sm text-text-muted text-pretty">
        The page you&apos;re looking for has moved or never existed.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-on-hero shadow-[var(--shadow-hero)] transition-transform active:scale-[0.98]"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
