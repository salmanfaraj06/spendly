import { ScreenHeader } from "@/components/ui";
import { DueOccurrencesView } from "@/components/DueOccurrencesView";
import { requireUserId } from "@/lib/auth";
import { getAccounts, getCategories } from "@/lib/queries";
import { getDueOccurrences } from "@/lib/recurrence-service";

export default async function DueRecurringPage() {
  const userId = await requireUserId();
  const [occurrences, accounts, categories] = await Promise.all([
    getDueOccurrences(userId),
    getAccounts(userId),
    getCategories(userId),
  ]);

  return (
    <>
      <ScreenHeader subtitle="Review" title="Recurring Due" />
      <DueOccurrencesView
        occurrences={occurrences}
        accounts={accounts.map((a) => ({ id: a.id, name: a.name, icon: a.icon }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon }))}
      />
    </>
  );
}
