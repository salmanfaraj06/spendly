import { ScreenHeader } from "@/components/ui";
import { CategoriesView } from "@/components/CategoriesView";
import { requireUserId } from "@/lib/auth";
import { getCategories } from "@/lib/queries";

export default async function CategoriesPage() {
  const userId = await requireUserId();
  const categories = await getCategories(userId);

  return (
    <>
      <ScreenHeader subtitle="Manage" title="Categories" />
      <CategoriesView
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          isDefault: c.isDefault,
        }))}
      />
    </>
  );
}
