import "server-only";
import { prisma } from "./prisma";
import { dueOccurrences } from "./recurrence-engine";
import { currentCycle, ensureCycleForDate, previousCycleOf } from "./cycle-service";
import { requireTransactionRefsOwnedByUser } from "./tenant-guard";

const num = (d: { toNumber(): number } | null | undefined) =>
  d ? d.toNumber() : 0;

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const fromIso = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

function tomorrowUtc(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

export type DueOccurrence = {
  recurringTransactionId: string;
  dueDate: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  accountId: string;
  accountName: string;
  destinationAccountId: string | null;
  destinationAccountName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  notes: string;
  frequency: "MONTHLY" | "WEEKLY";
};

export type DueOccurrencePostInput = {
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  accountId: string;
  destinationAccountId?: string | null;
  categoryId?: string | null;
  notes?: string;
};

export async function getDueOccurrences(userId: string, now = new Date()): Promise<DueOccurrence[]> {
  const templates = await prisma.recurringTransaction.findMany({
    where: { userId, active: true },
    orderBy: { createdAt: "asc" },
    include: {
      occurrences: true,
    },
  });
  if (templates.length === 0) return [];

  const current = await currentCycle(userId);
  const previous = await previousCycleOf(userId, current.startDate);
  const windowEnd = tomorrowUtc(now);

  const [accounts, categories] = await Promise.all([
    prisma.account.findMany({ where: { userId } }),
    prisma.category.findMany({ where: { userId } }),
  ]);
  const accountById = new Map(accounts.map((a) => [a.id, a]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const out = templates.flatMap((template) => {
    const dates = dueOccurrences(
      {
        frequency: template.frequency,
        dayOfMonth: template.dayOfMonth ?? undefined,
        weekday: template.weekday ?? undefined,
        anchorDate: template.anchorDate,
      },
      previous.startDate,
      windowEnd,
      template.occurrences.map((o) => o.dueDate),
    );

    const account = accountById.get(template.accountId);
    const destinationAccount = template.destinationAccountId
      ? accountById.get(template.destinationAccountId)
      : null;
    const category = template.categoryId ? categoryById.get(template.categoryId) : null;

    return dates.map((dueDate) => ({
      recurringTransactionId: template.id,
      dueDate: isoDate(dueDate),
      type: template.type,
      amount: num(template.amount),
      accountId: template.accountId,
      accountName: account?.name ?? "Missing account",
      destinationAccountId: template.destinationAccountId,
      destinationAccountName: destinationAccount?.name ?? null,
      categoryId: template.categoryId,
      categoryName: category?.name ?? null,
      categoryIcon: category?.icon ?? null,
      notes: template.notes ?? "",
      frequency: template.frequency,
    }));
  });

  return out.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export async function confirmDueOccurrence(
  userId: string,
  recurringTransactionId: string,
  dueDateIso: string,
  input?: DueOccurrencePostInput,
) {
  const dueDate = fromIso(dueDateIso);
  const template = await prisma.recurringTransaction.findFirst({
    where: { id: recurringTransactionId, userId, active: true },
  });
  if (!template) throw new Error("Recurring template not found");

  const existing = await prisma.recurringOccurrence.findUnique({
    where: { recurringTransactionId_dueDate: { recurringTransactionId, dueDate } },
  });
  if (existing) return;

  const payload = input ?? {
    type: template.type,
    amount: num(template.amount),
    accountId: template.accountId,
    destinationAccountId: template.destinationAccountId,
    categoryId: template.categoryId,
    notes: template.notes ?? "",
  };

  if (payload.type === "TRANSFER" && !payload.destinationAccountId) {
    throw new Error("Transfer requires a destination account");
  }
  await requireTransactionRefsOwnedByUser(userId, payload);

  const cycle = await ensureCycleForDate(userId, dueDate);
  await prisma.$transaction(async (tx) => {
    const seen = await tx.recurringOccurrence.findUnique({
      where: { recurringTransactionId_dueDate: { recurringTransactionId, dueDate } },
    });
    if (seen) return;

    const posted = await tx.transaction.create({
      data: {
        userId,
        cycleId: cycle.id,
        type: payload.type,
        amount: payload.amount,
        date: dueDate,
        notes: payload.notes ?? "",
        categoryId: payload.type === "TRANSFER" ? null : payload.categoryId ?? null,
        accountId: payload.accountId,
        destinationAccountId:
          payload.type === "TRANSFER" ? payload.destinationAccountId : null,
      },
    });

    await tx.recurringOccurrence.create({
      data: {
        recurringTransactionId,
        dueDate,
        status: "CONFIRMED",
        postedTransactionId: posted.id,
      },
    });
  });
}

export async function skipDueOccurrence(
  userId: string,
  recurringTransactionId: string,
  dueDateIso: string,
) {
  const dueDate = fromIso(dueDateIso);
  const template = await prisma.recurringTransaction.findFirst({
    where: { id: recurringTransactionId, userId, active: true },
  });
  if (!template) throw new Error("Recurring template not found");

  await prisma.recurringOccurrence.upsert({
    where: { recurringTransactionId_dueDate: { recurringTransactionId, dueDate } },
    create: { recurringTransactionId, dueDate, status: "SKIPPED" },
    update: {},
  });
}
