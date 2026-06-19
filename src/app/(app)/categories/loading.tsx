import { SkelHeader, SkelList } from "@/components/skeletons";

export default function CategoriesLoading() {
  return (
    <>
      <SkelHeader />
      <SkelList rows={7} />
    </>
  );
}
