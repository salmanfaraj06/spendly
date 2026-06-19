import { SkelHeader, SkelCard } from "@/components/skeletons";

export default function ProfileLoading() {
  return (
    <>
      <SkelHeader />
      <div className="flex flex-col items-center py-2">
        <div className="h-24 w-24 animate-pulse rounded-full bg-surface-2" />
        <div className="mt-3 h-4 w-28 animate-pulse rounded-full bg-surface-2" />
        <div className="mt-2 h-3 w-40 animate-pulse rounded-full bg-surface-2" />
      </div>
      <SkelCard className="h-80" />
    </>
  );
}
