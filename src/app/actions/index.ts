"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { ensureCycleForDate, changeCycleStartDay } from "@/lib/cycle-service";

// ── Accounts ────────────────────────────────────────────────────────────
export async function createAccount(input: {
  name: string;
  icon?: string;
  color?: string;
  openingBalance: number;
}) {
  const userId = await requireUserId();
  await prisma.account.create({
    data: {
      userId,
      name: input.name,
      icon: input.icon ?? "💼",
      color: input.color ?? "#34d399",
      openingBalance: input.openingBalance,
    },
  });
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function updateAccount(
  id: string,
  input: { name: string; icon?: string; color?: string; openingBalance: number },
) {
  const userId = await requireUserId();
  await prisma.account.updateMany({
    where: { id, userId },
    data: {
      name: input.name,
      icon: input.icon,
      color: input.color,
      openingBalance: input.openingBalance,
    },
  });
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function deleteAccount(id: string) {
  const userId = await requireUserId();
  await prisma.account.deleteMany({ where: { id, userId } });
  revalidatePath("/accounts");
  revalidatePath("/");
}

// ── Categories (ClickUp-style create-on-type) ────────────────────────────
export async function findOrCreateCategory(name: string): Promise<string> {
  const userId = await requireUserId();
  const trimmed = name.trim();
  const existing = await prisma.category.findFirst({
    where: { userId, name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) return existing.id;
  const created = await prisma.category.create({
    data: { userId, name: trimmed, icon: "🏷️", color: "#34d399", isDefault: false },
  });
  revalidatePath("/transactions");
  return created.id;
}

export async function updateCategory(
  id: string,
  input: { name: string; icon?: string; color?: string },
) {
  const userId = await requireUserId();
  await prisma.category.updateMany({
    where: { id, userId },
    data: { name: input.name.trim(), icon: input.icon, color: input.color },
  });
  revalidatePath("/categories");
}

export async function deleteCategory(id: string) {
  const userId = await requireUserId();
  // Defaults cannot be deleted.
  const cat = await prisma.category.findFirst({ where: { id, userId } });
  if (!cat || cat.isDefault) throw new Error("Default categories cannot be deleted");
  await prisma.category.deleteMany({ where: { id, userId, isDefault: false } });
  revalidatePath("/categories");
}

export async function createCategory(input: { name: string; icon?: string; color?: string }) {
  const userId = await requireUserId();
  await prisma.category.create({
    data: {
      userId,
      name: input.name.trim(),
      icon: input.icon ?? "🏷️",
      color: input.color ?? "#34d399",
      isDefault: false,
    },
  });
  revalidatePath("/categories");
}

// ── Transactions ─────────────────────────────────────────────────────────
type TxInput = {
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  date: string; // yyyy-mm-dd
  notes?: string;
  categoryId?: string | null;
  accountId: string;
  destinationAccountId?: string | null;
};

export async function createTransaction(input: TxInput) {
  const userId = await requireUserId();
  const date = new Date(`${input.date}T00:00:00.000Z`);
  const cycle = await ensureCycleForDate(userId, date);

  if (input.type === "TRANSFER" && !input.destinationAccountId) {
    throw new Error("Transfer requires a destination account");
  }

  // Single row models both legs of a transfer (source + destination);
  // BalanceEngine applies them atomically when deriving balances.
  await prisma.transaction.create({
    data: {
      userId,
      cycleId: cycle.id,
      type: input.type,
      amount: input.amount,
      date,
      notes: input.notes ?? "",
      categoryId: input.type === "TRANSFER" ? null : input.categoryId ?? null,
      accountId: input.accountId,
      destinationAccountId:
        input.type === "TRANSFER" ? input.destinationAccountId : null,
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath("/budget");
}

export async function updateTransaction(id: string, input: TxInput) {
  const userId = await requireUserId();
  const date = new Date(`${input.date}T00:00:00.000Z`);
  const cycle = await ensureCycleForDate(userId, date);

  if (input.type === "TRANSFER" && !input.destinationAccountId) {
    throw new Error("Transfer requires a destination account");
  }

  await prisma.transaction.updateMany({
    where: { id, userId },
    data: {
      cycleId: cycle.id,
      type: input.type,
      amount: input.amount,
      date,
      notes: input.notes ?? "",
      categoryId: input.type === "TRANSFER" ? null : input.categoryId ?? null,
      accountId: input.accountId,
      destinationAccountId:
        input.type === "TRANSFER" ? input.destinationAccountId : null,
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath("/budget");
}

export async function deleteTransaction(id: string) {
  const userId = await requireUserId();
  await prisma.transaction.deleteMany({ where: { id, userId } });
  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath("/budget");
}

// ── Budgets ──────────────────────────────────────────────────────────────
export async function setBudgetTemplate(categoryId: string, amountLkr: number) {
  const userId = await requireUserId();
  await prisma.budgetTemplate.upsert({
    where: { userId_categoryId: { userId, categoryId } },
    create: { userId, categoryId, amountLkr },
    update: { amountLkr },
  });
  revalidatePath("/budget");
  revalidatePath("/");
}

export async function overrideCycleBudget(
  cycleId: string,
  categoryId: string,
  amountLkr: number,
) {
  await requireUserId();
  await prisma.cycleBudget.upsert({
    where: { cycleId_categoryId: { cycleId, categoryId } },
    create: { cycleId, categoryId, amountLkr, isOverride: true },
    update: { amountLkr, isOverride: true },
  });
  revalidatePath("/budget");
}

// ── Goals ────────────────────────────────────────────────────────────────
export async function createGoal(input: { name: string; targetAmountLkr: number }) {
  const userId = await requireUserId();
  const cycle = await ensureCycleForDate(userId, new Date());
  await prisma.goal.create({
    data: {
      userId,
      cycleId: cycle.id,
      name: input.name,
      targetAmountLkr: input.targetAmountLkr,
    },
  });
  revalidatePath("/goals");
}

export async function updateGoalProgress(
  id: string,
  achievedAmountLkr: number,
  status?: "ACTIVE" | "ACHIEVED" | "MISSED",
) {
  const userId = await requireUserId();
  await prisma.goal.updateMany({
    where: { id, userId },
    data: { achievedAmountLkr, ...(status ? { status } : {}) },
  });
  revalidatePath("/goals");
}

// ── Cycle config ─────────────────────────────────────────────────────────
export async function updateCycleStartDay(startDay: number) {
  const userId = await requireUserId();
  await changeCycleStartDay(userId, startDay);
  revalidatePath("/");
}
