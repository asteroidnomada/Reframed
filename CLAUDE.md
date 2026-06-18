# Reframed

AI tool for commercial space owners to visualize their venue as a coffee-shop coworking space. Upload a photo → pick a style preset → get a photoreal reframe.

PRD: `/Users/mirandykim/Documents/Claude Code/docs/prd.md`

## Stack

- Next.js 15.5 App Router + React 18 + TypeScript
- Tailwind CSS v3 (design tokens in `tailwind.config.ts`: bg/fg/border/accent families, `--font-inter`)
- Supabase: Auth (email/password + Google OAuth), Storage (public `reframed` bucket)
- AI SDK v6 + `@ai-sdk/google`, model: `gemini-3.1-flash-image-preview`
- Hosted on Vercel (project `asteroidnomada-2148s-projects/reframed`)

## Routes

- `/` — gallery (protected). Reads items from `localStorage("reframed:gallery")`
- `/upload` — file picker (protected). Stashes dataURL in `sessionStorage("reframed:pending")`
- `/direction` — preset picker + Generate (protected). POSTs to `/api/generate`
- `/account` — profile, plan/credits (Free/Pro/grace), billing history, password reset, sign out (protected)
- `/account/credits` — Stripe Checkout flow for credit top-ups (steps 0–2, then redirects to Stripe)
- `/account/credits/success` — post-Stripe return; polls `/api/me` and shows updated balance
- `/login` — sign in / sign up / password reset + Google OAuth
- `/auth/callback` — exchanges OAuth/confirm code for session
- `/api/generate` — auth-gated; reserves/commits/releases quota; Gemini image-to-image → Supabase upload. `runtime = "nodejs"`, `maxDuration = 300`
- `/api/me` — returns plan state + credit balance + purchase history for the authed user
- `/api/billing/checkout/subscription` — creates Stripe Checkout session for Pro plan
- `/api/billing/checkout/credits` — creates Stripe Checkout session for credit top-up
- `/api/billing/portal` — creates Stripe Customer Portal session
- `/api/webhooks/stripe` — handles checkout, invoice, subscription, and refund events

Route protection is in `middleware.ts`.

## Key files

- `lib/presets.ts` — preset prompts shared between UI and API
- `lib/supabase.ts` — `supabaseAdmin` (service role, server-only) + `REFRAMED_BUCKET`
- `lib/supabase/client.ts` / `lib/supabase/server.ts` — SSR auth clients
- `lib/gallery.ts` — localStorage-backed gallery index
- `lib/stripe.ts` — Stripe singleton + checkout/portal helpers (server-only)
- `lib/billing.ts` — `reserveCredit`, `commitCredit`, `releaseCredit`, `topUpCredits`, `applyRefund`
- `lib/credits.ts` — `Purchase` / `MeData` types, `money()`, `formatPurchaseDate()`
- `lib/credits-config.ts` — credit stepper constants (PRICE, MIN/MAX/STEP/DEFAULT)
- `lib/env.ts` — runtime-validated env getter (throws on missing keys)

## Env (required in `.env.local` + Vercel)

- `GOOGLE_GENERATIVE_AI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (filled by `stripe listen` locally; set on Vercel for prod)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_CREDIT_UNIT`
- `NEXT_PUBLIC_APP_URL`

## Known gaps (not yet implemented)

- Gallery is localStorage-only. PRD data model (Spaces/Captures/Generations) not wired to DB.
- Image validation, EXIF stripping, content moderation.
- Generation queue + Supabase Realtime progress stages.
- Share link viewer `/s/{token}`.
- Stripe webhook endpoint not yet registered on dashboard (needs `STRIPE_WEBHOOK_SECRET` set on Vercel for prod).

## Conventions

- User is non-engineer; prefers Figma-driven design and short explanations.
- `max-w-[Npx]` values on pages are approximations — migrate to a real 12-col grid when revisiting layout.
