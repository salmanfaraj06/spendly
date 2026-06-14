import { BottomNav } from "@/components/BottomNav";
import { ToastProvider } from "@/components/Toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-dvh">
        <main className="space-y-5 px-4 pb-32 pt-3">{children}</main>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
