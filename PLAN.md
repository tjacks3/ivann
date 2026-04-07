# ivann — Supabase Auth Implementation Plan

## Context

The ivann MVP needs a working authentication system. Supabase clients, middleware, OAuth callback, auth page layouts, and the users DB schema already exist. The `useUser()` hook was a stub. Auth pages were placeholders. This plan documents how everything was wired together: login/signup forms, social login, session handling, route protection, and onboarding profile creation.

---

## Supabase Setup Guide (step-by-step)

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account)
2. Click **New Project**
3. Choose an organization (or create one)
4. Set a project name (e.g., `ivann`), database password (save it!), and region
5. Click **Create new project** — wait ~2 minutes for provisioning

### Step 2: Get Your API Keys

1. In the Supabase Dashboard, go to **Settings → API**
2. Copy these values into your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  (the "anon public" key)
SUPABASE_SERVICE_ROLE_KEY=eyJ...      (the "service_role" key — keep secret)
```

### Step 3: Get Your Database URL

1. In the Dashboard, go to **Settings → Database**
2. Under **Connection string**, select **URI** tab
3. Copy the URI and replace `[YOUR-PASSWORD]` with the DB password from Step 1
4. Add to `.env.local`:

```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Step 4: Push the Database Schema

Run this command to push the Drizzle schema (creates the `users` table):

```bash
npm run db:push
```

### Step 5: Set Up Row-Level Security (RLS)

1. In the Dashboard, go to **SQL Editor**
2. Run these SQL commands:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

-- Users can update their own row
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);
```

INSERT is handled server-side via Drizzle (not through the Supabase client), so no insert policy is needed.

### Step 6: Configure Auth Redirect URLs

1. Go to **Authentication → URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (or your production URL)
3. Add to **Redirect URLs**: `http://localhost:3000/api/auth/callback`

### Step 7: Enable Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or select existing)
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
4. Application type: **Web application**
5. Add **Authorized redirect URI**: `https://<your-project-ref>.supabase.co/auth/v1/callback`
6. Copy the **Client ID** and **Client Secret**
7. In Supabase Dashboard → **Authentication → Providers → Google**: toggle ON, paste Client ID + Secret, save

### Step 8: Enable Facebook OAuth

1. Go to [Facebook Developer Portal](https://developers.facebook.com)
2. Create a new app (type: Consumer)
3. Add **Facebook Login** product
4. Under Settings → **Valid OAuth Redirect URIs**: add `https://<your-project-ref>.supabase.co/auth/v1/callback`
5. Copy the **App ID** and **App Secret**
6. In Supabase Dashboard → **Authentication → Providers → Facebook**: toggle ON, paste App ID + Secret, save

### Step 9: Verify Your `.env.local`

Your `.env.local` should now have at minimum:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The remaining env vars (Stripe, Resend, Sentry) are not needed for auth and can stay as placeholders.

---

## Auth Architecture

### Auth Methods Supported

- Email + password
- Email magic link
- Google OAuth
- Facebook OAuth

### Auth Flow

1. **Signup**: User fills form → `signUp()` → Supabase sends confirmation email → user clicks link → callback route → no profile → `/onboarding` → select role → `createProfile` server action → redirect to dashboard
2. **Login (password)**: User fills form → `signInWithPassword()` → redirect home → middleware routes appropriately
3. **Login (magic link)**: User enters email → `signInWithOtp()` → "check your email" → click link → callback → role-based redirect
4. **Login (social)**: Click Google/Facebook → Supabase OAuth flow → callback → check profile → redirect
5. **Sign out**: UserMenu → `signOut()` → redirect to home
6. **Protected routes**: Middleware checks auth on every request. No session → `/login`. Session on auth pages → `/`

### Route Protection

Middleware (`src/lib/supabase/middleware.ts`) runs on every request:

- **Protected routes** (`/creator/*`, `/brand/*`, `/messages`, `/packages`, `/settings`, `/onboarding`): unauthenticated → redirect to `/login`
- **Auth routes** (`/login`, `/signup`, `/forgot-password`): authenticated → redirect to `/`
- **Public routes** (`/`, `/discover`, `/about`): no restrictions

### Session Management

- Supabase SSR handles cookies automatically via `@supabase/ssr`
- Middleware refreshes auth tokens on every request
- `useUser()` hook uses React Query for client-side caching (5min stale time)
- Auth state changes (login/logout) invalidate the query cache

---

## Files Created for Auth

| File | Purpose |
|------|---------|
| `src/lib/validations/auth.ts` | Zod schemas for login, signup, forgot-password, magic link |
| `src/components/auth/social-buttons.tsx` | Google + Facebook OAuth buttons |
| `src/components/auth/auth-divider.tsx` | "Or continue with" divider |
| `src/app/(auth)/onboarding/actions.ts` | Server action to create user profile via Drizzle |

## Files Modified for Auth

| File | Change |
|------|--------|
| `src/hooks/use-user.ts` | Real Supabase auth + profile query via React Query |
| `src/app/(auth)/login/page.tsx` | Full login form with email/password, magic link, social |
| `src/app/(auth)/signup/page.tsx` | Full signup form with validation + social |
| `src/app/(auth)/forgot-password/page.tsx` | Password reset form |
| `src/app/(auth)/onboarding/page.tsx` | Wired role selection to `createProfile` server action |
| `src/app/api/auth/callback/route.ts` | Role-based redirect after OAuth/email confirmation |
| `src/lib/supabase/middleware.ts` | Route protection (unauthed → login, authed → away from auth) |
| `src/components/layout/user-menu.tsx` | Wired sign-out button |
| `src/i18n/locales/en.json` | Added ~25 auth-related translation keys |

---

## Project Structure Overview

```
src/
├── app/
│   ├── (auth)/                  # Auth pages (split-panel layout)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── onboarding/
│   │       ├── page.tsx
│   │       └── actions.ts       # createProfile server action
│   ├── (app)/                   # Authenticated pages
│   │   ├── layout.tsx           # Header + MobileNav
│   │   ├── messages/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── packages/page.tsx
│   │   ├── creator/profile/page.tsx
│   │   └── brand/dashboard/page.tsx
│   ├── (marketing)/             # Public pages
│   │   ├── layout.tsx           # Header + Footer
│   │   ├── page.tsx             # Home
│   │   ├── discover/page.tsx
│   │   └── about/page.tsx
│   └── api/
│       ├── auth/callback/route.ts
│       └── webhooks/stripe/route.ts
├── components/
│   ├── auth/                    # Auth-specific components
│   │   ├── social-buttons.tsx
│   │   └── auth-divider.tsx
│   ├── layout/                  # App shell components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── mobile-nav.tsx
│   │   ├── user-menu.tsx
│   │   └── language-selector.tsx
│   ├── shared/                  # Reusable primitives
│   │   ├── page-container.tsx
│   │   ├── section-header.tsx
│   │   ├── empty-state.tsx
│   │   └── loading-state.tsx
│   ├── profile/                 # Profile components
│   │   ├── profile-header.tsx
│   │   ├── platform-card.tsx
│   │   └── platform-grid.tsx
│   ├── marketing/
│   │   └── hero-section.tsx
│   └── ui/                      # shadcn/ui primitives
├── hooks/
│   ├── use-user.ts              # Auth state (React Query + Supabase)
│   └── use-supabase.ts          # Memoized Supabase client
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── middleware.ts         # Session refresh + route protection
│   ├── validations/
│   │   └── auth.ts              # Zod schemas
│   ├── stripe/index.ts
│   ├── email/index.ts
│   ├── providers.tsx
│   └── utils.ts
├── db/
│   ├── schema/
│   │   ├── users.ts             # Users table (authId, email, role, etc.)
│   │   └── index.ts
│   ├── migrations/
│   └── index.ts                 # Drizzle client
├── i18n/
│   ├── index.tsx                # LanguageProvider, useTranslation
│   └── locales/                 # 12 locale JSON files
├── config/
│   └── env.ts                   # Zod-validated env vars
└── types/
    └── index.ts                 # UserRole, NavItem, HeaderVariant
```

---

## Verification Checklist

- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run dev` — all routes return 200
- [ ] Login page renders form with email/password + social buttons
- [ ] Signup page renders form with social buttons
- [ ] Forgot password shows email form, success message on submit
- [ ] Middleware: unauthenticated `/messages` → redirects to `/login`
- [ ] Middleware: authenticated `/login` → redirects to `/`
- [ ] Sign out clears session and redirects home
- [ ] Auth callback redirects to `/onboarding` (no profile) or dashboard (has profile)
- [ ] Onboarding creates profile row and redirects to role-based dashboard
