import { ScreenHeader } from "@/components/ui";
import { RecurringTemplatesView } from "@/components/RecurringTemplatesView";
import { requireUserId } from "@/lib/auth";
import { getAccounts, getCategories, getRecurringTemplates } from "@/lib/queries";

export default async function RecurringPage() {
  const userId = await requireUserId();
  const [templates, accounts, categories] = await Promise.all([
    getRecurringTemplates(userId),
    getAccounts(userId),
    getCategories(userId),
  ]);

  return (
    <>
      <ScreenHeader subtitle="Automations" title="Recurring" />
      <RecurringTemplatesView
        templates={templates}
        accounts={accounts.map((a) => ({ id: a.id, name: a.name, icon: a.icon }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon }))}
      />
    </>
  );
}
