import { SkelHeader, SkelCard } from "@/components/skeletons";

export default function SettingsLoading() {
  return (
    <>
      <SkelHeader />
      <SkelCard className="h-40" />
      <SkelCard className="h-14" />
      <SkelCard className="h-44" />
    </>
  );
}
