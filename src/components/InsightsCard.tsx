"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { Card } from "./ui";
import { refreshInsights } from "@/app/actions";

export function InsightsCard({ lines, delay = 0 }: { lines: string[] | null; delay?: number }) {
  const [pending, start] = useTransition();
  const hasInsights = !!lines && lines.length > 0;

  return (
    <Card delay={delay}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">
          <span className="mr-1.5">✨</span>Smart Insights
        </p>
        <button
          onClick={() => start(() => refreshInsights())}
          disabled={pending}
          className="text-xs font-medium text-accent disabled:opacity-50"
        >
          {pending ? "Generating…" : hasInsights ? "Refresh" : "Generate"}
        </button>
      </div>

      {!hasInsights && (
        <p className="text-sm text-text-muted">
          Tap <span className="font-medium text-accent">Generate</span> to get an AI summary of this cycle&apos;s spending.
        </p>
      )}
      {hasInsights && (
        <ul className="space-y-2.5">
          {lines!.map((line, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="flex gap-2.5 text-sm text-text"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span className="text-pretty">{line}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
}
