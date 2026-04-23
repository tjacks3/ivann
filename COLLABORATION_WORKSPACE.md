# Collaboration Workspace — Features & Process Flow

## Overview

The Collaboration Workspace is the central hub where **brands** and **creators** work together from initial outreach through final deliverable approval and payment. It provides a structured, state-driven workflow with real-time messaging, an audit trail, and automated notifications at every step.

---

## End-to-End Process Flow

### Phase 1: Creator Discovery

Brands browse and filter creators on the **Discover** page.

1. Brand navigates to the Discover page
2. Applies filters: keyword search, categories, platform, follower range, location, verified-only
3. Views creator cards showing avatar, bio, categories, follower count, location, and platforms
4. Clicks a creator card to view their full profile

**Key capabilities:**
- Debounced keyword search (name, bio, username)
- Multi-select category and platform filters
- Min/max follower range
- Location-based filtering
- Sort by followers, newest, or A-Z
- Paginated results (12 per page)

---

### Phase 2: Quick Collab Wizard (9 Steps)

Brands use a guided wizard to define their collaboration needs and find matching creators.

#### Step 1 — Collab Type
Select the type of content needed:
- Instagram Story, Instagram Post, YouTube Promo, TikTok Post, Podcast Mention, or Other (custom input)

#### Step 2 — Campaign Intent
Define the campaign goal:
- Local Awareness, New Menu Item, Grand Opening, Drive Weekend Visits, Special Offer, or custom description

#### Step 3 — Local Preference
Configure geographic targeting:
- Toggle local-only search
- Set search radius (miles)
- City/State (auto-filled from brand profile)

#### Step 4 — Budget
Select a budget range per creator:
- Under $50, $50-100, $100-250, $250-500, $500+

#### Step 5 — Timing
Choose a timeline:
- ASAP, This Week, This Month, or Flexible
- Optional notes

#### Step 6 — Creator Matching
Review AI-scored creator matches:
- Each match displays a **match score** (e.g., "87% Match") and a **fit label** (Strong niche match, Good budget fit, Great local fit, Potential match)
- Cards show avatar, name, bio, categories, followers, location, platform icons, and top 2 fit reasons
- Click "View Details" for a slide-out panel with full profile, all fit reasons, and budget compatibility
- Select or skip each creator

#### Step 7 — Campaign Summary
Review and edit the generated campaign:
- Campaign goal, deliverable description, budget per creator, timeline, and summary
- All fields are editable before proceeding

#### Step 8 — Outreach Messages
Draft personalized messages for each selected creator:
- Pre-generated message per creator (customizable)
- Toggle individual creators on/off
- Edit message text inline
- Send selected outreaches

#### Step 9 — Success
Confirmation screen showing number of outreaches sent, with links to the tracking dashboard.

---

### Phase 3: Collaboration Request & Acceptance

Once outreach is sent, a **Collaboration Request** is created for each selected creator.

| Step | Actor | Action |
|------|-------|--------|
| 1 | System | Creates a collaboration request record (status: `pending`) and notifies the creator via email |
| 2 | Creator | Reviews the request on their Collaborations page |
| 3a | Creator | **Accepts** — system auto-creates a message thread, a deal, and a collaboration workspace |
| 3b | Creator | **Declines** — optionally provides a reason; brand is notified |
| 4 | Brand | Receives acceptance notification and navigates to the collaboration workspace |

**Request statuses:** `pending` | `accepted` | `declined` | `expired` | `cancelled`

---

### Phase 4: Collaboration Workspace Workflow

The workspace uses a **6-state machine** that enforces valid transitions and role-based permissions.

#### State Machine Diagram

```
                        BRAND submits brief
  awaiting_brand_brief ──────────────────────> awaiting_creator_confirmation
                                                  │                  │
                                    CREATOR       │                  │  CREATOR
                                    confirms      │                  │  requests changes
                                                  v                  v
                                             in_progress       revision_requested
                                                  │                  │
                                    CREATOR       │    BRAND         │
                                    submits work  │    resubmits     │
                                                  v    brief         │
                                              submitted    <─────────┘
                                                  │                 (returns to
                                    BRAND         │        awaiting_creator_confirmation)
                                    approves      │
                                                  │     BRAND requests revision
                                                  │──────────────────> in_progress
                                                  v
                                             completed
```

#### Step-by-Step Workspace Flow

**1. Awaiting Brand Brief** (`awaiting_brand_brief`)
- **Brand** fills out the campaign brief form:
  - Campaign Goal (required, 10-1000 chars)
  - Product/Service (required, 2-255 chars)
  - Required Mentions, Tags/Hashtags, Location
  - Posting Window (start and end dates)
  - Special Instructions, Restrictions
- On submit, state transitions to `awaiting_creator_confirmation`
- Creator is notified

**2. Awaiting Creator Confirmation** (`awaiting_creator_confirmation`)
- **Creator** reviews the brief in a read-only view
- Two options:
  - **Confirm & Start Working** — transitions to `in_progress`; deal status syncs to `in_progress`
  - **Request Changes** — enters a message explaining what needs to change; transitions to `revision_requested`

**3. Revision Requested** (`revision_requested`)
- **Brand** receives the creator's change request message
- Brand edits and resubmits the brief
- State returns to `awaiting_creator_confirmation`

**4. In Progress** (`in_progress`)
- **Creator** works on the deliverable
- Both parties can exchange messages in real time
- Brand can view the brief (read-only) but cannot edit
- When ready, creator submits the deliverable

**5. Submitted** (`submitted`)
- **Creator** submits a content URL and optional note
- Deal status syncs to `delivered`
- **Brand** reviews the submission:
  - **Approve Deliverable** — confirmation dialog, then transitions to `completed`; triggers payment release
  - **Request Revision** — enters feedback message; clears submission; transitions back to `in_progress`

**6. Completed** (`completed`)
- Deliverable is approved
- `approvedAt` and `completedAt` timestamps are recorded
- Deal status syncs to `completed`
- Payment is released to the creator
- Creator is notified of approval

---

## Features

### Brand Features
- Create and send collaboration requests to multiple creators
- AI-powered creator matching with scoring and fit labels
- Customizable outreach messages per creator
- Campaign brief builder with structured fields
- Brief editing and resubmission during revision cycles
- Deliverable review with approve/request-revision actions
- Real-time messaging with creators
- Activity log of all state transitions
- Progress tracker showing current workflow step
- Automated payment release on approval

### Creator Features
- Receive and respond to collaboration requests (accept/decline with reason)
- Review campaign briefs with all details
- Confirm understanding or request brief changes with a message
- Submit deliverables via content URL with notes
- Real-time messaging with brands
- Activity log of all state transitions
- Progress tracker showing current workflow step
- Notifications at every stage

### Shared Features
- Real-time message updates via Supabase subscriptions
- System-generated event messages in the activity log
- Full audit trail of state transitions (who, when, from/to state)
- Email and in-app notifications for every key event
- Role-based access control (only brand and creator can access their workspace)
- Two-column layout: activity log (left) + messages (right)
- Mobile-responsive design

---

## Notifications

The system sends both **email** and **in-app notifications** for the following events:

| Event | Recipient | Description |
|-------|-----------|-------------|
| Collaboration request created | Creator | Brand has sent a collaboration request |
| Collaboration workspace created | Both | Workspace is ready for use |
| Brief submitted | Creator | Brand has submitted or updated the campaign brief |
| Creator confirms brief | Brand | Creator has accepted the brief and started working |
| Brief changes requested | Brand | Creator is asking for brief modifications (includes message) |
| Deliverable submitted | Brand | Creator has submitted work for review |
| Deliverable approved | Creator | Brand has approved the deliverable |
| Revision requested | Creator | Brand is requesting changes to the submission (includes feedback) |
| Request accepted | Brand | Creator has accepted the collaboration request |
| Request declined | Brand | Creator has declined (includes reason if provided) |

---

## Data Model

### Tables

**`collaborations`**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| dealId | UUID | FK to deals (unique — one workspace per deal) |
| brandUserId | UUID | FK to users (brand party) |
| creatorId | UUID | FK to users (creator party) |
| state | enum | Current workflow state |
| briefData | JSONB | Campaign brief content |
| submittedUrl | text | Creator's deliverable URL |
| submittedNote | text | Creator's submission notes |
| deliverableType | text | Type of content |
| dueDate | timestamp | Deadline |
| budgetAmount | integer | Budget in cents |
| approvedAt | timestamp | When deliverable was approved |
| completedAt | timestamp | When collaboration completed |
| revisionRequestedAt | timestamp | Last revision request time |

**`collaboration_messages`**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| collaborationId | UUID | FK to collaborations |
| senderId | UUID | FK to users (null for system events) |
| body | text | Message content |
| isSystemEvent | boolean | True for auto-generated state change messages |
| createdAt | timestamp | When sent |

**`collaboration_state_history`**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| collaborationId | UUID | FK to collaborations |
| fromState | varchar | Previous state |
| toState | varchar | New state |
| changedBy | UUID | FK to users |
| note | text | Optional context |
| createdAt | timestamp | When transition occurred |

**`collaboration_requests`**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| brandId | UUID | FK to users |
| creatorId | UUID | FK to users |
| packageId | UUID | FK to packages (optional) |
| status | enum | pending, accepted, declined, expired, cancelled |
| title | varchar | Request title |
| message | text | Outreach message |
| budget | integer | Budget in cents |
| currency | varchar | 3-letter currency code |
| deadline | timestamp | Requested deadline |
| declinedReason | text | Reason if declined |

### Relationships

```
collaboration_requests
  ├── brandId ──> users
  ├── creatorId ──> users
  └── packageId ──> packages
        │
        v (on accept)
      deals
        │
        v (one-to-one)
    collaborations
      ├── brandUserId ──> users
      ├── creatorId ──> users
      ├── collaboration_messages (many)
      └── collaboration_state_history (many)
```

---

## UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| ProgressTracker | collaboration-workspace | Visual 6-step progress bar (horizontal on desktop, vertical on mobile) |
| CollaborationSummary | collaboration-workspace | Card with parties, state badge, deal details, budget, due date |
| NextStepCard | collaboration-workspace | Context-aware card showing what action is needed next (role-specific) |
| BrandBriefForm | collaboration-workspace | Side sheet form for submitting/editing the campaign brief |
| BriefReview | collaboration-workspace | Creator view of submitted brief with confirm/request-changes actions |
| DeliverableSubmission | collaboration-workspace | Form for creator to submit content URL and notes |
| BrandReviewActions | collaboration-workspace | Approve or request revision on submitted deliverable |
| ActivityLog | collaboration-workspace | Timeline of system events and state transitions |
| CollabMessages | collaboration-workspace | Real-time chat between brand and creator |
| RequestCard | collaborations | Card for pending/accepted/declined collaboration requests |
| RequestForm | collaborations | Form for creating new collaboration requests |
| StatusBadge | collaborations | Color-coded badge for request status |
| CreatorMatchCard | quick-collab | Match result card with score, fit label, and creator info |
| CreatorDetailDrawer | quick-collab | Slide-out panel with full creator profile and fit details |
| OutreachEditor | quick-collab | Per-creator message drafting and customization |
| CampaignSummary | quick-collab | Editable review of generated campaign details |
