import { SkelHeader, SkelHero, SkelCard, SkelBars } from "@/components/skeletons";

export default function BudgetLoading() {
  return (
    <>
      <SkelHeader />
      <SkelCard className="h-14" />
      <SkelHero />
      <SkelBars rows={5} />
    </>
  );
}
