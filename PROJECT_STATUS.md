# Movers.help — Project Status

**Updated:** 2026-08-22 (go-live fix session; final `tsc` + build + smoke gate re-run at deploy)
**Repo:** `/home/hunter/movers.help` (Next.js 15.5.20 / React 19 / Tailwind 4 / Supabase / Vitest) — formerly `movers.helpkilo`
**Legacy repo:** `/home/hunter/movers.helpalpha` (Next.js 14 — old landing + Expo mobile app + original scanner-web module) — formerly `movers.help`. Superseded except `apps/mobile/` (Expo) and `lib/scanner-web/` history.

---

## ✅ FIXED THIS SESSION (2026-08-22)

Go-live P0/defect fixes landed (see `GO_LIVE.md` for the full checklist). Final `tsc` + build + smoke gate re-run at deploy.

- **SEO / metadata**: `metadataBase` set in `app/layout.tsx` → OG warning gone
- **Assets**: `public/og-image.png` (1200×630) + `app/icon.png` (512×512) generated
- **Crawl**: `app/robots.ts` + `app/sitemap.ts` added (serving verified)
- **Env validation**: `lib/env.ts` zod schema — Supabase 3 vars hard-required; `RESEND_API_KEY` optional/placeholder-skip
- **Spam protection**: honeypot + rate limit on `/api/leads`, rate limit on `/api/reviews`
- **Deploy**: `netlify.toml` added (target Netlify, `NODE_VERSION = "22"`, `publish = ".next"`)
- **Migration**: `20260822000000_reviews_anon_insert.sql` (reviews anon-insert RLS fix) — **still must be APPLIED to remote Supabase**
- **API**: `/api/reviews` POST attaches `customer_id` when a session exists; `/api/leads` PATCH now requires auth (401 anon / 403 customer / mover via RLS / admin via service-role)
- **Signup**: mover role gated on a valid invite code (expiry + atomic redeem); no unconditional `role:mover`
- **Dashboard**: removed dead `/dashboard/leads` nav link; added `/dashboard/settings` page + copy button
- **Landing**: removed fabricated claims (50,000+ scans, 1,200+ movers, 4.9 rating, 10,000+ scans, 94% accuracy, 1200 reviews, "no fakes")
- **Housekeeping**: `package.json` renamed to `movers.help`; removed drizzle-kit scripts; deleted `drizzle.config.ts`

---

## 🔍 LAST FULL GATE (2026-08-20)

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
- `lib/env.ts` zod env validation — Supabase 3 vars hard-required; `RESEND_API_KEY` optional/placeholder-skip
- `netlify.toml` added (target Netlify, `NODE_VERSION = "22"`, `publish = ".next"`)
- `package.json` renamed to `movers.help`; drizzle-kit scripts removed; `drizzle.config.ts` deleted

### Brand & Landing (matrix aesthetic)
- Full rebrand: black/green matrix look, cyan highlights, no cyan gradients (`47bdc44`)
- Matrix rain canvas — full-site background, high-res, distant perspective, grid-intersection glow, reduced-motion support (`efbf9ab`, `335b8f5`, plan `docs/superpowers/plans/2026-07-11-matrix-rain.md`)
- Landing sections: hero, about, how-it-works, trust-signals, reviews, quote-section, scanner-demo, truck-viewer, final-cta, matrix-rain
- `brandkit.html` at repo root; `components/brand/` logo variants
- `error.tsx`, `loading.tsx`, `not-found.tsx` route files exist
- Metadata: `title`/`description`/`keywords`/`openGraph`/`twitter`/`robots` + `metadataBase: new URL("https://movers.help")` in `app/layout.tsx` (OG warning fixed 2026-08-22)
- `public/og-image.png` (1200×630) + `app/icon.png` (512×512) generated; `app/robots.ts` + `app/sitemap.ts` added
- Honest trust copy — fabricated claims removed (50,000+ scans, 1,200+ movers, 4.9 rating, 10,000+ scans, 94% accuracy, 1200 reviews, "no fakes")

### Auth & Data
- Signup flow (`app/(auth)/signup/actions.ts`) — email/password + **mover role gated on a valid invite code** (expiry + atomic redeem; no unconditional `role:mover`) → `profiles`, redirects to `/dashboard`
- Login flow (`app/(auth)/login/`) — renders 200
- NextAuth scaffolding — `app/api/auth/[...nextauth]/` + callback (routes only, providers unwired)
- **Remote Supabase project configured** (`aoysbhiwbpqqhxyfkkvl.supabase.co`) — anon key + service-role key in `.env.local`
- Migrations in `supabase/migrations/`:
  - `20260709223924_initial_schema.sql` (leads, reviews, pricing_rules, inventory_items, profiles)
  - `20260710000000_init.sql`, `20260711000001_furniture_catalog.sql`
  - `20260814000001_furniture_catalog_accurate.sql` — committed (`8d2e32e`)
  - `20260822000000_reviews_anon_insert.sql` — **new this session** (reviews anon-insert RLS fix); uncommitted + must be applied to remote
- ⚠️ **Whether migrations are applied to the remote project is UNVERIFIED** — must confirm via Supabase dashboard or `supabase db push` before go-live

### Scanner (web) — `app/scan/` + `lib/scanner-web/`
- Phase 1 ✅ Live camera scanner: MediaPipe EfficientDet + TF.js COCO-SSD fallback, backend badge (LIVE/SIMULATED), 5 FPS loop, tab-pause
- Phase 2 ✅ Spatial memory: SpatialTracker (IoU), DuplicateGuard, RoomMapper, manual room picker UI, room summary panel
- Phase 3 ✅ Volume sizing: volume-calculator (bbox+depth), live cu ft counter in HUD, lookup fallback
- Phase 4 ✅ Scan guide agent: contextual, room-aware, TTS (Web Speech), bulky-item rules
- Scanner fixes: black-screen fix (h-dvh→h-screen), loading timeout, StrictMode guard

### API
- `/api/leads` — POST (create lead + inventory + resend email notification; honeypot + rate limit) + PATCH (status/mover/notes; **auth required**: 401 anon / 403 customer / mover via RLS / admin via service-role)
- `/api/reviews` — POST (submit; attaches `customer_id` when a session exists; rate-limited) + GET (list, `verified` filter, limit)
- `/api/auth/callback`, `/api/auth/[...nextauth]`

### Dashboard
- Removed dead `/dashboard/leads` nav link; added `/dashboard/settings` page + invite-code copy button

---

## 🚧 IN PROGRESS (uncommitted WIP on disk)

From `git status` — needs review + commit **before deploy**:
- Furniture/scanner WIP **committed** (`8d2e32e`) — no longer untracked
- **Go-live fixes (2026-08-22, uncommitted)** — modified `app/(auth)/signup/actions.ts`, `app/api/leads/route.ts`, `app/api/reviews/route.ts`, `app/(dashboard)/layout.tsx`, `components/landing/{about,final-cta,hero,reviews,trust-signals}.tsx`, `package.json`
- **New (untracked)** — `app/(dashboard)/dashboard/settings/` (page + copy button), `netlify.toml`, `supabase/migrations/20260822000000_reviews_anon_insert.sql`
- **Deleted** — `drizzle.config.ts`

---

## 🚨 GO-LIVE BLOCKERS (remaining — must fix before `movers.help` is live)

Full checklist: **`GO_LIVE.md`** (sibling file). Summary of what is still open:

### Deployment / environment
- [ ] **Commit the WIP** (furniture catalog + scanner + this session's fixes) so it ships
- [ ] **Confirm migrations applied to remote Supabase** (`aoysbhiwbpqqhxyfkkvl`) — incl. new `20260822000000_reviews_anon_insert.sql`
- [ ] **Production env vars on Netlify** — set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` (never commit `.env.local`)
- [ ] **Netlify site + Cloudflare DNS** — import repo into Netlify, add custom domain + DNS (CNAME `www` → `<site>.netlify.app`; apex CNAME-flattening)
- [ ] **Node 22 runtime** — `NODE_VERSION = "22"` is now in `netlify.toml`; confirm the host honors it

### Data / auth / security
- [ ] **Supabase Auth enable + URLs** — Email provider on; Site URL + redirect URLs → `https://movers.help`
- [ ] **RLS policies tested** — leads/inventory/reviews/profiles policies defined in schema but untested with authenticated roles (anon submit vs mover read vs admin)
- [ ] **Resend real key + domain** — verify `movers.help` in Resend, confirm `notifications@movers.help` sender + valid production API key (current local key is a test key)

### Content
- [ ] **Real testimonials/reviews** — placeholder testimonials still need real, verifiable quotes (FTC-safe)

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
