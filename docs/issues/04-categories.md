# 04 — Category store (defaults + ClickUp-style custom)

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ DONE — defaults seeded on first login; ClickUp-style create-on-type with fuzzy suggest; findOrCreateCategory action; dedicated Manage Categories screen with create/edit/delete + icon & colour pickers; defaults protected from deletion.

## What to build

The Category system. Default categories are seeded for the user. While entering a transaction (or in a manage-categories screen), the user can type a new category name and have it saved permanently for future reuse, with fuzzy auto-suggest from existing categories as they type (ClickUp-style). Each category has a name, icon, and color. Default categories cannot be deleted.

## Acceptance criteria

- [ ] `Category` model: id, user_id, name, icon, color, is_default
- [ ] Defaults seeded per user: Food & Dining, Transport, Shopping, Groceries, Entertainment, Health, Utilities, Investment, Salary
- [ ] Create-on-type: a new category typed during entry is persisted and reusable
- [ ] Fuzzy auto-suggest from existing categories while typing
- [ ] Color + icon picker for custom categories
- [ ] Default categories protected from deletion; can be hidden if unused
- [ ] Manage-categories screen lists all categories
- [ ] CategoryStore module encapsulates default/custom logic and no-delete enforcement

## Blocked by

- 01 — Project scaffold + PWA shell + Google Auth
