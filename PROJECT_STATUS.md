# Movers.help — Project Status

**Updated:** 2026-08-20 (re-verified: tsc, tests, build, git, env)
**Repo:** `/home/hunter/movers.help` (Next.js 15.5.20 / React 19 / Tailwind 4 / Supabase / Vitest) — formerly `movers.helpkilo`
**Legacy repo:** `/home/hunter/movers.helpalpha` (Next.js 14 — old landing + Expo mobile app + original scanner-web module) — formerly `movers.help`. Superseded except `apps/mobile/` (Expo) and `lib/scanner-web/` history.

---

## 🔍 VERIFIED THIS SESSION (2026-08-20)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm test` (Vitest) | ✅ 72 tests / 10 files passing |
| `npm run build` (`next build`) | ✅ succeeds — 11 routes (static: `/`, `/login`, `/signup`, `/scan`, `/_not-found`; dynamic: `/dashboard`, `/api/*`) |
| Git remote | ✅ `github.com/thebaytek/movers.help.git` (master ↔ origin/master; renamed from `movers.helpkilo` 2026-08-22) |
| Supabase | ✅ **remote** project `aoysbhiwbpqqhxyfkkvl.supabase.co` (anon + service-role keys present in `.env.local`) |
| Resend | ⚠️ `RESEND_API_KEY` present (14 chars, `re_` prefix — verify it's a valid production key, not a test key) |
| WIP on disk | 🚧 still uncommitted (see "In Progress") |

---

## ✅ COMPLETED

### Foundation
- TypeScript clean — `npx tsc --noEmit` passes
- Test suite — Vitest + Testing Library, **72 tests passing (10 files)**: scanner-web (label-map, spatial-tracker, volume-calculator, position-estimator, camera, speech), furniture catalog (16), page smoke
- Production build — `npm run build` clean (11 routes)
- Git configured with remote (`baytek / admin@thebaytek.com` → `github.com/thebaytek/movers.help`)

### Brand & Landing (matrix aesthetic)
- Full rebrand: black/green matrix look, cyan highlights, no cyan gradients (`47bdc44`)
- Matrix rain canvas — full-site background, high-res, distant perspective, grid-intersection glow, reduced-motion support (`efbf9ab`, `335b8f5`, plan `docs/superpowers/plans/2026-07-11-matrix-rain.md`)
- Landing sections: hero, about, how-it-works, trust-signals, reviews, quote-section, scanner-demo, truck-viewer, final-cta, matrix-rain
- `brandkit.html` at repo root; `components/brand/` logo variants
- `error.tsx`, `loading.tsx`, `not-found.tsx` route files exist
- Metadata: `title`/`description`/`keywords`/`openGraph`/`twitter`/`robots` present in `app/layout.tsx` — **but `metadataBase` is missing** (see blockers)

### Auth & Data
- Signup flow (`app/(auth)/signup/actions.ts`) — email/password + invite-code check → `profiles`, redirects to `/dashboard`
- Login flow (`app/(auth)/login/`) — renders 200
- NextAuth scaffolding — `app/api/auth/[...nextauth]/` + callback (routes only, providers unwired)
- **Remote Supabase project configured** (`aoysbhiwbpqqhxyfkkvl.supabase.co`) — anon key + service-role key in `.env.local`
- Migrations in `supabase/migrations/`:
  - `20260709223924_initial_schema.sql` (leads, reviews, pricing_rules, inventory_items, profiles)
  - `20260710000000_init.sql`, `20260711000001_furniture_catalog.sql`
  - `20260814000001_furniture_catalog_accurate.sql` — **uncommitted**
- ⚠️ **Whether migrations are applied to the remote project is UNVERIFIED** — must confirm via Supabase dashboard or `supabase db push` before go-live

### Scanner (web) — `app/scan/` + `lib/scanner-web/`
- Phase 1 ✅ Live camera scanner: MediaPipe EfficientDet + TF.js COCO-SSD fallback, backend badge (LIVE/SIMULATED), 5 FPS loop, tab-pause
- Phase 2 ✅ Spatial memory: SpatialTracker (IoU), DuplicateGuard, RoomMapper, manual room picker UI, room summary panel
- Phase 3 ✅ Volume sizing: volume-calculator (bbox+depth), live cu ft counter in HUD, lookup fallback
- Phase 4 ✅ Scan guide agent: contextual, room-aware, TTS (Web Speech), bulky-item rules
- Scanner fixes: black-screen fix (h-dvh→h-screen), loading timeout, StrictMode guard

### API
- `/api/leads` — POST (create lead + inventory + resend email notification) + PATCH (status/mover/notes)
- `/api/reviews` — POST (submit) + GET (list, `verified` filter, limit)
- `/api/auth/callback`, `/api/auth/[...nextauth]`

---

## 🚧 IN PROGRESS (uncommitted WIP on disk)

From `git status` — needs review + commit **before deploy**:
- `lib/furniture.ts` — canonical furniture size table (packed dims in inches → derived cu ft). **New, untracked** + `lib/__tests__/furniture.test.ts` (16 tests)
- `supabase/migrations/20260814000001_furniture_catalog_accurate.sql` — **untracked**
- Modified: `app/scan/page.tsx`, `lib/inventory.ts`, `lib/scanner-web/` (camera.ts, speech.ts, inventory-state.ts, spatial-tracker.ts, geometry/volume-calculator.ts) + new tests `camera.test.ts`, `speech.test.ts`

---

## 🚨 GO-LIVE BLOCKERS (must fix before `movers.help` is live)

Full checklist: **`GO_LIVE.md`** (sibling file). Summary:

### SEO / metadata
- [ ] **`metadataBase` not set** — build warns OG/Twitter resolve to `http://localhost:3000`. Add `metadataBase: new URL("https://movers.help")` in `app/layout.tsx`
- [ ] **`og-image.png` referenced but missing** — `openGraph.images[0].url = "/og-image.png"`; `public/` has no such file. Generate 1200×630
- [ ] **No `robots.ts` / `sitemap.ts`** — add `app/robots.ts` + `app/sitemap.ts`
- [ ] **Favicon** — only `public/favicon.svg`; add raster `app/icon.png` (or `.ico`) for social/browser icons

### Deployment
- [ ] **No deployment config** — no `netlify.toml` yet. **Deploy target: Netlify** (chosen 2026-08-22). Needs `netlify.toml` (`publish = ".next"`, `NODE_VERSION = "22"`) — see `GO_LIVE.md` §9
- [ ] **Node 22 runtime** — supabase-js warns Node 20 deprecated; set `NODE_VERSION = "22"` on Netlify
- [ ] **Production env vars** — set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` on Netlify (never commit `.env.local`)

### Data / auth / security
- [ ] **Commit the WIP** (furniture catalog + scanner) so it ships
- [ ] **Confirm migrations applied to remote Supabase** (`aoysbhiwbpqqhxyfkkvl`)
- [ ] **RLS policies tested** — leads/inventory/reviews/profiles policies defined in schema but untested with authenticated roles (anon submit vs mover read vs admin)
- [ ] **Resend domain verification** — verify `movers.help` in Resend, confirm `notifications@movers.help` sender + valid API key
- [ ] **Spam protection** — quote + review forms are public with no CAPTCHA/honeypot/rate-limit
- [ ] **Env validation** — no zod env schema; fail-fast on missing keys (`@t3-oss/env-nextjs` pattern)

### Content / legal
- [ ] **Hardcoded trust numbers + fake testimonials** — replace "50,000+ Moves" / placeholder reviews with honest framing (FTC risk)

---

## 📋 POST-LAUNCH (P1 — first 30 days)

### Auth
- [ ] OAuth providers (Google) — routes exist, providers unwired
- [ ] Mover invite flow admin UI — `lib/invites.ts` + `invite_codes` table exist; no admin UI to create/revoke codes

### Dashboard (`app/(dashboard)/`)
- [ ] Lead status workflow UI — dashboard renders lead list **read-only**; `/api/leads` PATCH exists but is unwired from the UI
- [ ] Lead detail view — inventory, notes, status changes
- [ ] Mover assignment — admin assigns movers to leads (`/api/leads` PATCH supports `moverId`, no UI)
- [ ] Role-based views — customer vs mover vs admin

### Landing / Customer
- [ ] Review submission UI — `/api/reviews` POST works; no on-site form (`components/landing/reviews.tsx` is hardcoded)
- [ ] Truck viewer 3D — verify rendering (`components/truck/truck-canvas.tsx`, R3F; demo data only)

### Database / API
- [ ] `/api/inventory` route (only `/api/leads` + `/api/reviews` exist)

### Scanner
- [ ] Safari/mobile-browser support (Phase 1 targets Chrome desktop)
- [ ] **Scanner accuracy benchmark** (autoplan P0 prerequisite before trust-stack features build on scanner output)
- [ ] Phase 5 (deferred by design): conversational LLM + STT

### WATCHDOG polish
- [ ] Analytics / event tracking, cookie consent, phone input mask, date picker styling

---

## 🗺️ STRATEGIC ROADMAP (IDEAS.md + autoplan review — P1/P2)

- [ ] Real testimonials (FTC-safe)
- [ ] Trust stack: mover vetting (DOT# + insurance), **escrow/payments (Stripe)** — FMCSA legal review before binding-quote code
- [ ] AI phone assistant + mover briefing card + warm transfer
- [ ] Packing hacks engine, content/SEO pages (`/packing-hacks`, `/moving-tomorrow`, guides)
- [ ] Hot-lead payment flow ($5–25 unlock)

---

## Key files / sources
- `GO_LIVE.md` — prioritized go-live checklist (NEW)
- `TODO.md` — original task list (mostly stale: pre-scanner, July 11)
- `docs/superpowers/plans/2026-07-11-matrix-rain.md` — matrix rain plan (9 tasks, done)
- `docs/superpowers/specs/2026-07-11-matrix-rain-design.md`, `2026-07-11-web-scanner-design.md` — specs
- `../movers.helpalpha/IDEAS.md` — P0–P3 roadmap + full gstack autoplan review
- `../movers.helpalpha/WATCHDOG.md` — 60+ known defects (legacy Next 14/Tailwind 3; many obsolete — Tailwind 4, Next 15 — but SEO/metadata/data-persistence items still apply)
- `../movers.helpalpha/graphify-out/GRAPH_REPORT.md` — knowledge graph report (stale, pre-scanner)
- Git log (kilo): `42ea49a` … `f1c80fe`
