"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-[2rem] border-t border-border bg-bg-elevated p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] no-scrollbar"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <h2 className="mb-4 text-lg font-bold">{title}</h2>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-text placeholder:text-text-dim transition-colors focus:border-accent focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

export const labelClass = "mb-1.5 block text-xs font-medium text-text-muted";
