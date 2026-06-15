import { InsightsCard } from "./InsightsCard";
import { Card } from "./ui";
import { getCachedInsights } from "@/lib/insights-service";
import { getCurrentCycleView } from "@/lib/queries";

/** Reads cached insights only — never generates on load. Generation happens
 *  solely when the user taps Generate/Refresh (refreshInsights action). */
export async function HomeInsights({ userId }: { userId: string }) {
  const cycle = await getCurrentCycleView(userId);
  const lines = await getCachedInsights(userId, cycle.id);
  return <InsightsCard lines={lines} delay={0} />;
}

export function InsightsSkeleton() {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold"><span className="mr-1.5">✨</span>Smart Insights</p>
      </div>
      <div className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
            <span className="h-3 flex-1 animate-pulse rounded bg-surface-2" style={{ maxWidth: `${90 - i * 12}%` }} />
          </div>
        ))}
      </div>
    </Card>
  );
}
