# Movers.help — FINAL Go-Live Checklist

**Status:** pre-launch. Domain is on Cloudflare. Supabase (remote) + Resend keys configured locally but not deployed.
**Verified:** 2026-08-22 — go-live fix session landed (see checked boxes below). Final `tsc` + build + smoke gate re-run at deploy.

This is the **ship-blocking** list. Every box in **P0** must be checked before `movers.help` serves real traffic. P1 is the 30-day window after launch.

---

## P0 — SHIP BLOCKING

### 1. Commit the uncommitted WIP
Uncommitted changes ship nothing. Review + commit before any deploy. The furniture/scanner WIP is committed (`8d2e32e`); this session's go-live fixes are still uncommitted:

```bash
git add -A
git commit -m "feat: go-live fixes — invite-gated signup, lead/review API auth, honest landing copy, netlify.toml, reviews anon-insert migration"
```

- [ ] WIP committed (this session's go-live fixes)

### 2. Confirm migrations are applied to the remote Supabase project
`.env.local` points to `aoysbhiwbpqqhxyfkkvl.supabase.co`. The migrations live in `supabase/migrations/` but **application to that remote project is unverified**.

- [ ] `20260709223924_initial_schema.sql` applied
- [ ] `20260710000000_init.sql` applied
- [ ] `20260711000001_furniture_catalog.sql` applied
- [ ] `20260814000001_furniture_catalog_accurate.sql` applied
- [ ] `20260822000000_reviews_anon_insert.sql` applied — **NEW this session** (reviews anon-insert RLS fix); must still be applied to remote
- [ ] Seed rows present (6 reviews, pricing_rules) — or re-seed via `npm run db:seed`

Verify via Supabase dashboard → SQL editor (`\dt`, `\d leads`) or `supabase db push`.

### 3. Enable + test Supabase Auth
Signup/login use `supabase.auth.signUp`/`signIn`. Confirm in the remote project:

- [ ] Auth provider **Email** enabled
- [ ] Decide email-confirmation on/off (recommended ON for production)
- [ ] Site URL + redirect URLs set to `https://movers.help` (Auth → URL Configuration)
- [ ] End-to-end: sign up → confirm → land on `/dashboard`

### 4. Test RLS policies with real roles
Policies exist in schema but are untested. Confirm each access path:

- [ ] Anon visitor can POST `/api/leads` (create lead)
- [ ] Anon visitor can POST `/api/reviews` (submit review)
- [ ] Mover (authenticated) can read assigned leads only
- [ ] Admin can read all leads / assign movers / change status
- [ ] Service-role key is **not** exposed to the browser (it isn't in `NEXT_PUBLIC_*` — re-confirm)

### 5. Set `metadataBase` in `app/layout.tsx`
Build currently warns OG/Twitter resolve to `http://localhost:3000`.

```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://movers.help"),
  // ...existing fields
};
```

- [x] `metadataBase` set in `app/layout.tsx` → OG warning gone (2026-08-22)

### 6. Generate the missing `og-image.png`
`openGraph.images[0].url = "/og-image.png"` but `public/og-image.png` does not exist.

- [x] 1200×630 PNG at `public/og-image.png` (matrix/brand aesthetic) — generated 2026-08-22
- [ ] Verify with `https://movers.help/og-image.png` post-deploy

### 7. Add `robots.ts` + `sitemap.ts`
No crawl guidance exists.

- [x] `app/robots.ts` → `allow: /`, `disallow: /dashboard`, `disallow: /api/` (added 2026-08-22)
- [x] `app/sitemap.ts` → `/`, `/scan`, `/login`, `/signup` (added 2026-08-22)
- [x] Verify `/robots.txt` + `/sitemap.xml` render — serving verified

### 8. Favicon raster
Only `public/favicon.svg` exists (SVG icons work, but social/browser favicons want a raster).

- [x] `app/icon.png` (512×512) generated — Next auto-serves as favicon/OG fallback

### 9. Deploy to Netlify (chosen target — 2026-08-22)

Next.js 15 App Router runs on Netlify's built-in Next.js runtime — no OpenNext adapter needed.

- [x] Add `netlify.toml` at repo root (added 2026-08-22):
  ```toml
  [build]
    command = "npm run build"
    publish = ".next"

  [build.environment]
    NODE_VERSION = "22"
  ```
- [ ] Commit + push `netlify.toml`
- [ ] Netlify → Add new site → Import from Git (`github.com/thebaytek/movers.help` — private; grant the Netlify GitHub app repo access)
- [ ] Framework auto-detected (Next.js); confirm build command `npm run build`, publish dir `.next`
- [ ] Set env vars (see §10) — Site settings → Environment variables
- [ ] Custom domain: Domain management → add `movers.help` + `www.movers.help`
  - Either move DNS to Netlify (swap Cloudflare nameservers), **or**
  - Keep Cloudflare: CNAME `www` → `<site>.netlify.app`; apex via Cloudflare CNAME-flattening → `<site>.netlify.app`
- [ ] **Node ≥22** — `NODE_VERSION = "22"` now set in `netlify.toml`; confirm the host honors it (supabase-js deprecates Node 20)
- [ ] Verify HTTPS + www→apex redirect on `https://movers.help`

### 10. Production environment variables
Set on the host (never commit `.env.local`):

| Var | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | remote project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service-role key |
| `RESEND_API_KEY` | Resend API key |

- [ ] All 4 set on host; local `.env.local` excluded from git

### 11. Resend: verify domain + sender
- [ ] Verify `movers.help` domain in Resend (DNS records added to Cloudflare)
- [ ] Confirm `notifications@movers.help` is a valid verified sender
- [ ] Confirm `RESEND_API_KEY` is a **production** key (current local value is 14 chars — likely a test key; replace with a real one)
- [ ] Trigger a real quote submit → receive the email

### 12. Spam protection on public forms
Quote + review forms are live POST endpoints with zero bot protection.

- [x] Honeypot field + rate limit on `/api/leads` POST (2026-08-22)
- [x] Rate limit on `/api/reviews` POST (2026-08-22)

### 13. Env validation
No zod env schema; missing keys fail silently at runtime.

- [x] `lib/env.ts` zod validation (2026-08-22): Supabase 3 vars hard-required; `RESEND_API_KEY` optional (placeholder-skip)

### 14. Honest trust numbers + testimonials
- [x] Removed fabricated claims — "50,000+ scans", "1,200+ movers", "4.9 rating", "10,000+ scans", "94% accuracy", "1200 reviews", "no fakes" (2026-08-22)
- [ ] Replace placeholder testimonials with real, verifiable quotes (FTC-safe)

### 15. Smoke test on the live domain
- [ ] `/` loads (dark matrix theme, no white-flash/unstyled links)
- [ ] `/scan` camera scanner renders (LIVE or SIMULATED badge)
- [ ] Quote form submit → lead appears in Supabase `leads` + email arrives
- [ ] `/login` + `/signup` work against remote Supabase
- [ ] `/dashboard` loads leads (authenticated)
- [ ] OG preview: paste `https://movers.help` into a social/debugger → card image + title render

---

## P1 — POST-LAUNCH (first 30 days)

### Auth
- [ ] OAuth providers (Google) — routes scaffolded, providers unwired
- [ ] Mover invite admin UI — create/revoke `invite_codes`

### Dashboard
- [ ] Lead status workflow UI — wire `/api/leads` PATCH (currently read-only list)
- [ ] Lead detail view — inventory, notes, status changes
- [ ] Mover assignment UI
- [ ] Role-based views (customer / mover / admin)

### Customer
- [ ] Review submission form on site (`/api/reviews` POST exists)
- [ ] Truck viewer 3D — verify rendering + wire real inventory (currently demo data)

### Scanner
- [ ] Safari / mobile-browser support
- [ ] **Accuracy benchmark** (autoplan P0 prerequisite — validate before trust-stack features depend on scanner output)

### API / Data
- [ ] `/api/inventory` route

### WATCHDOG polish
- [ ] Analytics + event tracking
- [ ] Cookie consent banner (GDPR)
- [ ] Phone input mask, date picker styling

---

## Out of scope for launch (do not block)
- Full AR room scanning (12-month horizon)
- ML pricing from 10K+ moves
- AI phone assistant / warm transfer (P1-P2, needs phone infra)
- Escrow/Stripe payments — **requires FMCSA legal review first** (autoplan finding: binding quotes need physical-survey waiver)
- Mover vetting (DOT#/insurance) — supply-side experiment before building
