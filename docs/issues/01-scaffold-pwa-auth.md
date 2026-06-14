# 01 — Project scaffold + PWA shell + Google Auth

**Type:** HITL
**Triage:** ready-for-agent
**Status:** ✅ DONE — Next.js 15 + Tailwind v4 + Prisma + Supabase scaffolded; Google OAuth live; middleware route protection; PWA manifest + service worker; 5-tab nav; dark-green theme; real app icons (192/512) generated.

## What to build

Stand up the Next.js 15 (App Router) project with Tailwind CSS, Prisma, and Supabase. Make it an installable mobile-first PWA. Wire Supabase Auth with Google OAuth so the user can sign in and reach a protected app shell. The shell renders the 5-tab bottom navigation (Home, Transactions, Budget, Goals, Accounts) with empty placeholder screens styled in the dark-green theme.

End-to-end path: unauthenticated user → "Sign in with Google" → authenticated → lands on Home shell with working tab nav → can install app to home screen.

## Setup instructions

### 1. Install ORM
```
npm install prisma --save-dev
npx prisma init
```

### 2. Configure ORM

`.env.local`:
```
# Connect to Postgres via the shared transaction-mode pooler (IPv4-only)
DATABASE_URL="postgresql://postgres.lmhwaorotbzdwahoqvhu:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Connect to Postgres via the shared session-mode pooler (used for migrations)
DIRECT_URL="postgresql://postgres.lmhwaorotbzdwahoqvhu:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
```

`prisma/schema.prisma`:
```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 3. Install Agent Skills (Optional)
```
npx skills add supabase/agent-skills
```

## Acceptance criteria

- [ ] Next.js 15 App Router project runs locally with Tailwind configured
- [ ] Prisma connected to Supabase Postgres via pooled `DATABASE_URL` + `DIRECT_URL`
- [ ] Supabase Auth with Google OAuth — sign in and sign out work
- [ ] Unauthenticated users are redirected to a sign-in screen; app routes are protected
- [ ] PWA manifest + service worker present; app is installable on iOS and Android
- [ ] 5-tab bottom nav (Home, Transactions, Budget, Goals, Accounts) renders with placeholder screens
- [ ] Dark-green theme tokens established in Tailwind config (background, accent, surfaces, text)
- [ ] `User` record is created/linked to the Supabase Auth user on first login

## Blocked by

None — can start immediately.
