export default function AppLoading() {
  return (
    <div className="space-y-5 px-1 pt-2">
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded-full bg-surface-2" />
        <div className="h-7 w-40 animate-pulse rounded-full bg-surface-2" />
      </div>
      <div className="h-36 animate-pulse rounded-[var(--radius-card)] bg-surface" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 animate-pulse rounded-[var(--radius-card)] bg-surface" />
        <div className="h-24 animate-pulse rounded-[var(--radius-card)] bg-surface" />
      </div>
      <div className="h-28 animate-pulse rounded-[var(--radius-card)] bg-surface" />
    </div>
  );
}
