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
- `/account` — profile, credits, billing stubs, password reset, sign out (protected)
- `/login` — sign in / sign up / password reset + Google OAuth
- `/auth/callback` — exchanges OAuth/confirm code for session
- `/api/generate` — Gemini image-to-image → uploads before+after to Supabase → returns URLs. `runtime = "nodejs"`, `maxDuration = 300`

Route protection is in `middleware.ts`.

## Key files

- `lib/presets.ts` — preset prompts shared between UI and API
- `lib/supabase.ts` — `supabaseAdmin` (service role, server-only) + `REFRAMED_BUCKET`
- `lib/supabase/client.ts` / `lib/supabase/server.ts` — SSR auth clients
- `lib/gallery.ts` — localStorage-backed gallery index

## Env (required in `.env.local` + Vercel)

- `GOOGLE_GENERATIVE_AI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Known gaps (not yet implemented)

- No DB tables yet — gallery is localStorage-only. PRD data model (Spaces/Captures/Generations) not built.
- Stripe integration (env vars set, no code).
- Quota enforcement (account page shows credits UI but not wired to real counts).
- Image validation, EXIF stripping, content moderation.
- Generation queue + Supabase Realtime progress stages.
- Share link viewer `/s/{token}`.

## Conventions

- User is non-engineer; prefers Figma-driven design and short explanations.
- `max-w-[Npx]` values on pages are approximations — migrate to a real 12-col grid when revisiting layout.
