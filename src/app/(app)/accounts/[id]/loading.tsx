import { SkelHeader, SkelHero, SkelList } from "@/components/skeletons";

export default function AccountDetailLoading() {
  return (
    <>
      <SkelHeader back />
      <SkelHero />
      <SkelList rows={6} />
    </>
  );
}
