import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  exportTransactionsCsv,
  exportBudgetSummariesCsv,
  exportGoalProgressCsv,
  exportAccountBalancesCsv,
} from "@/lib/export-service";
import { getBudgetReport, getGoals } from "@/lib/queries";

const num = (d: { toNumber(): number } | null | undefined) => (d ? d.toNumber() : 0);

function csvResponse(filename: string, body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

/** Parse ?from=&to= into a Prisma date filter (inclusive). */
function dateRange(url: URL) {
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const range: { gte?: Date; lte?: Date } = {};
  if (from) range.gte = new Date(`${from}T00:00:00.000Z`);
  if (to) range.lte = new Date(`${to}T23:59:59.999Z`);
  return Object.keys(range).length ? range : undefined;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const userId = await requireUserId();
  const { type } = await params;
  const url = new URL(req.url);
  const range = dateRange(url);

  // Cycles overlapping the requested range (by start date), or all cycles.
  const cycleWhere = range ? { userId, startDate: range } : { userId };

  switch (type) {
    case "transactions": {
      const txs = await prisma.transaction.findMany({
        where: { userId, ...(range ? { date: range } : {}) },
        orderBy: { date: "desc" },
        include: { category: true, account: true, cycle: true },
      });
      const csv = exportTransactionsCsv(
        txs.map((t) => ({
          date: t.date.toISOString().slice(0, 10),
          type: t.type,
          amount: num(t.amount),
          category: t.category?.name ?? "",
          account: t.account.name,
          notes: t.notes ?? "",
          cycleId: t.cycleId,
          cycleStart: t.cycle.startDate.toISOString().slice(0, 10),
          cycleEnd: t.cycle.endDate.toISOString().slice(0, 10),
        })),
      );
      return csvResponse("transactions.csv", csv);
    }

    case "budgets": {
      const cycles = await prisma.financeCycle.findMany({ where: cycleWhere });
      const rows = [];
      for (const c of cycles) {
        const report = await getBudgetReport(userId, c.id);
        const label = c.startDate.toISOString().slice(0, 10);
        for (const r of report) {
          rows.push({
            cycle: label,
            category: r.category?.name ?? "",
            budgetedAmount: r.budgetedLkr,
            spentAmount: r.spentLkr,
            remaining: r.remainingLkr,
            utilisationPct: Number.isFinite(r.utilisationPct) ? r.utilisationPct : 0,
          });
        }
      }
      return csvResponse("budget-summaries.csv", exportBudgetSummariesCsv(rows));
    }

    case "goals": {
      const cycles = await prisma.financeCycle.findMany({ where: cycleWhere });
      const rows = [];
      for (const c of cycles) {
        const goals = await getGoals(userId, c.id);
        const label = c.startDate.toISOString().slice(0, 10);
        for (const g of goals) {
          rows.push({
            cycle: label,
            goalName: g.name,
            targetAmount: g.targetAmountLkr,
            achievedAmount: g.achievedAmountLkr,
            status: g.status,
          });
        }
      }
      return csvResponse("goal-progress.csv", exportGoalProgressCsv(rows));
    }

    case "accounts": {
      // Per-account, per-cycle running balances with income/expense/transfer breakdown.
      const [accounts, cycles, txs] = await Promise.all([
        prisma.account.findMany({ where: { userId } }),
        prisma.financeCycle.findMany({ where: cycleWhere, orderBy: { startDate: "asc" } }),
        prisma.transaction.findMany({ where: { userId } }),
      ]);

      const rows = [];
      for (const a of accounts) {
        // Running opening carried across cycles (chronological).
        let opening = num(a.openingBalance);
        for (const c of cycles) {
          const cycleTxs = txs.filter((t) => t.cycleId === c.id);
          let income = 0, expense = 0, tIn = 0, tOut = 0;
          for (const t of cycleTxs) {
            const amt = num(t.amount);
            if (t.type === "INCOME" && t.accountId === a.id) income += amt;
            if (t.type === "EXPENSE" && t.accountId === a.id) expense += amt;
            if (t.type === "TRANSFER" && t.accountId === a.id) tOut += amt;
            if (t.type === "TRANSFER" && t.destinationAccountId === a.id) tIn += amt;
          }
          const closing = opening + income - expense + tIn - tOut;
          rows.push({
            account: a.name,
            cycle: c.startDate.toISOString().slice(0, 10),
            openingBalance: opening,
            closingBalance: closing,
            totalIncome: income,
            totalExpenses: expense,
            totalTransfersIn: tIn,
            totalTransfersOut: tOut,
          });
          opening = closing;
        }
      }
      return csvResponse("account-balances.csv", exportAccountBalancesCsv(rows));
    }

    default:
      return new Response("Unknown export type", { status: 404 });
  }
}
