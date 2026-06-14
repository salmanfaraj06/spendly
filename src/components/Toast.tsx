"use client";

import { createContext, useContext, useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastState = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
} | null;

const ToastContext = createContext<{
  show: (t: NonNullable<ToastState>) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback(
    (t: NonNullable<ToastState>) => {
      if (timer.current) clearTimeout(timer.current);
      setToast(t);
      timer.current = setTimeout(() => setToast(null), 5000);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="fixed bottom-44 left-1/2 z-[80] flex w-[min(92%,24rem)] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl bg-[#16201b] px-4 py-3 text-sm text-white shadow-[0_12px_40px_-8px_rgba(12,40,24,0.5)]"
          >
            <span>{toast.message}</span>
            {toast.actionLabel && (
              <button
                onClick={() => {
                  toast.onAction?.();
                  dismiss();
                }}
                className="shrink-0 font-semibold text-accent-soft"
              >
                {toast.actionLabel}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}
