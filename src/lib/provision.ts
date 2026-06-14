import { prisma } from "./prisma";

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", icon: "🍔", color: "#f97316" },
  { name: "Transport", icon: "🚗", color: "#3b82f6" },
  { name: "Shopping", icon: "🛍️", color: "#ec4899" },
  { name: "Groceries", icon: "🥦", color: "#22c55e" },
  { name: "Entertainment", icon: "🎬", color: "#a855f7" },
  { name: "Health", icon: "💊", color: "#ef4444" },
  { name: "Utilities", icon: "💡", color: "#eab308" },
  { name: "Investment", icon: "📈", color: "#14b8a6" },
  { name: "Salary", icon: "💰", color: "#10b981" },
];

const DEFAULT_CYCLE_START_DAY = 25;

/**
 * Idempotently provision a new user's domain data on first login:
 * the User row, default categories, and an initial CycleConfig (25th).
 */
export async function ensureUserProvisioned(userId: string, email: string) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (existing) return;

  await prisma.$transaction([
    prisma.user.create({ data: { id: userId, email } }),
    prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId, isDefault: true })),
    }),
    prisma.cycleConfig.create({
      data: {
        userId,
        startDay: DEFAULT_CYCLE_START_DAY,
        // Epoch so it governs all history until the user changes it.
        effectiveFrom: new Date(Date.UTC(2000, 0, 1)),
      },
    }),
  ]);
}
