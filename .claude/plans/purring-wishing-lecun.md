# Collaboration Launch Flow - Implementation Plan

## Context

When a creator accepts a deal, the app currently just updates the status and notifies the brand. There's no guided workflow to take both parties through briefing, content creation, submission, and approval. This plan adds a post-acceptance Collaboration Workspace that actively guides both sides to completion.

---

## Phase 1: Database Schema

### 1.1 Add `collaboration_state` enum to [enums.ts](src/db/schema/enums.ts)

```ts
export const collaborationStateEnum = pgEnum("collaboration_state", [
  "awaiting_brand_brief",
  "awaiting_creator_confirmation",
  "revision_requested",
  "in_progress",
  "submitted",
  "completed",
]);
```

### 1.2 Create new schema file: `src/db/schema/collaborations.ts`

Three tables following the exact patterns from [deals.ts](src/db/schema/deals.ts) (same imports, same FK/index style, same relations pattern):

**`collaborations` table:**
- `id` (uuid PK), `dealId` (uuid FK unique → deals), `brandUserId` / `creatorId` (uuid FK → users)
- `state` (collaborationStateEnum, default `awaiting_brand_brief`)
- `deliverableType` (varchar 100), `dueDate` (timestamp), `budgetAmount` (integer, cents)
- `briefData` (jsonb), `submittedUrl` (text), `submittedNote` (text)
- `approvedAt`, `completedAt`, `revisionRequestedAt`, `createdAt`, `updatedAt` (timestamps)
- Indexes: dealId (unique), brandUserId, creatorId, state

**`collaboration_messages` table:**
- `id` (uuid PK), `collaborationId` (FK → collaborations), `senderId` (FK → users, nullable for system)
- `body` (text), `isSystemEvent` (boolean default false), `createdAt` (timestamp)
- Index: collaborationId + createdAt

**`collaboration_state_history` table:**
- `id` (uuid PK), `collaborationId` (FK → collaborations)
- `fromState` (varchar), `toState` (varchar), `changedBy` (FK → users nullable), `note` (text), `createdAt`

Export types + relations. Add `collaboration: one(collaborations, ...)` relation to `dealsRelations` in [deals.ts](src/db/schema/deals.ts).

### 1.3 Update [schema/index.ts](src/db/schema/index.ts)

Add `export * from "./collaborations";`

### 1.4 Generate migration

`npx drizzle-kit generate`

---

## Phase 2: Validation Schemas

### Create `src/lib/validations/collaboration-workspace.ts`

Follow exact pattern from [validations/deal.ts](src/lib/validations/deal.ts) and [validations/collaboration.ts](src/lib/validations/collaboration.ts):

**`briefSchema`:** campaignGoal (string min 10 max 1000), productOrService (string min 2 max 255), requiredMentions (string max 1000 optional), tagsHashtags (string max 500 optional), location (string max 255 optional), postingWindowStart (string optional), postingWindowEnd (string optional), specialInstructions (string max 2000 optional), restrictions (string max 1000 optional)

**`deliverableSubmissionSchema`:** contentUrl (string url), note (string max 2000 optional)

**`collabMessageSchema`:** body (string min 1 max 2000)

Export inferred types: `BriefValues`, `DeliverableSubmissionValues`, `CollabMessageValues`

---

## Phase 3: Server Actions

### 3.1 Create `src/app/(app)/collaboration-workspace/actions.ts`

Follow exact patterns from [deals/actions.ts](src/app/(app)/deals/actions.ts):
- Reuse the `getUser()` auth helper pattern (same `getAuthUser()` → db lookup)
- Reuse `createAndEmail()` from [lib/notifications/create.ts](src/lib/notifications/create.ts) for all notifications
- Reuse the `STATUS_TRANSITIONS` map pattern for state machine validation
- Return `{ success: true/false as const, error?: string }` pattern

State transition map (mirrors `STATUS_TRANSITIONS` pattern from deals):
```
awaiting_brand_brief → awaiting_creator_confirmation  (brand: submitBrief)
awaiting_creator_confirmation → in_progress            (creator: confirmDeliverable)
awaiting_creator_confirmation → revision_requested     (creator: requestBriefChanges)
revision_requested → awaiting_creator_confirmation     (brand: resubmit brief)
in_progress → submitted                               (creator: submitDeliverable)
submitted → completed                                 (brand: approveDeliverable)
submitted → in_progress                               (brand: requestRevision)
```

**Actions:**
1. `createCollaboration(dealId)` — creates workspace, seeds system message "Collaboration workspace created", notifies both parties via `createAndEmail()` with `actionUrl: /collaboration-workspace/{id}`
2. `submitBrief(collaborationId, briefData)` — brand only, validates with `briefSchema.safeParse()`, updates briefData JSONB
3. `confirmDeliverable(collaborationId)` — creator only, also updates deal status to `in_progress` via existing `deals` table update
4. `requestBriefChanges(collaborationId, message)` — creator only, posts message + system event
5. `submitDeliverable(collaborationId, data)` — creator only, validates with `deliverableSubmissionSchema`, updates deal to `delivered`
6. `approveDeliverable(collaborationId)` — brand only, sets `approvedAt`/`completedAt`, updates deal to `completed`, calls `releasePayment()` from [payment-actions.ts](src/app/(app)/deals/payment-actions.ts)
7. `requestRevision(collaborationId, message)` — brand only, clears submitted data, sets `revisionRequestedAt`
8. `sendCollabMessage(collaborationId, body)` — either party, validates with `collabMessageSchema`
9. `getCollaboration(collaborationId)` — fetch full data with party info (same user fields pattern as `getDeal()`)
10. `getCollaborationMessages(collaborationId)` — messages with sender info, ordered by createdAt asc
11. `getCollaborationByDealId(dealId)` — lookup by deal for linking

Helper: `transitionState()` — validates current state, updates state + `updatedAt`, inserts history row, posts system message

### 3.2 Modify [deals/actions.ts](src/app/(app)/deals/actions.ts) `updateDealStatus`

After line 513 (successful status update to "accepted"), auto-create collaboration:
```ts
if (newStatus === "accepted") {
  const { createCollaboration } = await import("@/app/(app)/collaboration-workspace/actions");
  createCollaboration(dealId).catch(() => {});
}
```

---

## Phase 4: React Query Hook

### Create `src/hooks/use-collaboration-workspace.ts`

Follow exact pattern from [use-messages.ts](src/hooks/use-messages.ts):
- `useQuery` for collaboration data (key: `["collaboration-workspace", id]`, staleTime: 30_000)
- `useQuery` for messages (key: `["collaboration-messages", id]`, staleTime: 30_000)
- Supabase realtime: `supabase.channel(`collab:${id}`)` listening to `postgres_changes` INSERT on `collaboration_messages` filtered by `collaboration_id=eq.${id}`
- On realtime event: `queryClient.invalidateQueries({ queryKey: ["collaboration-messages", id] })` and `["collaboration-workspace", id]`
- Cleanup channel on unmount (same useEffect pattern as use-messages.ts)
- Returns `{ collaboration, messages, isLoading, refetch }`

---

## Phase 5: Frontend Components & Page

### Reusable components/patterns from existing codebase

Every component below reuses these existing pieces:
- **Layout:** `PageContainer` (from [shared/page-container.tsx](src/components/shared/page-container.tsx)), `SectionHeader` (from [shared/section-header.tsx](src/components/shared/section-header.tsx))
- **States:** `LoadingState` (from [shared/loading-state.tsx](src/components/shared/loading-state.tsx)), `EmptyState` (from [shared/empty-state.tsx](src/components/shared/empty-state.tsx))
- **UI primitives:** `Card`/`CardHeader`/`CardContent`/`CardFooter`, `Button`, `Input`, `Textarea`, `Label`, `Badge`, `Avatar`/`AvatarImage`/`AvatarFallback`, `Select`, `Progress`/`ProgressTrack`/`ProgressIndicator` — all from `@/components/ui/`
- **Forms:** `useForm` + `zodResolver` pattern from [collaborations/request-form.tsx](src/components/collaborations/request-form.tsx)
- **i18n:** `useTranslation()` for all text
- **Icons:** `lucide-react` (same icons library used throughout)
- **Currency:** `formatPrice()`, `fromCents()`, `toCents()`, `getCurrencyForLocale()` from [lib/currency.ts](src/lib/currency.ts)
- **Status badges:** Mirror `DealStatusBadge` color pattern from [deals/deal-status-badge.tsx](src/components/deals/deal-status-badge.tsx)
- **Mutations:** Same pattern as existing components — `setSaving(true)`, call server action, check `result.success`, show error or invalidate queries

### 5.1 Create page: `src/app/(app)/collaboration-workspace/[collaborationId]/page.tsx`

Follow pattern from [deals/[dealId]/page.tsx](src/app/(app)/deals/[dealId]/page.tsx):
- `"use client"`, uses `use(params)` for collaborationId (React 19 async params pattern)
- Uses `useCollaborationWorkspace(collaborationId)` hook + `useUser()` for role
- `PageContainer size="default"` wrapper
- `SectionHeader` with back link (same pattern as deal detail page)
- Loading: `<LoadingState variant="page" />`
- Not found: `<EmptyState icon={<Handshake />} title="..." />`
- Composes: ProgressTracker → CollaborationSummary → NextStepCard → role-specific action → CollabMessages

### 5.2 Components in `src/components/collaboration-workspace/`

| Component | Purpose | Key Reuse |
|-----------|---------|-----------|
| `progress-tracker.tsx` | 6-step visual tracker: Accepted → Brief Added → Confirmed → In Progress → Submitted → Completed | Mirror `DealRevisionTimeline` vertical line + dot pattern from [deal-revision-timeline.tsx](src/components/deals/deal-revision-timeline.tsx). Horizontal on desktop, vertical on mobile. Use `bg-primary text-primary-foreground` for completed steps, `bg-muted text-muted-foreground` for upcoming. Connecting lines with `bg-border` (upcoming) / `bg-primary` (completed). |
| `collaboration-summary.tsx` | Card with brand/creator info, deliverable type, budget, due date, state badge | Mirror layout from [deal-summary-card.tsx](src/components/deals/deal-summary-card.tsx) — same avatar+name flex pattern, same `rounded-lg border p-4 grid grid-cols-1 gap-4 sm:grid-cols-3` details grid, same `text-xs font-medium uppercase text-muted-foreground` section headers with icons. Use `formatPrice()` for budget. |
| `next-step-card.tsx` | Prominent CTA card showing who needs to act next | Card with colored left border (`border-l-4 border-primary`). Icon circle pattern from existing modal confirmations (`flex size-12 items-center justify-center rounded-full bg-primary/10`). Primary CTA button. `text-sm text-muted-foreground` for description. |
| `brand-brief-form.tsx` | React Hook Form + briefSchema | Follow exact form pattern from [request-form.tsx](src/components/collaborations/request-form.tsx) — `useForm` + `zodResolver`, `register()`, error display `text-xs text-destructive`, `Card > CardContent className="space-y-4"` sections, `Label` + `Input`/`Textarea` in `space-y-2` groups, submit with `Loader2 animate-spin` loading state. |
| `brief-review.tsx` | Creator views brief, confirms or requests changes | Read-only field display using `rounded-lg border p-4` containers with label headers. Two action buttons: primary "Confirm & Start Working", outline "Request Changes" (opens textarea on click). Mirror button layout from deal action buttons. |
| `deliverable-submission.tsx` | Creator submits URL + note | Same form pattern as brief form but simpler — `Input type="url"` + `Textarea`. Reuse `useForm` + `zodResolver`. |
| `brand-review-actions.tsx` | Brand approves or requests revision | Show submitted URL as link, note text. Two buttons: primary "Approve" + outline "Request Revision" (opens textarea). Mirror confirmation modal pattern for approve action. |
| `collab-messages.tsx` | Message list with system events + input | Mirror [chat-view.tsx](src/components/messages/chat-view.tsx) structure: header, scrollable messages area, input bar. System events: centered `text-xs text-muted-foreground italic`. Chat bubbles: mirror [message-bubble.tsx](src/components/messages/message-bubble.tsx) — own messages `bg-primary text-primary-foreground rounded-br-md`, others `bg-muted rounded-bl-md`, both `max-w-[75%] rounded-2xl px-4 py-2.5`. Timestamp `text-[10px]`. Auto-scroll via useRef. Input: `border-t bg-background` with Enter-to-send (same `handleKeyDown` pattern). |

### 5.3 Modify deal detail page [deals/[dealId]/page.tsx](src/app/(app)/deals/[dealId]/page.tsx)

When deal status is `accepted` or later and a collaboration exists:
- Call `getCollaborationByDealId(dealId)` in a useEffect
- Show prominent `Link` to `/collaboration-workspace/{collaborationId}` styled as `Button variant="default"` with rocket icon
- When collaboration workspace exists, hide old manual status transition buttons (workspace manages those transitions now)

---

## Phase 6: Integration

- **Notifications:** Reuse existing `collab_update` type — no enum changes needed. Use `createAndEmail()` with same parameter shape as deal notifications.
- **System events:** Auto-posted as `collaboration_messages` with `isSystemEvent: true` on each state transition via the `transitionState()` helper
- **Deal status sync:** Workspace transitions keep deal status in sync (in_progress, delivered, completed) so existing deal list views remain accurate
- **Supabase RLS:** Add policies for `collaboration_messages` allowing read for users who are brand/creator of parent collaboration

---

## Files to Create (11)

| File | Type |
|------|------|
| `src/db/schema/collaborations.ts` | Schema (3 tables + relations + types) |
| `src/lib/validations/collaboration-workspace.ts` | Validation (3 Zod schemas + types) |
| `src/app/(app)/collaboration-workspace/actions.ts` | Server actions (11 actions + helper) |
| `src/hooks/use-collaboration-workspace.ts` | React Query hook + Supabase realtime |
| `src/app/(app)/collaboration-workspace/[collaborationId]/page.tsx` | Workspace page |
| `src/components/collaboration-workspace/progress-tracker.tsx` | Step tracker |
| `src/components/collaboration-workspace/collaboration-summary.tsx` | Summary card |
| `src/components/collaboration-workspace/next-step-card.tsx` | CTA card |
| `src/components/collaboration-workspace/brand-brief-form.tsx` | Brief form |
| `src/components/collaboration-workspace/brief-review.tsx` | Brief review + confirm |
| `src/components/collaboration-workspace/deliverable-submission.tsx` | Submit deliverable |
| `src/components/collaboration-workspace/brand-review-actions.tsx` | Approve/revise |
| `src/components/collaboration-workspace/collab-messages.tsx` | Messages + input |

## Files to Modify (5)

| File | Change |
|------|--------|
| `src/db/schema/enums.ts` | Add `collaborationStateEnum` |
| `src/db/schema/index.ts` | Add export for collaborations |
| `src/db/schema/deals.ts` | Add `collaboration` relation to `dealsRelations` |
| `src/app/(app)/deals/actions.ts` | Auto-create collaboration on deal acceptance |
| `src/app/(app)/deals/[dealId]/page.tsx` | Link to workspace when collaboration exists |

---

## Verification

1. **Schema:** Run `npx drizzle-kit generate` then `npm run db:push` — verify tables created
2. **Acceptance flow:** Accept a deal → verify collaboration record created, both parties notified
3. **Brand brief:** As brand, fill brief form → verify state moves to `awaiting_creator_confirmation`
4. **Creator confirmation:** As creator, review brief → confirm → verify state moves to `in_progress`
5. **Deliverable submission:** As creator, submit URL → verify state moves to `submitted`
6. **Brand review:** As brand, approve → verify state moves to `completed`, deal status synced
7. **Revision flow:** Test request changes (creator) and request revision (brand)
8. **Messages:** Send messages from both sides, verify realtime delivery
9. **Progress tracker:** Verify each state shows correct active step
10. **Mobile:** Verify workspace is usable on mobile viewport
