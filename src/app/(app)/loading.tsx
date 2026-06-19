import { SkelHeader, SkelHero, SkelCard } from "@/components/skeletons";

// Home dashboard skeleton (matches src/app/(app)/page.tsx).
export default function HomeLoading() {
  return (
    <>
      <SkelHeader />
      <SkelHero />
      <div className="grid grid-cols-2 gap-4">
        <SkelCard className="h-24" />
        <SkelCard className="h-24" />
      </div>
      <SkelCard className="h-28" />
      <SkelCard className="h-32" />
      <SkelCard className="h-40" />
    </>
  );
}
