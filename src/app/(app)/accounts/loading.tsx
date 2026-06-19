import { SkelHeader, SkelHero, SkelList } from "@/components/skeletons";

export default function AccountsLoading() {
  return (
    <>
      <SkelHeader />
      <SkelHero />
      <SkelList rows={3} />
    </>
  );
}
