"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

/** The single "pop of green" surface — used for headline/balance cards. */
export function HeroCard({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-[var(--radius-card)] p-5 text-on-hero shadow-[var(--shadow-hero)] ${className}`}
      style={{
        background:
          "linear-gradient(150deg, var(--color-hero-from), var(--color-hero-to))",
      }}
    >
      {/* soft light bloom, single source top-left */}
      <span
        className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #ffffff, transparent 70%)" }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-end justify-between px-1 pt-2">
      <div>
        {subtitle && (
          <p className="text-xs font-medium uppercase tracking-widest text-text-dim">
            {subtitle}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      {action}
    </header>
  );
}

export function ProgressBar({
  pct,
  state = "ok",
}: {
  pct: number;
  state?: "ok" | "near" | "over";
}) {
  const color =
    state === "over" ? "bg-danger" : state === "near" ? "bg-warn" : "bg-accent";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

export function Pill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "up" | "down";
}) {
  const styles = {
    muted: "bg-surface-2 text-text-muted",
    up: "bg-accent/15 text-accent",
    down: "bg-danger/15 text-danger",
  }[tone];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles}`}>
      {children}
    </span>
  );
}
