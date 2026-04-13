# QuickCollab Feature

## Context
Small businesses need a guided, low-friction way to find local creators and send collaboration offers. Instead of endlessly browsing the Discover page, QuickCollab walks brands through a short intake → curated matching → campaign builder → outreach flow. Brand-only, authenticated.

## User Flow
1. Brand dashboard CTA → `/brand/quick-collab`
2. Multi-step intake (business info, collab type, intent, location, budget, timing)
3. Curated creator matches (3–7 results with fit labels)
4. Auto-generated campaign summary (editable)
5. Pre-filled outreach messages per creator (editable)
6. Send → creates real collaboration requests + notifications
7. Tracking dashboard at `/brand/quick-collab/tracking`

---

## Database Schema

### New Enums (add to `src/db/schema/enums.ts`)
```
qc_business_category: restaurant, cafe, retail, beauty, service, other
qc_collab_type: instagram_story, instagram_post, reel_short_video, tiktok_post, podcast_mention
qc_budget_range: under_50, 50_100, 100_250, 250_500, 500_plus
qc_timing: asap, this_week, this_month, flexible
qc_match_status: recommended, selected, skipped
qc_outreach_status: draft, sent, viewed, replied, accepted, declined
```

### New Tables (all in `src/db/schema/quick-collab.ts`)

**quick_collab_requests**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | defaultRandom |
| brand_id | uuid FK→users | cascade, indexed |
| business_name | varchar(255) | |
| business_category | qc_business_category enum | |
| collab_type | qc_collab_type enum | |
| campaign_intent | varchar(500) | preset key or free text |
| city | varchar(100) | |
| state | varchar(100) | |
| radius | integer | nullable, miles |
| budget_range | qc_budget_range enum | |
| timing | qc_timing enum | |
| notes | text | nullable |
| created_at / updated_at | timestamptz | |

**quick_collab_matches**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| request_id | uuid FK→requests | cascade, indexed |
| creator_id | uuid FK→users | cascade, indexed |
| match_score | integer | 0–100 |
| fit_label | varchar(100) | "Great local fit", etc. |
| fit_reasons | text[] | array of reason strings |
| estimated_budget_fit | boolean | default false |
| status | qc_match_status enum | default "recommended" |
| created_at | timestamptz | |

**quick_collab_campaigns**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| request_id | uuid FK→requests | unique, cascade |
| goal | text | |
| deliverable | text | |
| budget_per_creator | varchar(100) | |
| timeline | varchar(200) | |
| summary | text | full plan text |
| is_edited | boolean | default false |
| created_at / updated_at | timestamptz | |

**quick_collab_outreaches**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| campaign_id | uuid FK→campaigns | cascade, indexed |
| match_id | uuid FK→matches | cascade |
| creator_id | uuid FK→users | cascade, indexed |
| message | text | |
| status | qc_outreach_status enum | default "draft", indexed |
| collab_request_id | uuid FK→collaboration_requests | nullable, set null |
| sent_at | timestamptz | nullable |
| viewed_at | timestamptz | nullable |
| replied_at | timestamptz | nullable |
| created_at / updated_at | timestamptz | |

---

## File Plan

### New Files (22)
| File | Purpose |
|---|---|
| `src/db/schema/quick-collab.ts` | 4 tables + relations + type exports |
| `src/lib/validations/quick-collab.ts` | Zod schemas for intake + campaign edit |
| `src/lib/quick-collab/matching.ts` | Weighted scoring: platform, category, location, budget, followers |
| `src/lib/quick-collab/templates.ts` | Campaign plan + outreach message generation (pure string interpolation) |
| `src/app/(app)/brand/quick-collab/actions.ts` | Server actions: create request, match, generate campaign, send outreach, tracking |
| `src/hooks/use-quick-collab.ts` | React Query hook for wizard state + mutations |
| `src/hooks/use-quick-collab-tracking.ts` | React Query hook for tracking dashboard |
| `src/app/(app)/brand/quick-collab/page.tsx` | Main wizard page (multi-step flow) |
| `src/app/(app)/brand/quick-collab/tracking/page.tsx` | Tracking dashboard page |
| `src/components/quick-collab/intake-stepper.tsx` | Reuse existing Stepper with QC step labels |
| `src/components/quick-collab/step-business-info.tsx` | Step 1: business name + category |
| `src/components/quick-collab/step-collab-type.tsx` | Step 2: platform/content type cards |
| `src/components/quick-collab/step-campaign-intent.tsx` | Step 3: quick-select presets or free text |
| `src/components/quick-collab/step-location.tsx` | Step 4: city + state + optional radius |
| `src/components/quick-collab/step-budget.tsx` | Step 5: budget range cards |
| `src/components/quick-collab/step-timing.tsx` | Step 6: timing cards + optional notes |
| `src/components/quick-collab/creator-match-list.tsx` | 3–7 matched creators grid |
| `src/components/quick-collab/creator-match-card.tsx` | Match card with fit label, select/skip |
| `src/components/quick-collab/creator-detail-drawer.tsx` | Sheet with full creator info + why recommended |
| `src/components/quick-collab/campaign-summary.tsx` | Editable campaign plan card |
| `src/components/quick-collab/outreach-editor.tsx` | Per-creator editable messages + send |
| `src/components/quick-collab/tracking-list.tsx` | Tracking table/list with status filters |

### Modified Files (4)
| File | Change |
|---|---|
| `src/db/schema/enums.ts` | Add 6 new pgEnum declarations |
| `src/db/schema/index.ts` | Add `export * from "./quick-collab"` |
| `src/app/(app)/brand/dashboard/page.tsx` | Add QuickCollab CTA card in Quick Actions |
| `src/i18n/locales/en.json` | Add `quickCollab.*` translation keys (~80 keys) |

---

## Server Actions (`src/app/(app)/brand/quick-collab/actions.ts`)

All use `getAuthUser()` + verify `role === "brand"`.

| Action | Input | Output | Notes |
|---|---|---|---|
| `createQuickCollabRequest` | intake form values | `{ requestId }` | Validates with Zod, inserts request row |
| `matchCreators` | requestId | `{ matches: MatchedCreator[] }` | Calls matching.ts, inserts match rows, returns 3–7 |
| `updateMatchStatus` | matchId, status | `{ success }` | "selected" or "skipped" |
| `generateCampaign` | requestId | `{ campaign }` | Calls templates.ts, inserts campaign row |
| `updateCampaign` | campaignId, edits | `{ success }` | Sets isEdited=true |
| `generateOutreachMessages` | campaignId | `{ outreaches[] }` | Per-creator messages from templates, inserts draft rows |
| `updateOutreachMessage` | outreachId, message | `{ success }` | Edit before send |
| `sendOutreaches` | outreachId[] | `{ sentCount }` | Creates real collab requests, links back, sends notifications |
| `getQuickCollabTracking` | — | `{ outreaches[] }` | Joins with collab_requests for effective status |
| `getQuickCollabRequest` | requestId | full request+matches+campaign+outreaches | For resuming |

---

## Matching Algorithm (`src/lib/quick-collab/matching.ts`)

Weighted scoring (0–100) on **all published creators** — location is a bonus, not a filter. The goal is to surface the best-fit creators regardless of where they are, while giving a boost to local ones.

| Factor | Max Points | Logic |
|---|---|---|
| Platform match | 30 | Creator has social account on required platform(s). Hard requirement — score 0 if no platform match. |
| Category/niche overlap | 30 | Intersection of creator categories with business→niche mapping. More overlap = more points. |
| Budget/follower fit | 25 | Creator follower tier falls in budget-appropriate range |
| Location bonus | 15 | City match=15, state match=10 — bonus points, not a filter |

Maps:
- `collabType → platform[]`: instagram_story→instagram, reel_short_video→[instagram,tiktok,youtube], etc.
- `businessCategory → creatorCategories[]`: restaurant→[food,lifestyle], beauty→[beauty,lifestyle,fashion], etc.
- `budgetRange → followerRange`: under_50→0-5k, 50_100→1k-15k, 100_250→5k-50k, etc.

Fit labels (based on highest-scoring factor):
- category≥25 → "Strong niche match"
- budgetFit && category≥15 → "Good budget fit"
- location≥10 → "Great local fit"
- else → "Potential match"

Filter: must have platform match (score>0 on platform), score≥25 overall, sort desc, take top 7.

---

## Message Templates (`src/lib/quick-collab/templates.ts`)

Pure string interpolation, no AI.

**Campaign plan**: Maps intake fields to structured summary (goal, deliverable, budget/creator, timeline).

**Outreach message**: Template with variables:
```
Hi {firstName}, I'm {businessName}, a local {category} in {city}.
{intentOpener} I came across your profile and think you'd be a great fit — {topFitReason}.
I'm looking for {deliverableLabel} and my budget is {budgetLabel}. {timingSentence}
Would you be interested? Best, {brandContactName}
```

Predefined maps for intentOpener, timingSentence, deliverableLabel, budgetLabel.

---

## Integration with Existing Systems

**Sending outreach → creates real `collaboration_requests`** rows with:
- title: "QuickCollab: {collabTypeLabel} for {businessName}"
- message: the outreach message
- budget: midpoint of budget range in cents
- deadline: derived from timing preference
- status: "pending"

Links `outreach.collab_request_id` back. Sends notification + email via existing `createAndEmail`.

**Status sync**: Tracking dashboard joins `outreaches` ↔ `collaboration_requests` to reflect accept/decline from normal collab flow.

**Post-accept**: Creator accepts via existing flow → message thread created automatically. Tracking card shows "Go to Messages" link.

---

## Implementation Order

| Phase | Files | Depends On |
|---|---|---|
| 1. Schema | enums.ts, quick-collab.ts, index.ts | — |
| 2. Migration | SQL push/migrate | Phase 1 |
| 3. Validation + Logic | validations/quick-collab.ts, matching.ts, templates.ts | Phase 1 |
| 4. Server Actions | actions.ts | Phase 3 |
| 5. Hooks | use-quick-collab.ts, use-quick-collab-tracking.ts | Phase 4 |
| 6. Step Components | 6 intake steps + stepper | Phase 5 |
| 7. Match Components | match-list, match-card, detail-drawer | Phase 5 |
| 8. Campaign + Outreach | campaign-summary, outreach-editor | Phase 5 |
| 9. Pages | quick-collab/page.tsx, tracking/page.tsx | Phase 6–8 |
| 10. Dashboard CTA | brand/dashboard/page.tsx | Phase 9 |
| 11. Tracking | tracking-list.tsx | Phase 5 |
| 12. Translations | en.json | All phases |
| 13. Type-check + test | — | All phases |

---

## Verification
1. Brand user sees "Start QuickCollab" CTA on dashboard
2. Full intake flow completes with all 6 steps
3. Matching returns 3–7 creators with fit labels
4. Creator detail drawer shows full info + why recommended
5. Campaign summary auto-generates and is editable
6. Outreach messages pre-fill per creator and are editable
7. Send creates real collaboration requests visible in `/collaborations`
8. Creator receives notification for each outreach
9. Tracking dashboard shows all sent outreaches with correct statuses
10. Status updates when creator accepts/declines via normal collab flow
11. Mobile responsive at every step
12. Empty/loading states throughout
