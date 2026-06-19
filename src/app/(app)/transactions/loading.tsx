import { SkelHeader, SkelChips, SkelList } from "@/components/skeletons";

export default function TransactionsLoading() {
  return (
    <>
      <SkelHeader />
      <div className="h-10 w-full animate-pulse rounded-2xl bg-surface" />
      <SkelChips />
      <SkelList rows={6} />
    </>
  );
}
