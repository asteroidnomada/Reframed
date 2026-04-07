# Reframed

> AI-powered space visualization — upload a photo of your commercial space and instantly see it transformed into a branded coffee-shop coworking environment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Hosting | Vercel (edge functions + static hosting) |
| Database | Supabase (Postgres) with Row-Level Security |
| Auth | Supabase Auth — email/password + Google OAuth |
| Storage | Supabase Storage (S3-compatible, private bucket + signed URLs) |
| Realtime | Supabase Realtime — generation status push to client |
| Payments | Stripe (Checkout + Billing + webhooks) |
| AI Generation | Google Nano Banana |
| Background Jobs | Queue-based via Vercel serverless or Supabase Edge Functions |

---

## Key Commands

```bash
# Development
npm run dev           # Start local dev server (localhost:3000)
npm run build         # Production build
npm run lint          # ESLint
npm run type-check    # TypeScript check (tsc --noEmit)
npm run test          # Jest unit tests
npm run test:e2e      # Playwright end-to-end tests
```

---

## Core Features

- **Photo capture & upload** — in-app camera or camera roll; quality validation before processing
- **AI space transformation** — async queue-based generation with Supabase Realtime status push
- **Style preset selection** — 3 presets at MVP: Minimalist, Industrial, Warm Neighborhood Café
- **Multi-stage progress indicator** — "Analyzing your space" → "Applying style" → "Rendering details" → "Finalizing"
- **Full-screen result viewer** — pinch-to-zoom mobile, scroll-zoom desktop, fade-in reveal
- **Result gallery** — saved generation history per user
- **Download & share** — camera roll export + public share link (no auth required for recipients)
- **User accounts** — Supabase Auth, email/password + Google OAuth, refresh token flow
- **Payments** — Free (3 generations/month) + Pro ($29/month, unlimited); 7-day grace on failure

---

## Data Model (key relationships)

```
User → Spaces → Captures → Generations → ShareLinks
```

- Keep this hierarchy strict — Generations always belong to a Space via a Capture
- MVP exposes single-Space UI, but schema supports multi-Space from day one (for P1 multi-angle projects)
- All image access via signed URLs with short TTLs — never raw bucket paths to client

---

## Key Architecture Decisions

1. **Generation is async + queue-based.** AI generation takes 15–30 sec, exceeding serverless timeouts. Client POSTs request → server enqueues + returns `generation_id` → worker processes → Supabase Realtime pushes completion → client fetches signed URL.

2. **AI API calls are server-side only.** No AI API keys in the client bundle. The server is the single chokepoint for auth validation, quota checks, and rate limiting before any AI call is made.

3. **No raw bucket paths to the client.** Every image (upload or generated) is served via signed URLs. Authenticated views: 15-min TTL. Share links: 30-day TTL.

4. **RLS policies are set before any API routes.** Supabase Row-Level Security enforces data isolation at the DB layer. Users can only access their own Spaces, Captures, and Generations. ShareLinks policy grants read-only access to the linked Generation only (no other account data exposed).

5. **EXIF stripping on all uploads.** Run server-side before storage. GPS coordinates especially must be stripped before any share link is generated (users are photographing real commercial properties).

6. **Failed generations don't count against quota.** `counted_against_quota = false` on pipeline errors. Track per-user consecutive failures; surface support proactively at 3+ consecutive failures.

7. **Mobile-first web app, not native.** HTML `<input type="file" accept="image/*" capture="environment">` for camera access — works on iOS and Android without native wrappers. No PWA at MVP.

8. **Guest session before auth.** One free generation per IP per 24 hours without an account. Session migrates to account on sign-up; discards after 24 hours if no account.

---

## Style Notes

- **Emotional tone:** Trustworthy precision — the UI is the frame; the generated image is the product
- **Typography:** Inter (or SF Pro fallback) — regular, medium, semibold only. No more than 3 weights.
- **Color:** Near-monochromatic (blacks, grays, whites) + one accent color for interactive elements only. Generated content is where color lives.
- **Spacing:** Strict 4px/8px grid. One border-radius token applied consistently.
- **Surfaces:** Flat white or very subtle warm gray — must not color-shift generated images.
- **Surfaces that earn disproportionate design investment:** image viewer, style preset picker, share link page.
- **Does NOT feel like:** dark-mode AI tool, Canva, SaaS dashboard, editorial/VSCO.
- **All UI must use Tailwind theme tokens defined in [`docs/brand.md`](docs/brand.md).** Never use raw hex colors, hardcoded font sizes or weights, hardcoded `px` margin/padding, or any magic values. Every color, spacing, radius, shadow, and typography value must trace back to a token in `docs/brand.md` and be configured in `tailwind.config.ts` under `theme.extend`. If a value you need isn't in `brand.md`, add it there first, then use the token.

---

## Security Checklist

- [ ] AI API keys: server-side env vars only, never in client bundle
- [ ] All image URLs: signed with short TTLs, never raw bucket paths
- [ ] RLS policies: set on all tables before building API routes
- [ ] EXIF stripping: server-side on upload, before storage
- [ ] Content moderation: check on upload before queuing for generation
- [ ] Input validation: 15 MB max, JPEG/PNG/HEIC only, dimension minimums
- [ ] Rate limiting: 3 gen/month (free), 50 gen/day (pro), 1 guest gen/IP/24hr

---

## Docs

- Full PRD: [`docs/prd.md`](docs/prd.md)
- Architecture & data flow: [`docs/architecture.md`](docs/architecture.md)
