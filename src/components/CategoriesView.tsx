"use client";

import { useState, useTransition } from "react";
import { Card } from "./ui";
import { Sheet, inputClass, labelClass } from "./Sheet";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions";

type Cat = { id: string; name: string; icon: string | null; color: string | null; isDefault: boolean };

const ICONS = ["🍔", "🚗", "🛍️", "🥦", "🎬", "💊", "💡", "📈", "💰", "🏷️", "✈️", "🎁", "📚", "🐾"];
const COLORS = ["#f97316", "#3b82f6", "#ec4899", "#22c55e", "#a855f7", "#ef4444", "#eab308", "#14b8a6", "#34d399"];

export function CategoriesView({ categories }: { categories: Cat[] }) {
  const [editing, setEditing] = useState<Cat | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <Card className="p-3">
        <ul className="divide-y divide-border/50">
          {categories.map((c) => (
            <li key={c.id}>
              <button onClick={() => setEditing(c)} className="flex w-full items-center gap-3 py-2.5 text-left active:opacity-70">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg" style={{ background: `${c.color ?? "#34d399"}22` }}>
                  {c.icon ?? "🏷️"}
                </div>
                <span className="flex-1 text-sm font-medium">{c.name}</span>
                {c.isDefault && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-text-dim">Default</span>}
                <span className="text-text-dim">›</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <button onClick={() => setCreating(true)} className="w-full rounded-[var(--radius-card)] border border-dashed border-border bg-surface/40 py-4 text-sm font-medium text-text-muted active:scale-[0.99] transition-transform">
        + New Category
      </button>

      {editing && (
        <CategorySheet
          key={editing.id}
          title="Edit Category"
          initial={editing}
          canDelete={!editing.isDefault}
          onClose={() => setEditing(null)}
        />
      )}
      {creating && <CategorySheet title="New Category" onClose={() => setCreating(false)} />}
    </>
  );
}

function CategorySheet({
  title,
  initial,
  canDelete,
  onClose,
}: {
  title: string;
  initial?: Cat;
  canDelete?: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? ICONS[0]);
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);
  const [pending, start] = useTransition();

  function save() {
    if (!name.trim()) return;
    start(async () => {
      if (initial) await updateCategory(initial.id, { name, icon, color });
      else await createCategory({ name, icon, color });
      onClose();
    });
  }
  function remove() {
    if (!initial) return;
    start(async () => {
      await deleteCategory(initial.id);
      onClose();
    });
  }

  return (
    <Sheet open onClose={onClose} title={title}>
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Subscriptions" />
        </div>
        <div>
          <label className={labelClass}>Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((i) => (
              <button key={i} onClick={() => setIcon(i)} className={`flex h-10 w-10 items-center justify-center rounded-2xl text-lg ${icon === i ? "bg-accent/20 ring-2 ring-accent" : "bg-surface"}`}>{i}</button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Colour</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((cl) => (
              <button key={cl} onClick={() => setColor(cl)} className={`h-9 w-9 rounded-full ${color === cl ? "ring-2 ring-offset-2 ring-offset-bg-elevated ring-white" : ""}`} style={{ background: cl }} />
            ))}
          </div>
        </div>
        <button onClick={save} disabled={pending} className="w-full rounded-2xl bg-accent py-3.5 font-semibold text-bg active:scale-[0.98] transition-transform disabled:opacity-50">
          {pending ? "Saving…" : "Save"}
        </button>
        {canDelete && (
          <button onClick={remove} disabled={pending} className="w-full rounded-2xl border border-danger/40 py-3 text-sm font-semibold text-danger active:scale-[0.98] transition-transform disabled:opacity-50">
            Delete Category
          </button>
        )}
      </div>
    </Sheet>
  );
}
