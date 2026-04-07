# Reframed — Technical Architecture

> **Version:** 0.1 (MVP)
> **Last updated:** 2026-03-31

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│   Next.js App Router — mobile-optimized, 375px-first           │
│   Tailwind CSS, TypeScript, Supabase JS SDK, Stripe.js         │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────────┐
│                    VERCEL EDGE / SERVERLESS                     │
│   Next.js API Routes (App Router route handlers)               │
│   - Auth validation middleware                                  │
│   - Quota enforcement                                           │
│   - Generation job enqueue                                      │
│   - Stripe webhook handler                                      │
│   - Signed URL generation                                       │
└──────┬────────────────────┬──────────────────┬──────────────────┘
       │                    │                  │
┌──────▼──────┐   ┌─────────▼────────┐  ┌─────▼──────────────────┐
│  SUPABASE   │   │  SUPABASE        │  │   STRIPE               │
│  Postgres   │   │  Storage         │  │   Checkout + Billing   │
│  + RLS      │   │  (S3-compatible) │  │   + Webhooks           │
│  + Auth     │   │  Private bucket  │  └────────────────────────┘
│  + Realtime │   │  Signed URLs     │
└──────┬──────┘   └──────────────────┘
       │ Realtime (WebSocket)
       │ Generation status push
┌──────▼────────────────────────────────────────────────────────┐
│              BACKGROUND WORKER (Serverless / Edge Fn)         │
│   - Dequeues generation jobs                                  │
│   - Calls AI generation API                                   │
│   - Updates generation.status in Postgres                     │
│   - Writes output images to Storage                           │
└──────────────────────────┬────────────────────────────────────┘
                           │ API call
┌──────────────────────────▼────────────────────────────────────┐
│              AI GENERATION API (TBD: Replicate / fal.ai)      │
│   - Receives prompt + source image                            │
│   - Returns generated image                                   │
└───────────────────────────────────────────────────────────────┘
```

---

## Primary User Flow — Data Flow

```
1. User taps "Generate"
   └─→ Client: POST /api/generations
          body: { capture_id, style_preset }
          headers: Authorization: Bearer <access_token>

2. API Route (server-side):
   ├─ Validate access token (Supabase Auth)
   ├─ Verify user owns the Capture (RLS + explicit check)
   ├─ Check quota: generation_count_this_month < limit
   ├─ Create Generation row (status: "queued")
   ├─ Enqueue background job: { generation_id }
   └─→ Return { generation_id } to client immediately (< 300ms)

3. Client:
   ├─ Subscribes to Supabase Realtime channel: generations:{generation_id}
   └─ Renders multi-stage progress indicator (time-based label animation)

4. Background Worker:
   ├─ Dequeues job, fetches Generation + Capture from DB
   ├─ Fetches signed URL for working copy image from Storage
   ├─ Builds prompt from style_preset config
   ├─ Calls AI Generation API: POST (source_image_url, prompt, params)
   │     └─→ Polls or awaits webhook for completion (15–30 sec)
   ├─ Downloads generated image bytes
   ├─ Strips EXIF from output (defensive)
   ├─ Uploads to Storage: /generations/{user_id}/{generation_id}/
   │     ├─ full.jpg
   │     ├─ display.jpg (web-optimized)
   │     └─ thumbnail.jpg
   ├─ Updates Generation row:
   │     status: "completed"
   │     output_storage_path, display_path, thumbnail_path
   │     completed_at, generation_duration_ms
   │     counted_against_quota: true
   └─ Increments user.generation_count_this_month

5. Supabase Realtime:
   └─→ Pushes { status: "completed", generation_id } to client channel

6. Client (on completion event):
   ├─ POST /api/generations/{id}/signed-url
   │     └─→ Server returns short-lived signed URL (15 min TTL)
   └─ Renders generated image with fade-in reveal
```

---

## Database Schema

### `users`
```sql
CREATE TABLE users (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                       TEXT UNIQUE NOT NULL,
  name                        TEXT,
  plan_tier                   TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro')),
  stripe_customer_id          TEXT UNIQUE,
  billing_state               TEXT NOT NULL DEFAULT 'active' CHECK (billing_state IN ('active', 'grace', 'inactive')),
  grace_period_ends_at        TIMESTAMPTZ,
  generation_count_this_month INTEGER NOT NULL DEFAULT 0,
  quota_reset_at              TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()) + interval '1 month',
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `spaces`
```sql
CREATE TABLE spaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT,  -- nullable, user-assigned e.g. "423 Main St"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `captures`
```sql
CREATE TABLE captures (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id                 UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_storage_path    TEXT NOT NULL,
  working_copy_path        TEXT NOT NULL,
  thumbnail_path           TEXT NOT NULL,
  validation_status        TEXT NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'passed', 'failed')),
  validation_failure_reason TEXT,
  file_size_bytes          INTEGER,
  dimensions_width         INTEGER,
  dimensions_height        INTEGER,
  device_info              JSONB,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `generations`
```sql
CREATE TABLE generations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_id              UUID NOT NULL REFERENCES captures(id) ON DELETE CASCADE,
  space_id                UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  style_preset            TEXT NOT NULL CHECK (style_preset IN ('minimalist', 'industrial', 'warm_neighborhood')),
  status                  TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  output_storage_path     TEXT,
  display_path            TEXT,
  thumbnail_path          TEXT,
  model_id                TEXT,
  model_version           TEXT,
  generation_duration_ms  INTEGER,
  error_message           TEXT,
  counted_against_quota   BOOLEAN NOT NULL DEFAULT false,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at            TIMESTAMPTZ
);
```

### `share_links`
```sql
CREATE TABLE share_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token  TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'base64url'),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT now() + interval '30 days',
  view_count    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `guest_sessions`
```sql
CREATE TABLE guest_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address        INET NOT NULL,
  generation_id     UUID REFERENCES generations(id),
  migrated_to_user  UUID REFERENCES users(id),
  expires_at        TIMESTAMPTZ NOT NULL DEFAULT now() + interval '24 hours',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Row-Level Security Policies

```sql
-- Users can only see and modify their own data
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_spaces" ON spaces
  USING (user_id = auth.uid());

ALTER TABLE captures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_captures" ON captures
  USING (user_id = auth.uid());

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_generations" ON generations
  USING (user_id = auth.uid());

-- ShareLinks: owner can CRUD; anyone with valid token can read the generation
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_manages_share_links" ON share_links
  USING (user_id = auth.uid());

-- Share link resolution is handled server-side via service role —
-- the API validates the token and returns only the generation data,
-- not any other account information.
```

---

## API Routes Overview

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | None | Create account (email/password) |
| POST | `/api/auth/login` | None | Sign in |
| POST | `/api/auth/refresh` | Refresh token | Refresh access token |
| GET | `/api/spaces` | Required | List user's spaces |
| POST | `/api/spaces` | Required | Create a new space |
| GET | `/api/spaces/:id` | Required | Get space with captures + generations |
| POST | `/api/captures` | Required | Upload photo (returns capture_id after validation) |
| POST | `/api/generations` | Required | Enqueue generation job |
| GET | `/api/generations/:id` | Required | Get generation status + metadata |
| POST | `/api/generations/:id/signed-url` | Required | Get short-lived signed URL for display |
| POST | `/api/generations/:id/share-link` | Required | Create or retrieve share link |
| GET | `/api/share/:token` | None | Resolve share link → return generation data |
| GET | `/api/account` | Required | Get account info + quota + billing state |
| POST | `/api/billing/checkout` | Required | Create Stripe Checkout session |
| POST | `/api/billing/portal` | Required | Create Stripe Customer Portal session |
| POST | `/api/webhooks/stripe` | Stripe signature | Handle payment events |

---

## File Storage Structure

```
Supabase Storage (private bucket: "reframed")

/uploads/
  {user_id}/
    {capture_id}/
      original.jpg        ← raw upload, EXIF stripped, preserved indefinitely
      working.jpg         ← compressed, for AI pipeline (max 2048px)
      thumbnail.jpg       ← 400×400, for gallery UI

/generations/
  {user_id}/
    {generation_id}/
      full.jpg            ← full-resolution AI output
      display.jpg         ← 1200px max dimension, optimized for web
      thumbnail.jpg       ← 400×400, for gallery UI
```

**Signed URL TTLs:**
- Authenticated user viewing own content: 15 minutes
- Share link (public, no auth): 30 days
- Never expose raw bucket paths to the client

---

## Auth Flow

```
Email/Password Signup:
  Client → POST /api/auth/signup
         → Supabase Auth creates user
         → Verification email sent
         → On verify: user.email_confirmed = true
         → Client stores access_token + refresh_token

Google OAuth:
  Client → Supabase Auth OAuth redirect → Google consent
         → Callback: Supabase creates/links user
         → Client receives access_token + refresh_token

Token Refresh:
  Client detects 401 → POST /api/auth/refresh with refresh_token
                     → New access_token returned
                     → In-progress operations resume with new token

Guest Session:
  Client → POST /api/generations (no auth header)
         → Server checks: 1 guest gen per IP per 24 hours (guest_sessions table)
         → Generation proceeds, linked to guest_session
         → On signup: POST /api/account/migrate-guest { guest_session_id }
                    → Generation transferred to new user account
         → If no signup after 24h: guest_session expires, generation purged
```

---

## Payment Flow

```
Free → Pro Upgrade:
  1. User hits quota → upgrade prompt shown
  2. Client → POST /api/billing/checkout
           → Server creates Stripe Checkout session (mode: subscription)
           → Returns { checkout_url }
  3. Client redirects to Stripe Checkout
  4. On success: Stripe sends webhook → invoice.payment_succeeded
  5. Webhook handler:
       → Update users SET plan_tier = 'pro', billing_state = 'active'
       → Store stripe_customer_id, stripe_subscription_id
  6. User redirected back to app with Pro access active

Payment Failure:
  1. Stripe sends webhook → invoice.payment_failed
  2. Webhook handler:
       → Set billing_state = 'grace'
       → Set grace_period_ends_at = now() + interval '7 days'
  3. App shows persistent banner: "Update billing info"
  4. After 7 days (cron job or next login check):
       → If still grace and grace_period_ends_at < now():
           Set plan_tier = 'free', billing_state = 'inactive'

Subscription Cancellation:
  1. Stripe sends webhook → customer.subscription.deleted
  2. Webhook handler:
       → Set plan_tier = 'free' at period end
       → All content remains accessible (never delete on billing event)
```

---

## Key Architectural Decisions

### 1. Queue-Based Async Generation
**Decision:** Generation requests are enqueued immediately; a background worker processes them asynchronously.
**Rationale:** AI image generation takes 15–30 seconds, exceeding the ~10-second timeout of Vercel serverless functions and the ~30-second limit of most edge functions. A synchronous HTTP call would fail or leave the user with a hanging connection. The queue pattern returns a `generation_id` instantly, lets the client subscribe to real-time status updates, and decouples request handling from processing.

### 2. Supabase Realtime for Generation Status
**Decision:** Use Supabase Realtime (Postgres change listeners) to push generation completion to the client.
**Rationale:** Avoids client-side polling loops that waste requests and introduce variable latency. When the worker updates `generation.status = 'completed'` in Postgres, Supabase Realtime broadcasts the change to the subscribed client immediately. The "reveal" happens at the exact moment the image is ready, not on the next poll cycle.

### 3. Schema-First Multi-Space Design
**Decision:** The `Spaces → Captures → Generations` hierarchy is in the schema at MVP, even though the UI only exposes a single Space per free user.
**Rationale:** Retrofitting a hierarchy into a flat schema when multi-angle projects ship in Phase 2 is painful (data migrations, foreign key additions, API changes). Building the correct relational structure now costs almost nothing and prevents the refactor entirely.

### 4. Server-Side AI API Calls Only
**Decision:** AI generation API keys never leave the server. The client sends a generation request to the Next.js API layer; the backend handles the AI call.
**Rationale:** Keeps API keys out of the client bundle. Creates a single enforcement point for auth validation, quota checking, content moderation, and rate limiting before any AI call is made. Prevents direct AI API abuse if a key were to leak.

### 5. RLS as the Data Isolation Layer
**Decision:** Supabase Row-Level Security policies are the primary mechanism for preventing users from accessing other users' data — not application-level checks.
**Rationale:** RLS enforces isolation at the database layer, meaning a bug in the application code (e.g., a missing `WHERE user_id = ?` clause) cannot accidentally expose another user's data. Application-level checks are an additional defensive layer, not the primary one. Policies are set before any API routes are written.

### 6. EXIF Stripping on Ingest
**Decision:** Strip all EXIF metadata server-side before writing to storage and before generating any signed URL.
**Rationale:** Users are photographing real commercial properties. EXIF data can contain GPS coordinates, device identifiers, and timestamps. A share link recipient should not be able to extract the property's location from the image metadata. This is a liability concern, not just a privacy one.

### 7. Share Link as a Standalone Acquisition Surface
**Decision:** The share link viewer (`/s/{token}`) is a standalone, publicly accessible page with no login wall, no navigation, and no cookie friction.
**Rationale:** Every share link is a product demo. The recipient is a landlord, investor, or business partner who likely doesn't have a Reframed account. Putting a login prompt in front of the transformation destroys the conversion potential. The page loads the generated image at full quality, shows the style label, and surfaces a "Make your own" CTA that routes to the marketing page — nothing else.
