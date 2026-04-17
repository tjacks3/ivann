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

### Add test users

npm run db:add-test — adds one test creator + one test brand
npm run db:add-test -- creator — adds a creator only
npm run db:add-test -- brand — adds a brand only

### Add Creators for testing the Discover view

### Flow for Collaborations and Offers

Flow
Brand sends offer:

1. Browse Discover → click creator card → view public profile
2. Click "Send Offer" (top right) or "Select" on a package card
3. Form appears inline with package pre-selected (if applicable), budget auto-filled
4. Submit → success state with confirmation

Creator receives:

1. Navigate to Collaborations (nav link)
2. See incoming requests with status badges
3. Expand message, view budget/deadline/package
4. Accept or Decline (with optional reason)

Brand tracks:

1. Navigate to Collaborations
2. See sent requests with current status

#### Flow

1. Brand sends collab request → Creator accepts → Thread auto-created
2. Both users see thread in Messages inbox with unread indicator
3. Click thread → full chat view with message history
4. Type + Enter or click Send → message appears instantly
5. Other user sees unread badge update via 30s polling + Supabase Realtime on INSERT
6. Opening thread marks it as read, clearing the badge

### Notifications

Trigger Summary
Event Recipient In-App Email
New collab request Creator Yes Yes
Collab accepted Brand Yes Yes
Collab declined Brand Yes Yes
New message Other thread member Yes No

### Color Palette

Role Hex Variable
#040f0f Primary text --foreground, --card-foreground, --popover-foreground
#248232 Ivann green --primary, --ring, --sidebar-primary
#2ba84a Secondary green --secondary-foreground, --accent-foreground, --highlight
#F8F8F8 Background --background
White #fff Button text on green --primary-foreground

### Landing Pages

Landing Pages (3)
Main (/) — main-landing.tsx
Hero → Stats bar → How it works (3 steps) → For Creators value prop → For Brands value prop → Platform features (8-grid) → Final CTA

Creators (/creators) — creator-landing.tsx
Hero (creator-focused) → Why creators choose ivann (3 features) → Profile showcase → Service packages → Collaboration flow → More features (4-grid) → FAQ (6 questions) → Final CTA

Brands (/brands) — brand-landing.tsx
Hero (brand-focused) → Stats bar → Why brands use ivann (3 features) → Discovery → Collaboration flow → Campaign management → Built for efficiency (4-grid) → FAQ (6 questions) → Final CTA

Modified Files
footer.tsx — Added "For Creators" and "For Brands" links, two-row layout
page.tsx — Rewritten with metadata + MainLandingPage component
Architecture
Logo always links to / (unchanged)
/creators and /brands are standalone marketing routes, not in main nav
All pages share the marketing layout (header + footer)
Each page has unique Metadata with title, description, and OG tags
Reusable components mean new persona pages can be built quickly

### Simple commands

Prefer simple, maintainable patterns
reduce duplication
improve responsive behavior for tablet and mobile
improve loading, empty, and error states
keep the UI polished and minimal
do not rewrite unrelated parts of the codebase

### Matching Algorithm Restructured

Global mode (localOnly=false): Weights are Platform (30), Category (40), Budget (30). Zero location influence.
Local mode (localOnly=true): Location is a hard filter — non-local creators are excluded entirely. No fallback to irrelevant creators. If <3 results found, shows a low-results banner. If 0 results, shows a dedicated empty state suggesting to expand radius or disable local-only.

### How Campaign Goal Works

Here's how the "What's your campaign goal?" step works:

Two input modes — presets or custom free text.

The brand sees a row of 5 preset pill buttons:

Build local awareness
Promote a new menu item
Announce a grand opening
Drive weekend visits
Promote a special offer
Plus a "Custom" button at the end.

Preset mode (default): The brand taps one pill — it highlights in green, and that preset key (e.g. local_awareness) is stored as the campaignIntent value. Only one can be selected at a time.

Custom mode: If none of the presets fit, the brand taps "Custom" — a textarea appears where they can type a free-text goal (up to 500 characters). The presets deselect.

How it's used downstream:

The campaignIntent value flows into templates.ts where it maps preset keys to opener sentences for the outreach message (e.g. local_awareness → "We're looking to build more local awareness for our business."). Custom text is used as-is.
It also populates the campaign plan's goal field that the brand reviews before sending.
The value is stored in the quick_collab_requests table for record-keeping.
It does not affect creator matching — the matching algorithm uses platform, category, budget, and optionally location, but not the campaign intent.

### NEW TEST BRAND USERS

Brand Email Password
Green Plate Kitchen brand@greenplate.example.com TestPass123!
FitPulse brand@fitpulse.example.com TestPass123!
WanderLuxe Travel brand@wanderluxe.example.com TestPass123!
GlowUp Beauty brand@glowup.example.com TestPass123!
LearnLoop brand@learnloop.example.com TestPass123!
NovaStream brand@novastream.example.com TestPass123!
Urban Roots Co. brand@urbanroots.example.com TestPass123!
Peak Capital Advisors brand@peakcapital.example.com TestPass123!
ByteCraft brand@bytecraft.example.com TestPass123!
TrailBlaze Outdoors brand@trailblaze.example.com TestPass123!

### Escrow workflow

1. Deal accepted → brand sees "Fund Deal" button with correct amount
2. Brand clicks "Fund Deal" → payment status moves to funded
3. Creator sees "Payment Secured" badge after funding
4. Creator delivers + brand completes → payment auto-released
5. Deal cancelled while funded → payment auto-refunded
6. Duplicate funding prevented
7. Payment section hidden for draft/negotiating deals
8. Brand dashboard shows "Total Spent" + last 5 transactions
9. Creator dashboard shows "Total Earned" + last 5 transactions
10. Mobile responsive
