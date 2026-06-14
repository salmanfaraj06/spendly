import { Card, HeroCard, Pill, ProgressBar } from "@/components/ui";
import { ProfileButton } from "@/components/ProfileButton";
import { InsightsCard } from "@/components/InsightsCard";
import { TrendChart, CategoryBars } from "@/components/charts";
import { getInsights } from "@/lib/insights-service";
import { getDueOccurrences } from "@/lib/recurrence-service";
import { lkr, lkrCompact, formatDate } from "@/lib/format";
import { requireUserId } from "@/lib/auth";
import {
  getCurrentCycleView,
  getTotalBalance,
  getCycleTotals,
  getTodaySpend,
  getTransactions,
  getSpendByCategory,
  getBudgetReport,
  getCategories,
  getCycleTrend,
  getProfile,
} from "@/lib/queries";
import { previousCycleOf } from "@/lib/cycle-service";

export default async function HomePage() {
  const userId = await requireUserId();
  const cycle = await getCurrentCycleView(userId);

  const [totalBalance, totals, today, txs, spend, budgetReport, categories, prevCycle, trend, dueOccurrences] =
    await Promise.all([
      getTotalBalance(userId),
      getCycleTotals(userId, cycle.id),
      getTodaySpend(userId, cycle.id),
      getTransactions(userId, cycle.id),
      getSpendByCategory(userId, cycle.id),
      getBudgetReport(userId, cycle.id),
      getCategories(userId),
      previousCycleOf(userId, cycle.startDate),
      getCycleTrend(userId, 7),
      getDueOccurrences(userId),
    ]);

  const profile = await getProfile(userId);
  const insights = txs.length > 0 ? await getInsights(userId, cycle) : [];

  const prevTotals = await getCycleTotals(userId, prevCycle.id);
  const momPct =
    prevTotals.expense > 0
      ? Math.round(((totals.expense - prevTotals.expense) / prevTotals.expense) * 100)
      : 0;

  const catById = new Map(categories.map((c) => [c.id, c]));
  const catBars = spend
    .map((s) => {
      const c = catById.get(s.categoryId);
      return { name: (c?.name ?? "Other").split(" ")[0], value: s.spentLkr, color: c?.color ?? "#34d399" };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const totalBudget = budgetReport.reduce((s, r) => s + r.budgetedLkr, 0);
  const budgetPct = totalBudget > 0 ? Math.round((totals.expense / totalBudget) * 100) : 0;

  const recent = txs.slice(0, 5);
  const empty = txs.length === 0 && totalBalance === 0;

  return (
    <>
      <header className="flex items-center justify-between px-1 pt-2">
        <div>
          <p className="text-xs text-text-muted">
            {formatDate(cycle.startDate)} – {formatDate(new Date(cycle.endDate.getTime() - 86400000))}
          </p>
          <p className="text-sm font-medium text-text-muted">
            {greeting()}{profile?.nickname ? `, ${profile.nickname}` : ""} 👋
          </p>
        </div>
        <ProfileButton avatarEmoji={profile?.avatarEmoji ?? null} />
      </header>

      <HeroCard delay={0.02}>
        <p className="text-xs font-medium uppercase tracking-widest text-on-hero/70">Total Balance</p>
        <p className="mt-1 text-[2.75rem] font-extrabold leading-none tracking-tight">{lkr(totalBalance)}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-xs text-on-hero/70">Income</p>
            <p className="text-lg font-semibold">{lkrCompact(totals.income)}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-xs text-on-hero/70">Expenses</p>
            <p className="text-lg font-semibold">{lkrCompact(totals.expense)}</p>
          </div>
        </div>
      </HeroCard>

      {empty ? (
        <Card delay={0.06}>
          <p className="text-sm font-semibold">Let's get started</p>
          <p className="mt-1 text-sm text-text-muted">
            Add an account, then log your first transaction. Your dashboard fills in as you go.
          </p>
          <a href="/accounts" className="mt-3 inline-block rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-bg">
            Add an account
          </a>
        </Card>
      ) : (
        <>
          {dueOccurrences.length > 0 && (
            <a href="/recurring/due">
              <Card className="flex items-center justify-between border-accent/30 bg-accent/10" delay={0.05}>
                <div>
                  <p className="text-sm font-semibold">{dueOccurrences.length} recurring due</p>
                  <p className="text-xs text-text-muted">Review, post, edit, or skip them</p>
                </div>
                <span className="text-text-dim">›</span>
              </Card>
            </a>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card delay={0.06}>
              <p className="text-xs text-text-muted">Today's Spend</p>
              <p className="mt-1 text-2xl font-bold">{lkr(today)}</p>
            </Card>
            <Card delay={0.08}>
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-muted">vs Last Cycle</p>
                <Pill tone={momPct <= 0 ? "up" : "down"}>
                  {momPct > 0 ? "▲" : "▼"} {Math.abs(momPct)}%
                </Pill>
              </div>
              <p className="mt-1 text-2xl font-bold">{lkrCompact(totals.expense)}</p>
            </Card>
          </div>

          <Card delay={0.09}>
            <p className="mb-3 text-sm font-semibold">This cycle vs last</p>
            <div className="space-y-2.5">
              {([
                ["Income", totals.income, prevTotals.income, true],
                ["Expenses", totals.expense, prevTotals.expense, false],
                ["Net", totals.net, prevTotals.income - prevTotals.expense, true],
              ] as const).map(([label, now, prev, higherIsGood]) => {
                const delta = prev !== 0 ? Math.round(((now - prev) / Math.abs(prev)) * 100) : null;
                const good = delta === null ? true : higherIsGood ? delta >= 0 : delta <= 0;
                return (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{lkrCompact(now)}</span>
                      {delta !== null && (
                        <Pill tone={good ? "up" : "down"}>{delta > 0 ? "▲" : delta < 0 ? "▼" : ""} {Math.abs(delta)}%</Pill>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {totalBudget > 0 && (
            <Card delay={0.1}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold">Budget Utilisation</p>
                <span className="text-sm text-text-muted">
                  {lkrCompact(totals.expense)} / {lkrCompact(totalBudget)}
                </span>
              </div>
              <ProgressBar pct={budgetPct} state={budgetPct > 100 ? "over" : budgetPct >= 80 ? "near" : "ok"} />
              <p className="mt-2 text-xs text-text-muted">{budgetPct}% of total budget used this cycle</p>
            </Card>
          )}

          <InsightsCard lines={insights} delay={0.11} />

          <Card delay={0.12}>
            <p className="mb-2 text-sm font-semibold">7-Month Spending Trend</p>
            <TrendChart data={trend} />
          </Card>

          {catBars.length > 0 && (
            <Card delay={0.14}>
              <p className="mb-1 text-sm font-semibold">Category Breakdown</p>
              <p className="mb-2 text-xs text-text-muted">Total Spendings {lkr(totals.expense)}</p>
              <CategoryBars data={catBars} />
            </Card>
          )}

          <Card delay={0.16}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Recent Transactions</p>
              <a href="/transactions" className="text-xs font-medium text-accent">View all</a>
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-text-muted">No transactions yet this cycle.</p>
            ) : (
              <ul className="space-y-3">
                {recent.map((t) => {
                  const isIncome = t.type === "INCOME";
                  const isTransfer = t.type === "TRANSFER";
                  return (
                    <li key={t.id} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg" style={{ background: `${(t.category?.color ?? "#34d399")}22` }}>
                        {isTransfer ? "🔄" : t.category?.icon ?? "💸"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{t.notes || (isTransfer ? "Transfer" : t.category?.name)}</p>
                        <p className="text-xs text-text-dim">{isTransfer ? "Transfer" : t.category?.name} · {t.date}</p>
                      </div>
                      <p className={`text-sm font-semibold ${isIncome ? "text-accent" : isTransfer ? "text-text-muted" : ""}`}>
                        {isIncome ? "+" : isTransfer ? "" : "-"}{lkr(t.amount)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}
    </>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
