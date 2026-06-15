import "server-only";
import { prisma } from "./prisma";

export function forbiddenReference(name: string): Error {
  return new Error(`${name} does not belong to the current user`);
}

export async function requireAccountOwnedByUser(userId: string, accountId: string) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
    select: { id: true },
  });
  if (!account) throw forbiddenReference("Account");
}

export async function requireCategoryOwnedByUser(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true },
  });
  if (!category) throw forbiddenReference("Category");
}

export async function requireCycleOwnedByUser(userId: string, cycleId: string) {
  const cycle = await prisma.financeCycle.findFirst({
    where: { id: cycleId, userId },
    select: { id: true },
  });
  if (!cycle) throw forbiddenReference("Finance Cycle");
}

export type OwnedTransactionRefs = {
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  accountId: string;
  destinationAccountId?: string | null;
  categoryId?: string | null;
};

export async function requireTransactionRefsOwnedByUser(
  userId: string,
  refs: OwnedTransactionRefs,
) {
  const checks: Promise<void>[] = [requireAccountOwnedByUser(userId, refs.accountId)];

  if (refs.type === "TRANSFER") {
    if (!refs.destinationAccountId) {
      throw new Error("Transfer requires a destination account");
    }
    checks.push(requireAccountOwnedByUser(userId, refs.destinationAccountId));
  } else if (refs.categoryId) {
    checks.push(requireCategoryOwnedByUser(userId, refs.categoryId));
  }

  await Promise.all(checks);
}
