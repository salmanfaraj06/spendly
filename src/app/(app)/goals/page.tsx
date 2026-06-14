import { ScreenHeader, Card, HeroCard } from "@/components/ui";
import { AddGoal } from "@/components/AddGoal";
import { GoalCard } from "@/components/GoalCard";
import { lkr } from "@/lib/format";
import { requireUserId } from "@/lib/auth";
import { getCurrentCycleView, getGoals, getAnnualGoals } from "@/lib/queries";

export default async function GoalsPage() {
  const userId = await requireUserId();
  const cycle = await getCurrentCycleView(userId);
  const year = cycle.startDate.getUTCFullYear();

  const [goals, annual] = await Promise.all([
    getGoals(userId, cycle.id),
    getAnnualGoals(userId, year),
  ]);

  const annualTarget = annual.reduce((s, g) => s + g.targetAmountLkr, 0);
  const annualAchieved = annual.reduce((s, g) => s + g.achievedAmountLkr, 0);
  const annualPct = annualTarget > 0 ? Math.round((annualAchieved / annualTarget) * 100) : 0;

  return (
    <>
      <ScreenHeader subtitle="This Cycle" title="Goals" />

      <HeroCard>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-widest text-on-hero/70">{year} Annual Progress</p>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">{annualPct}%</span>
        </div>
        <p className="mt-1 text-3xl font-extrabold tracking-tight">{lkr(annualAchieved)}</p>
        <p className="text-xs text-on-hero/70">of {lkr(annualTarget)} targeted this year</p>
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(annualPct, 100)}%` }} />
          </div>
        </div>
      </HeroCard>

      {goals.length === 0 ? (
        <Card>
          <p className="text-sm text-text-muted">No goals this cycle yet. Tap + to set a monthly savings or investment target.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} />
          ))}
        </div>
      )}

      <AddGoal />
    </>
  );
}
