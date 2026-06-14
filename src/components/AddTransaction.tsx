"use client";

import { useState } from "react";
import { Sheet } from "./Sheet";
import { TransactionForm, type Account, type Category } from "./TransactionForm";

export function AddTransaction({
  accounts,
  categories,
}: {
  accounts: Account[];
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-28 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-bg shadow-[0_8px_30px_rgba(52,211,153,0.4)] active:scale-95 transition-transform"
        aria-label="Add transaction"
      >
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Add Transaction">
        <TransactionForm accounts={accounts} categories={categories} onDone={() => setOpen(false)} />
      </Sheet>
    </>
  );
}
