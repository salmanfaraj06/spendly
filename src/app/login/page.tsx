"use client";

import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex min-h-dvh flex-col justify-between px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-16"
      >
        <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-3xl text-on-hero shadow-[var(--shadow-hero)]" style={{ background: "linear-gradient(150deg, var(--color-hero-from), var(--color-hero-to))" }}>
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9q2.5-2 5 0 2.5 2 0 3-2.5 1.2-5 0" /></svg>
        </div>
        <h1 className="text-[2.75rem] font-extrabold uppercase leading-[0.95] tracking-tight text-text">
          Your expenses,
          <br />
          made <span className="text-accent">simple.</span>
        </h1>
        <p className="mt-5 max-w-xs text-text-muted text-pretty">
          Track income, expenses, budgets, and goals on your own monthly cycle.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="space-y-4"
      >
        <button
          onClick={signInWithGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-surface py-4 font-semibold text-text shadow-[var(--shadow-card)] transition-transform hover:border-accent/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <GoogleMark />
          Continue with Google
        </button>
        <p className="text-center text-xs text-text-dim">
          Private to you. Secured by Supabase Auth.
        </p>
      </motion.div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
