# Reframed — Product Requirements Document

> **Version:** 0.1 (MVP)
> **Last updated:** 2026-03-31
> **Status:** Pre-development

---

## 1. Product Overview

### Name
**Reframed**

### One-liner
Reframed lets commercial space owners upload a photo of their venue and instantly visualize it as a branded coffee-shop coworking experience — signage, interiors, and all.

### Problem
Owners of underutilized commercial or retail spaces (empty storefronts, slow-traffic retail, oversized lobbies) struggle to imagine what a pivot to a coffee-shop coworking concept would actually look and feel like in their specific space. Today, they either hire an interior designer for expensive mood boards and renderings ($$$ and weeks of lead time), cobble together Pinterest inspiration that never maps to their actual floor plan, or stay stuck in analysis paralysis because the gap between "empty lease" and "branded destination" feels too abstract. The result: spaces sit underused, and potentially great operators never take the leap.

### Solution
Reframed lets a user snap a photo of their existing space and — using AI image generation — produces realistic visualizations of that space transformed with coffee-shop coworking branding, signage, furniture layouts, and interior design treatments. Users can adjust style direction (minimalist, industrial, warm-neighborhood, etc.) so the output feels aligned with their brand vision rather than generic. This collapses the expensive, slow concept-to-visual pipeline into something a non-designer can do in minutes.

### Differentiators
- **Space-specific:** Transforms the user's actual photo, not a generic "coffee shop interior" — the AI grounds its output in the real room, walls, windows, and proportions the user already has.
- **Opinionated vertical:** Coffee-shop coworking conversions only. The constraint enables output quality; generic tools can't tune prompts or presets to this specific aesthetic.
- **Stakeholder-ready output:** The share link viewer is designed as an acquisition surface — recipients see a polished transformation, not a login wall. Every share is a product demo.
- **Non-designer first:** The UX demands nothing beyond phone + photo. No Figma, no SketchUp, no design vocabulary required.

---

## 2. Target Users

### Primary Persona — The Evaluating Operator
**Who they are:** An independent commercial property owner or small-portfolio real estate operator who is exploring a coffee-shop coworking conversion. They may own the building outright, hold a long-term lease they're sub-leasing, or manage a mixed-use retail property with vacancies.

**Technical comfort:** Business-minded, comfortable with phones and basic apps, but not with design tools (Figma, SketchUp, or even Adobe). They use their phone for everything.

**What they're trying to accomplish:** Two things — build personal conviction that the concept works in *their* space, and create compelling visuals they can show a landlord, investor, or build-out contractor to move from "I have an idea" to "here's what it looks like."

**Usage context:** Primarily mobile, on-site — they're standing in the space, phone in hand, possibly showing results to a partner or landlord in real time. Secondary context is desktop or tablet for revisiting saved visualizations, comparing style options side-by-side, and sharing links with stakeholders.

### Secondary Personas
- **Franchise / brand consultants** helping operators evaluate spaces for fit — they'd use Reframed for rapid first-pass visualization across multiple candidate locations.
- **Interior designers** using it as a quick first-pass concept before committing to detailed work.

### Explicitly Out of Scope
- Large commercial real estate developers with in-house design teams
- General contractors who need architectural drawings for permitting or build-out
- End consumers (the people who'd eventually drink coffee there)
- Anyone looking to visualize a non-coworking conversion (yoga studio, dental office, apartment renovation)

---

## 3. Core Features

### P0 — Must ship for launch

| Feature | Description |
|---|---|
| **Photo capture & upload** | User can take a photo in-app or upload from camera roll. Supports JPEG, PNG, HEIC up to 15 MB. Validates image quality (lighting, angle, resolution) before processing and returns specific, actionable feedback if the photo fails validation. |
| **AI space transformation** | Core engine: takes the uploaded photo and generates a realistic visualization of that space redesigned as a coffee-shop coworking environment with furniture, lighting, signage, and branding elements. Runs async with a queue-based pattern. |
| **Style preset selection** | User picks from 3 curated aesthetic directions before generation. Each preset has a distinct visual identity (thumbnail + label). Presets for MVP: Minimalist, Industrial, Warm Neighborhood Café. |
| **Multi-stage generation progress** | During the 15–30 second generation window, display staged progress ("Analyzing your space" → "Applying style" → "Rendering details" → "Finalizing") powered by Supabase Realtime. Prevents "is it broken?" anxiety. |
| **Full-screen result viewer** | Generated image fills the viewport edge-to-edge on mobile. Pinch-to-zoom on mobile, scroll-zoom on desktop. Fade-in reveal on completion. |
| **Result gallery** | Saved history of past generations, browsable and revisitable. Each entry shows the generated image thumbnail, style preset used, and timestamp. |
| **Download & share** | One-tap download to camera roll at full resolution. One-tap copy of a public share link. Share link opens a clean, branded viewer — no login required for recipients. |
| **User accounts & auth** | Email/password with verification + Google OAuth. Sessions persist across devices. Short-lived access tokens (15–30 min) with refresh token flow. Generation results survive token expiry. |
| **Stripe payments** | Free tier (3 generations/month) and Pro tier ($29/month, unlimited generations). Stripe Checkout for conversion, Stripe Billing for subscription management, webhooks for payment failure and grace period logic. |
| **Basic account settings** | Billing management (upgrade, cancel, update payment method), email display, logout. |

### P1 — Important, ship shortly after launch

| Feature | Description |
|---|---|
| **Signage text customization** | Let users type in their actual business name so generated signage reflects real branding. Requires solving text rendering reliably (compositing approach, not model-native). |
| **Before/after comparison view** | Swipe-slider showing original photo vs. transformation. Clip-path technique over two pixel-aligned images. |
| **Style fine-tuning controls** | Sliders for color palette warmth, furniture density, and lighting mood, layered on top of the preset selection. |
| **Multi-angle projects (Spaces)** | Group multiple photos of the same physical location into one "Space." Builds on the Spaces data model that is designed in at MVP even if not surfaced in UI. |
| **2 additional style presets** | Added based on which MVP presets users pick most frequently. |

### P2 — Post-launch, phase 3+

| Feature | Description |
|---|---|
| **PDF pitch deck export** | Package a Space's Generations into a presentation-ready PDF. |
| **High-resolution export options** | Larger output sizes for Pro users for print or large-screen use. |
| **Team / Agency tier** | Shared workspaces, collaborative commenting, style voting. |
| **API access** | For interior design firms to white-label the generation capability. |

### Non-features (deliberately excluded)

- **No floor plans or CAD output** — Reframed is a vision tool, not a construction document.
- **No general interior design** — Strictly coffee-shop coworking conversions. No yoga studios, dental offices, apartments.
- **No marketplace** — No connections to contractors, furniture vendors, or franchise operators.
- **No 3D / AR / walkthroughs** — Output is a high-quality static image (and potentially a pan animation in Phase 3). No spatial computing.
- **No collaboration at MVP** — No commenting, sharing drafts to teammates, or multi-user editing.

---

## 4. User Flows

### Primary Flow — Generate & Share
1. User opens app → lands on project dashboard (or onboarding if first visit)
2. Taps "New space" → prompted to take a photo or upload from camera roll
3. App shows guidance: "Capture the widest angle you can, make sure lighting is even"
4. **Image validation:** System checks for minimum quality thresholds. On failure, user receives specific, actionable prompt ("The photo is too dark — try turning on the lights or moving to face a window") rather than a generic error
5. User selects a style preset from 3 visual cards (thumbnail + label)
6. Generation begins — multi-stage progress indicator ("Analyzing your space…") with Supabase Realtime pushing completion status
7. Generated image fills the screen with a fade-in reveal
8. User pinch-zooms to inspect signage, furniture, lighting details
9. User taps "Save" to add to gallery, or "Regenerate" to try a different style preset
10. User taps share icon → copies share link or downloads to camera roll
11. Recipient opens share link → sees transformation, style label, "Make your own" CTA → no login required

### Onboarding Flow — First Visit, No Account
1. Cold visitor lands on landing page
2. Taps "Try it free" → taken directly to photo capture (no account required)
3. Uploads or takes one photo → picks a style preset → generation begins
4. During generation (15–30 sec): 2–3 brief contextual cards explain what they're about to see and what they can do next
5. Generation completes → result is shown at full screen
6. Upgrade prompt: "Create a free account to save this, generate more, and share with anyone"
7. If user signs up: guest session migrated to new account, generation retained
8. If user doesn't sign up: session expires after 24 hours, generation discarded

### Payment Flow — Free to Pro Upgrade
1. Free user taps "Generate" after exhausting 3/month quota
2. In-context upgrade prompt appears with blurred/watermarked preview of what the generation *would* look like
3. Clear Free vs. Pro comparison shown
4. User taps "Upgrade to Pro" → Stripe Checkout opens
5. On success: quota resets, generation proceeds immediately, Pro badge appears in account settings
6. On Stripe webhook `invoice.payment_failed`: 7-day grace period begins, persistent banner shown ("Update billing info to keep Pro access")
7. After 7 days without resolution: account downgraded to Free tier; all Spaces, Captures, and Generations remain accessible

### Return User Flow
1. User opens app → lands on dashboard showing their Spaces and recent Generations
2. Taps an existing Space → sees all Captures and their Generations
3. Can add a new Capture, download existing Generations, or generate a new style variation from a saved Capture
4. Can access share links for past Generations from the result detail view

---

## 5. Data Model

### Core Entities

```
User
├── id (uuid, PK)
├── email
├── name
├── plan_tier (free | pro)
├── stripe_customer_id
├── billing_state (active | grace | inactive)
├── grace_period_ends_at (nullable timestamp)
├── generation_count_this_month
├── created_at
└── updated_at

Space
├── id (uuid, PK)
├── user_id (FK → User)
├── name (nullable, user-assigned e.g. "423 Main St")
├── created_at
└── updated_at

Capture
├── id (uuid, PK)
├── space_id (FK → Space)
├── user_id (FK → User)
├── original_storage_path (private bucket key)
├── working_copy_path (compressed, for AI pipeline)
├── thumbnail_path
├── upload_timestamp
├── validation_status (pending | passed | failed)
├── validation_failure_reason (nullable)
├── file_size_bytes
├── dimensions_width
├── dimensions_height
├── device_info (nullable JSON)
└── created_at

Generation
├── id (uuid, PK)
├── capture_id (FK → Capture)
├── space_id (FK → Space)
├── user_id (FK → User)
├── style_preset (minimalist | industrial | warm_neighborhood)
├── status (queued | processing | completed | failed)
├── output_storage_path (full resolution)
├── display_path (optimized for web)
├── thumbnail_path
├── model_id (for tracking model version)
├── model_version
├── generation_duration_ms (nullable)
├── error_message (nullable)
├── counted_against_quota (boolean, false if pipeline error)
├── created_at
└── completed_at

ShareLink
├── id (uuid, PK)
├── generation_id (FK → Generation)
├── user_id (FK → User)
├── access_token (unique, random)
├── expires_at
├── view_count
└── created_at
```

### Relationship Chain
```
User → Spaces → Captures → Generations
                                    ↓
                               ShareLinks
```

The hierarchy is strict: Generations always belong to a Space via a Capture, even at MVP when the UI exposes only a single Space. This prevents schema refactoring when multi-angle projects ship in Phase 2.

### File Storage Structure
All assets stored in Supabase Storage (S3-compatible):

```
/uploads/{user_id}/{capture_id}/
  original.jpg          ← raw upload, preserved forever
  working.jpg           ← compressed copy for AI pipeline
  thumbnail.jpg         ← for UI display

/generations/{user_id}/{generation_id}/
  full.jpg              ← full-resolution AI output
  display.jpg           ← web-optimized version
  thumbnail.jpg         ← for gallery display
```

**Access control:**
- Authenticated users access their own files via signed URLs with 15-minute TTL
- Share links resolve to a separate read-only signed URL scoped to one generation with 30-day TTL
- Raw bucket paths are never exposed to the client

**EXIF stripping:** All images are processed server-side to strip GPS coordinates, device identifiers, and sensitive metadata before storage and before any share link is generated.

**Retention:**
- Active accounts: retain everything indefinitely
- Dormant free accounts (no login 12+ months): archive originals to cold storage, keep thumbnails hot; notify by email before archiving
- Deleted accounts: purge all assets within 30 days; document in privacy policy

---

## 6. Authentication & Authorization

### Auth Methods (MVP)
- Email/password with email verification
- Google OAuth
- Apple Sign-In (add when iOS App Store distribution begins)

### Session Handling
- Short-lived access tokens: 15–30 minute TTL
- Refresh token flow for seamless re-authentication
- In-progress generation results are preserved through token expiry — users re-authenticate and find their result waiting

### Guest Session (Unauthenticated Trial)
- One free generation per IP per 24 hours (rate-limited server-side)
- Guest session stored in a temporary record, associated with IP + browser fingerprint
- Session migrates to a new account on sign-up; discards after 24 hours if no account created

### Public vs. Protected Routes

| Route/Feature | Access |
|---|---|
| Landing page | Public |
| Share link viewer (`/s/{token}`) | Public — no auth, no login prompt |
| Guest generation (1 attempt) | Public — no account required |
| "Make your own" CTA from share link | Public → routes to landing |
| Dashboard, gallery, new generation | Protected |
| Account settings, billing | Protected |
| API routes (generation, upload) | Protected + rate-limited |

### Row-Level Security (Supabase RLS)
RLS policies are set before any API routes are built:
- Users can only read/write their own `Spaces`, `Captures`, and `Generations`
- `ShareLinks`: owner has full CRUD; anyone with the valid access token can read the linked Generation only — no other data in the account is exposed
- Service-role key used server-side only (never in client bundle)

---

## 7. Monetization & Business Logic

### Pricing

| Tier | Price | Generations | Features |
|---|---|---|---|
| **Free** | $0/month | 3/month | 3 style presets, standard resolution, share links, result gallery |
| **Pro** | $29/month | Unlimited | All Free features + no watermark (when added), P1 features as they ship, Pro badge |

*Note: The $29/month pricing should be validated against willingness-to-pay data in Phase 1. If the output is driving six-figure space-conversion decisions, this may be underpriced. Consider a credit-based or project-pass alternative if subscription churn data shows a subscribe-cancel-resubscribe cycle.*

### Quota Logic
- Free tier: 3 generations/month, reset on the first of each month (UTC)
- Quota is enforced server-side against the `generation_count_this_month` field — never trusted from client state
- Failed generations (pipeline error) do not count against quota (`counted_against_quota = false`)
- Pro tier: soft limit of 50 generations/day as a cost safety valve

### Upgrade Prompt
- Shown in-context when a Free user taps "Generate" after exhausting their quota
- Displays a blurred or watermarked preview of what the generation *would* look like
- Clear Free vs. Pro comparison
- Never holds existing work hostage — all saved Generations, Captures, and Spaces remain accessible regardless of plan

### Payment Edge Cases

| Scenario | Behavior |
|---|---|
| Free limit hit | In-context upgrade prompt with blurred preview. No generation attempt made. |
| Payment failure | 7-day grace period: Pro features remain active, persistent billing banner shown. After 7 days: downgrade to Free tier behavior. All content remains accessible. |
| Account downgraded after grace | `plan_tier` = free, `billing_state` = inactive. Generation quota applies. No content deleted. |
| Refund request ≤ 14 days | Full refund, no questions asked. Process within 3–5 business days. |
| Refund request > 14 days | Prorated to end of billing cycle. |
| Subscribe → cancel → resubscribe same month | No double charge. Stripe handles proration; validate in webhook logic. |
| Generation pipeline error | Do not count against quota. If 3+ consecutive failures for one user, surface support contact proactively. |

---

## 8. Technical Constraints

### Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Hosting | Vercel (edge functions + static hosting) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Storage | Supabase Storage (S3-compatible) |
| Realtime | Supabase Realtime (generation status push) |
| Payments | Stripe (Checkout + Billing + webhooks) |
| AI generation | TBD — Replicate / fal.ai / Stability API (bake-off required before development begins) |
| Background jobs | Queue-based pattern via Vercel serverless functions or Supabase Edge Functions |

### Security Constraints (hard rules)
1. **AI API keys are server-side only** — never in the client bundle. Client sends a generation request; backend authenticates, validates quota, then calls the AI service.
2. **No raw storage bucket paths to the client** — all image access via short-lived signed URLs.
3. **RLS policies set before any API routes** — retrofitting is painful and error-prone.
4. **EXIF stripping on all uploads** — server-side, before storage. GPS coordinates especially must be stripped before any share link is generated.
5. **Content moderation on upload** — basic check before queuing for generation. Block inappropriate content from entering the pipeline or storage.
6. **Input validation** — enforce max 15 MB file size, allowed MIME types (JPEG, PNG, HEIC), and image dimension minimums.

### Generation Pipeline Architecture
Standard serverless functions time out before AI generation completes (15–30 sec). Use a queue-based pattern:
1. Client POSTs generation request → server validates auth/quota → enqueues job → returns `generation_id` immediately
2. Background worker calls AI API, updates `generation.status` in Postgres
3. Supabase Realtime pushes status change to the client
4. Client receives completion event → fetches signed URL → displays result

### Performance Targets
- Photo upload to "generation started" confirmation: < 3 seconds on LTE
- Generation time (model-dependent): target < 30 seconds; > 45 seconds is a UX failure threshold
- Share link page first contentful paint: < 1.5 seconds (it's an acquisition surface)
- Image viewer zoom: no jank on mid-range Android devices (test on Samsung A-series or equivalent)

### Platform Requirements
- **MVP:** Mobile-optimized web app (responsive Next.js). Not a native app, not a PWA.
- **Camera access:** HTML `<input type="file" accept="image/*" capture="environment">` — covers iOS and Android without native wrappers
- **Design breakpoints:** Mobile-first from 375px, scale to desktop. No separate desktop experience — same app, more breathing room.
- **Browser support:** Chrome (iOS + Android + desktop), Safari (iOS + macOS), Firefox (desktop). No IE. No minimum Safari version below iOS 15.

---

## 9. UX & Design Direction

### Emotional Tone
**"Trustworthy precision."** The interface must signal design literacy. Users are generating professional-quality output — if the chrome feels cheap or cluttered, trust in the generated output collapses. Every pixel of the interface is a credibility signal.

### Reference Points

| App | What to borrow |
|---|---|
| **Airbnb** | Photography as the product. UI disappears behind the images. Generous image frames, no competing visual noise. |
| **Notion** | Systematic, not decorative. Every component earns its space. Clean hierarchy. Users always know where they are. |
| **Apple** | Typographic confidence and restraint. One typeface, clear weight hierarchy, generous spacing. Nothing is bold that doesn't need to be. |
| **Spotify** | Content-dense screens (gallery, preset picker) that stay scannable via disciplined grid systems. |

### Design Principles

1. **The generated image is the product — the UI is the frame.** When viewing a generation result, the interface reduces to almost nothing. Image fills the screen; controls appear as a minimal overlay or tuck below. No sidebars or persistent nav competing with the output.

2. **Systematic, not decorative.** Strict 4px/8px spatial grid. No decorative shadows, gradients, or variable border radii. One border-radius token, applied consistently. Consistency is what makes a tool feel "designed" rather than "themed."

3. **Neutral surface, confident typography.** Background surfaces: flat white or very subtle warm gray (must not color-shift generated images). Typography: a single high-quality sans-serif (Inter preferred) in no more than three weights: regular (body), medium (labels), semibold (headings).

4. **Color is functional, not expressive.** Near-monochromatic UI palette (blacks, grays, whites) + a single accent color for interactive elements only (primary buttons, active states, links). Generated content is where color lives; the tool stays out of the way.

5. **Trust through transparency.** Every state is visible: upload confirmation with file size + validation status; real progress stages during generation; style preset label + timestamp on every Generation; exact quota count in account settings. No mystery, no hidden states.

6. **Design quality as proof of concept.** Users are evaluating whether to invest real money in a physical space based on generated output. The fit and finish of the interface is a direct proxy for "can I trust this?" Invest disproportionately in the three surfaces users touch most: **the image viewer, the style preset picker, and the share link page**.

### What It Explicitly Does NOT Feel Like
Not VSCO or editorial (too atmospheric). Not a dark-mode AI tool with neon accents (signals experimentation, not reliability). Not a SaaS dashboard (no sidebar nav with 12 items, no data tables). Not Canva (too much creative chrome, too many options).

### Complex UI Components

| Component | Notes |
|---|---|
| **Multi-stage progress indicator** | Time-based stage labels approximating backend pipeline. Supabase Realtime triggers the final reveal. Spinner alone is insufficient. |
| **Full-screen image viewer** | Pinch-to-zoom (mobile), scroll-zoom (desktop). Fade-in reveal on generation complete. Performance-test on mid-range Android. Consider `react-medium-image-zoom` or custom CSS transform implementation. |
| **Style preset picker** | Horizontally scrollable card row on mobile; grid on desktop. Each card uses a strongly differentiated color palette and furniture style so presets are distinguishable at thumbnail size in < 1 second. |
| **Share link viewer** | Standalone mini-app. No auth, no cookie friction. Generated image at full quality + style label + "Make your own" CTA. Treat as a landing page, not an afterthought — it's the primary acquisition channel. |
| **Before/after swipe (P1)** | Vertical divider dragged left/right. Two pixel-aligned images, `clip-path` controlled by pointer position. Generous touch target on drag handle. Custom implementation preferred over library for feel control. |

---

## 10. MVP Scope & Success Metrics

### MVP Definition
The minimum version that delivers the core value loop:

> "I have a space → show me what it could look like as a coffee-shop coworking spot → let me share that vision with someone else."

**In scope for MVP:**
- Single photo upload with camera capture
- 3 style presets (Minimalist, Industrial, Warm Neighborhood Café)
- AI generation with multi-stage progress
- Full-screen result viewer with pinch-to-zoom
- Download to camera roll
- Single share link per generation (no auth required for recipients)
- Supabase auth: email + Google OAuth
- Stripe: Free (3/month) + Pro ($29/month, unlimited)
- Basic account settings page

**Out of scope for MVP:**
- Signage text customization
- Multi-angle projects / Spaces organizational UI
- Style fine-tuning sliders
- Before/after comparison
- PDF export
- Free-tier watermark (skip for early adopters)
- Collaboration features

### Success Metrics (Phase 1, weeks 1–4)

| Metric | Signal |
|---|---|
| Guest-to-account conversion rate | Do people who see their first generation sign up? Target: > 40% |
| Day-7 retention | Do users who generate once return within a week? Target: > 25% |
| Share link open rate | Are generated share links actually being opened? Target: > 50% of shared links opened at least once |
| Share-to-signup conversion | Do share link recipients sign up? This is the viral loop metric. |
| Generation quality rating | Track regeneration rate (proxy for dissatisfaction). Target: < 30% of generations are immediately regenerated. |
| Free-to-Pro conversion | Target: > 5% of monthly active free users convert within 30 days |

---

## 11. Open Questions & Risks

### Open Questions

1. **Which image generation model?** A structured bake-off across 20 real commercial space photos against 3–4 candidate models (SDXL via Replicate, FLUX, DALL-E 3, fal.ai) must complete before development begins. Evaluate on: spatial realism (does it look like *this* room?), style preset fidelity, generation latency, and cost per generation at scale.

2. **What is the quality bar for launch?** If 7/10 generations look great and 3/10 look off, is that shippable? Defines whether a human review step, a regeneration affordance, or an auto-quality-scoring filter is needed before launch.

3. **Who is the actual buyer — property owner or operator?** These are often different people with different motivations and different acquisition channels. Requires 5–10 user interviews with each persona before messaging and pricing are finalized.

4. **Prompt engineering ops model:** Each style preset corresponds to a complex prompt. Who writes and maintains them? How are they tested systematically? Is a prompt management layer needed, or is a hardcoded MVP set acceptable?

5. **Content moderation policy and tooling:** What happens when someone uploads an image containing people, copyrighted signage, or inappropriate content? What if the AI generates something offensive? Requires a written content policy and a moderation check in the pipeline before launch.

6. **Is a static 2D image compelling enough to drive a real-world business decision?** If users need a 3D walkthrough or floor plan to commit, a 2D transformation may be "cool" but not "useful." Validate in user interviews and monitor in Phase 1 qualitative feedback.

7. **Is $29/month the right price?** Could be underpriced if the output is genuinely driving six-figure space conversion decisions. Could be overpriced for novelty use. Monitor subscribe-cancel-resubscribe patterns; be ready to introduce a credit-based or project-pass model.

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Real-world image quality gap (dark, cluttered, oddly angled photos vs. clean demo shots) | High | High | Invest heavily in image validation step; build a library of real-user failure cases and tune the pipeline against them. |
| Generation latency > 45 seconds | Medium | High | Latency is a hard selection criterion in the model bake-off. Design the progress experience to maintain engagement. Consider a low-fidelity 5-second preview while the full render completes. |
| Text rendering unreliability | High | Medium | Deferred correctly from MVP. When building in Phase 2, use compositing (generate scene → overlay clean typography) rather than asking the model to render text natively. |
| Wrong property type targeting (office vacancy vs. retail vacancy) | Medium | Medium | Position around "commercial-to-coworking conversions broadly" — office, retail, lobby. Don't overfit messaging to one property type. |
| Global localization complexity | Low (at MVP) | High (at scale) | Launch with globally neutral presets. Instrument geographic usage. Design AI pipeline to accept locale as a parameter from day one. Build region-specific presets in Phase 2/3. |
| Project-based usage doesn't support monthly subscription model | Medium | Medium | Launch with $29/month for simplicity. Track pause/churn patterns. Be ready to introduce a credit-based model or project pass if subscribe-cancel-resubscribe cycle appears. |
| Output quality not differentiated from free tools (Midjourney, ChatGPT) | Medium | High | The moat is "your specific space, credible output, stakeholder-ready." Output quality is the product. Set a clear minimum quality bar; build a quality-scoring layer that filters subpar outputs. |
| 3 style presets feel like arbitrary limitation | Medium | Low | Monitor which presets are selected most. Add 2 presets in Phase 2 based on data. Consider a "surprise me" option that randomly selects a preset. |
