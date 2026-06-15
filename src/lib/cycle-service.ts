import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";
import {
  resolveCycle,
  nextCycle as engineNext,
  previousCycle as enginePrev,
  type CycleConfig,
  type FinanceCycle as EngineCycle,
} from "./cycle-engine";

/** Per-request memoised config rows — shared across every cycle lookup in one render. */
const loadConfigRows = cache(async (userId: string) => {
  return prisma.cycleConfig.findMany({
    where: { userId },
    orderBy: { effectiveFrom: "asc" },
  });
});

export async function loadConfigs(userId: string): Promise<CycleConfig[]> {
  const rows = await loadConfigRows(userId);
  return rows.map((r) => ({ startDay: r.startDay, effectiveFrom: r.effectiveFrom }));
}

/** Active CycleConfig row id for a date — derived from the cached rows (no query). */
async function configIdForDate(userId: string, date: Date): Promise<string> {
  const rows = await loadConfigRows(userId);
  const active = rows
    .filter((r) => r.effectiveFrom.getTime() <= date.getTime())
    .at(-1);
  if (!active) throw new Error("No cycle config for user");
  return active.id;
}

/**
 * Get (or lazily create) the persisted FinanceCycle covering `date`.
 * Cycle boundaries come from the tested CycleEngine.
 */
/** Memoised by cycle-start ISO so repeated lookups of the same cycle hit once per request. */
const cycleByStartIso = cache(
  async (userId: string, startIso: string, endIso: string) => {
    const startDate = new Date(startIso);
    const existing = await prisma.financeCycle.findUnique({
      where: { userId_startDate: { userId, startDate } },
    });
    if (existing) return existing;

    const cycleConfigId = await configIdForDate(userId, startDate);
    return prisma.financeCycle.create({
      data: { userId, startDate, endDate: new Date(endIso), cycleConfigId },
    });
  },
);

export async function ensureCycleForDate(userId: string, date: Date) {
  const configs = await loadConfigs(userId);
  const span: EngineCycle = resolveCycle(configs, date);
  return cycleByStartIso(userId, span.start.toISOString(), span.end.toISOString());
}

export const currentCycle = cache(async (userId: string) => {
  return ensureCycleForDate(userId, new Date());
});

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
