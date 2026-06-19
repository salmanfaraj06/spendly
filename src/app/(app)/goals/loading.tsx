import { SkelHeader, SkelHero, SkelBars } from "@/components/skeletons";

export default function GoalsLoading() {
  return (
    <>
      <SkelHeader />
      <SkelHero />
      <SkelBars rows={3} />
    </>
  );
}
