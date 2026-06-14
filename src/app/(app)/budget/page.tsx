import { ScreenHeader, Card, HeroCard, ProgressBar } from "@/components/ui";
import { SetBudget } from "@/components/SetBudget";
import { BudgetCard, type BudgetItem } from "@/components/BudgetCard";
import { CycleNav } from "@/components/CycleNav";
import { lkr, lkrCompact } from "@/lib/format";
import { requireUserId } from "@/lib/auth";
import { getCycleViewFor, getBudgetReport, getCategories, getCurrentCycleView } from "@/lib/queries";
import { previousCycleOf, nextCycleOf } from "@/lib/cycle-service";

const iso = (d: Date) => d.toISOString().slice(0, 10);

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ cycle?: string }>;
}) {
  const userId = await requireUserId();
  const { cycle: cycleParam } = await searchParams;

  const [cycle, current] = await Promise.all([
    getCycleViewFor(userId, cycleParam),
    getCurrentCycleView(userId),
  ]);
  const [report, categories, prev, next] = await Promise.all([
    getBudgetReport(userId, cycle.id),
    getCategories(userId),
    previousCycleOf(userId, cycle.startDate),
    nextCycleOf(userId, cycle.startDate),
  ]);

  const isCurrent = cycle.id === current.id;
  const totalBudget = report.reduce((s, r) => s + r.budgetedLkr, 0);
  const totalSpent = report.reduce((s, r) => s + r.spentLkr, 0);
  const totalPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const items: BudgetItem[] = report
    .sort((a, b) => b.utilisationPct - a.utilisationPct)
    .map((r) => ({
      categoryId: r.categoryId,
      categoryName: r.category?.name ?? "Uncategorised",
      categoryIcon: r.category?.icon ?? null,
      categoryColor: r.category?.color ?? null,
      budgetedLkr: r.budgetedLkr,
      spentLkr: r.spentLkr,
      remainingLkr: r.remainingLkr,
      utilisationPct: r.utilisationPct,
      state: r.state,
    }));

  return (
    <>
      <ScreenHeader subtitle="Budget" title="Budget" />

      <CycleNav
        basePath="/budget"
        startDate={iso(cycle.startDate)}
        endDate={iso(new Date(cycle.endDate.getTime() - 86400000))}
        prevStart={iso(prev.startDate)}
        nextStart={iso(next.startDate)}
        isCurrent={isCurrent}
      />

      {report.length === 0 ? (
        <Card>
          <p className="text-sm font-semibold">No budgets set</p>
          <p className="mt-1 text-sm text-text-muted">Tap + to set a monthly budget for a category. It carries forward every cycle.</p>
        </Card>
      ) : (
        <>
          <HeroCard>
            <p className="text-xs font-medium uppercase tracking-widest text-on-hero/70">Total Budget</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">{lkr(totalBudget)}</p>
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(totalPct, 100)}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-on-hero/80">
                <span>Spent {lkrCompact(totalSpent)}</span>
                <span>{lkrCompact(totalBudget - totalSpent)} left</span>
              </div>
            </div>
          </HeroCard>

          <div className="space-y-3">
            {items.map((item) => (
              <BudgetCard key={item.categoryId} item={item} cycleId={cycle.id} />
            ))}
          </div>
        </>
      )}

      <SetBudget categories={categories} />
    </>
  );
}
