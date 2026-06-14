import "server-only";
import { prisma } from "./prisma";
import {
  resolveCycle,
  nextCycle as engineNext,
  previousCycle as enginePrev,
  type CycleConfig,
  type FinanceCycle as EngineCycle,
} from "./cycle-engine";

async function loadConfigs(userId: string): Promise<CycleConfig[]> {
  const rows = await prisma.cycleConfig.findMany({
    where: { userId },
    orderBy: { effectiveFrom: "asc" },
  });
  return rows.map((r) => ({ startDay: r.startDay, effectiveFrom: r.effectiveFrom }));
}

/** Find the active CycleConfig row id for a given cycle start date. */
async function configIdForDate(userId: string, date: Date): Promise<string> {
  const row = await prisma.cycleConfig.findFirst({
    where: { userId, effectiveFrom: { lte: date } },
    orderBy: { effectiveFrom: "desc" },
  });
  if (!row) throw new Error("No cycle config for user");
  return row.id;
}

/**
 * Get (or lazily create) the persisted FinanceCycle covering `date`.
 * Cycle boundaries come from the tested CycleEngine.
 */
export async function ensureCycleForDate(userId: string, date: Date) {
  const configs = await loadConfigs(userId);
  const span: EngineCycle = resolveCycle(configs, date);

  const existing = await prisma.financeCycle.findUnique({
    where: { userId_startDate: { userId, startDate: span.start } },
  });
  if (existing) return existing;

  const cycleConfigId = await configIdForDate(userId, span.start);
  return prisma.financeCycle.create({
    data: {
      userId,
      startDate: span.start,
      endDate: span.end,
      cycleConfigId,
    },
  });
}

export async function currentCycle(userId: string) {
  return ensureCycleForDate(userId, new Date());
}

export async function nextCycleOf(userId: string, startDate: Date) {
  const configs = await loadConfigs(userId);
  const span = engineNext(configs, resolveCycle(configs, startDate));
  return ensureCycleForDate(userId, span.start);
}

export async function previousCycleOf(userId: string, startDate: Date) {
  const configs = await loadConfigs(userId);
  const span = enginePrev(configs, resolveCycle(configs, startDate));
  return ensureCycleForDate(userId, span.start);
}

/**
 * Change the cycle start day. Per ADR 0001, the new config takes effect at the
 * NEXT cycle boundary — we snap effectiveFrom to the current cycle's end date.
 */
export async function changeCycleStartDay(userId: string, startDay: number) {
  if (startDay < 1 || startDay > 28) throw new Error("startDay must be 1..28");
  const current = await currentCycle(userId);
  await prisma.cycleConfig.create({
    data: {
      userId,
      startDay,
      effectiveFrom: current.endDate, // boundary-aligned — ADR 0001
    },
  });
}
