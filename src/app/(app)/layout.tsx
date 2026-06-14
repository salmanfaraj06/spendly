import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <main className="space-y-5 px-4 pb-32 pt-3">{children}</main>
      <BottomNav />
    </div>
  );
}
