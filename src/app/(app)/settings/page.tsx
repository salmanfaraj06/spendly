import Link from "next/link";
import { ScreenHeader, Card } from "@/components/ui";
import { CycleSettings } from "@/components/CycleSettings";
import { ExportPanel } from "@/components/ExportPanel";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentCycle } from "@/lib/cycle-service";
import { formatDate } from "@/lib/format";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const [activeConfig, cycle] = await Promise.all([
    prisma.cycleConfig.findFirst({
      where: { userId, effectiveFrom: { lte: new Date() } },
      orderBy: { effectiveFrom: "desc" },
    }),
    currentCycle(userId),
  ]);

  return (
    <>
      <ScreenHeader subtitle="Settings" title="Settings" />

      <CycleSettings
        currentStartDay={activeConfig?.startDay ?? 25}
        nextCycleStart={formatDate(cycle.endDate)}
      />

      <Link href="/categories">
        <Card className="flex items-center justify-between">
          <span className="text-sm font-semibold">Manage Categories</span>
          <span className="text-text-dim">›</span>
        </Card>
      </Link>

      <Link href="/recurring">
        <Card className="flex items-center justify-between">
          <span className="text-sm font-semibold">Manage Recurring</span>
          <span className="text-text-dim">›</span>
        </Card>
      </Link>

      <ExportPanel />
    </>
  );
}
