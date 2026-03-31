# ivann

Creator monetization marketplace — connecting influencers with brands for paid collaborations.

## Tech Stack

| Layer          | Technology                  |
| -------------- | --------------------------- |
| Framework      | Next.js 16 (App Router)     |
| Language       | TypeScript                  |
| Styling        | Tailwind CSS v4 + shadcn/ui |
| Forms          | React Hook Form + Zod       |
| Data Fetching  | TanStack Query              |
| Database       | PostgreSQL (Supabase)       |
| ORM            | Drizzle                     |
| Auth           | Supabase Auth               |
| Storage        | Supabase Storage            |
| Realtime       | Supabase Realtime           |
| Payments       | Stripe Connect              |
| Email          | Resend                      |
| Error Tracking | Sentry                      |
| Deployment     | Vercel                      |

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account
- A [Resend](https://resend.com) account

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local` with your actual credentials.

### 3. Set up the database

Push the Drizzle schema to your Supabase database:

```bash
npm run db:push
```

Or generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages (login, register, forgot-password)
│   ├── (dashboard)/        # Authenticated pages (dashboard, profile, etc.)
│   ├── (marketing)/        # Public pages (landing page)
│   └── api/                # API routes (auth callback, webhooks)
├── components/
│   ├── layout/             # Header, footer, navigation
│   ├── forms/              # Reusable form components
│   └── ui/                 # shadcn/ui primitives
├── config/                 # Environment validation
├── db/
│   ├── schema/             # Drizzle table definitions
│   ├── migrations/         # Generated SQL migrations
│   └── index.ts            # Database client
├── hooks/                  # Custom React hooks
├── lib/
│   ├── supabase/           # Supabase client/server/middleware helpers
│   ├── stripe/             # Stripe server client
│   ├── email/              # Resend client
│   ├── providers.tsx       # App-wide providers (Query, Theme)
│   └── utils.ts            # shadcn/ui utility (cn)
└── types/                  # Shared TypeScript types
```

## Scripts

| Command               | Description                 |
| --------------------- | --------------------------- |
| `npm run dev`         | Start dev server            |
| `npm run build`       | Production build            |
| `npm run start`       | Start production server     |
| `npm run lint`        | Run ESLint                  |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate`  | Run Drizzle migrations      |
| `npm run db:push`     | Push schema directly (dev)  |
| `npm run db:studio`   | Open Drizzle Studio GUI     |

## Localization

All locales show "up to date" because they already have all 37 keys. The script works correctly — `--dry-run` now runs without an API key, and it detects that no translations are needed.

### How to use it

| Command                          | What it does                                             |
| -------------------------------- | -------------------------------------------------------- |
| `npm run translate`              | Translates only new/missing keys across all locales      |
| `npm run translate:force`        | Re-translates all keys from scratch                      |
| `npm run translate -- es fr`     | Translates only specific locales                         |
| `npm run translate -- --dry-run` | Preview what would be translated without calling the API |

### Setup

Add `ANTHROPIC_API_KEY=sk-ant-...` to your `.env.local`.

### Workflow

1. Edit `en.json` with new keys.
2. Run `npm run translate`.  
   The script diffs against existing locale files — it only translates missing keys and removes stale ones, minimizing API calls.
