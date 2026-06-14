# 10 — Profile (name, nickname, emoji avatar)

**Type:** AFK
**Triage:** ready-for-agent
**Status:** ✅ Done

## What to build
A Profile (1:1 with User) holding fullName, nickname, avatarEmoji. Provisioned from the Google identity on first login. A `/profile` screen to view/edit it; the Home greeting uses the nickname; email + currency shown read-only.

## Acceptance criteria
- [x] `Profile` model 1:1 with User (fullName, nickname, avatarEmoji)
- [x] Provisioned from Google name on first login (extends ensureUserProvisioned)
- [x] `/profile` screen: edit fullName, nickname, pick emoji avatar
- [x] Read-only email + LKR currency shown
- [x] Home greeting reads nickname; profile button opens `/profile`

## Blocked by
None — can start immediately.
