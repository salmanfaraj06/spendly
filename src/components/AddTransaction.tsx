"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sheet } from "./Sheet";
import { TransactionForm, type Account, type Category, type TxType } from "./TransactionForm";

export function AddTransaction({
  accounts,
  categories,
}: {
  accounts: Account[];
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const [presetType, setPresetType] = useState<TxType | undefined>();
  const params = useSearchParams();
  const router = useRouter();

  // Deep link / PWA shortcut: /transactions?add=expense|income opens the sheet.
  useEffect(() => {
    const add = params.get("add");
    if (add === "expense" || add === "income") {
      setPresetType(add.toUpperCase() as TxType);
      setOpen(true);
      router.replace("/transactions");
    }
  }, [params, router]);

  return (
    <>
      <button
        onClick={() => { setPresetType(undefined); setOpen(true); }}
        className="fixed bottom-28 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-on-hero shadow-[var(--shadow-hero)] active:scale-95 transition-transform"
        aria-label="Add transaction"
      >
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Add Transaction">
        <TransactionForm
          accounts={accounts}
          categories={categories}
          presetType={presetType}
          onDone={() => setOpen(false)}
        />
      </Sheet>
    </>
  );
}
