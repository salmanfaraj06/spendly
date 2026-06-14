"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "@/app/actions/auth";

export function ProfileButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-lime"
        aria-label="Profile"
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 z-50 w-48 rounded-2xl border border-border bg-bg-elevated p-1.5 shadow-xl"
          >
            <a href="/settings" className="block rounded-xl px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-2">
              Settings
            </a>
            <a href="/categories" className="block rounded-xl px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-2">
              Manage categories
            </a>
            <div className="my-1 h-px bg-border" />
            <form action={signOut}>
              <button
                type="submit"
                className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-danger hover:bg-surface-2"
              >
                Sign out
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
