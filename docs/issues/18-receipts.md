# 18 — Receipt photos

**Type:** HITL
**Triage:** ready-for-agent
**Status:** ⏳ TODO

## What to build
Attach a photo to a transaction. Private per-user Supabase Storage bucket, client-side compression, signed-URL display, full-screen viewer, remove/replace. (HITL: needs the Storage bucket + policies set up in Supabase.)

## Acceptance criteria
- [ ] Private Supabase Storage bucket + per-user access policies
- [ ] `Transaction.receiptPath` column
- [ ] Attach control in add/edit sheet; image compressed before upload
- [ ] Full-screen receipt viewer; remove/replace
- [ ] Receipts private to the owner

## Blocked by
None — but requires Supabase Storage setup (HITL).
