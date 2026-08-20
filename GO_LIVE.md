# Movers.help — FINAL Go-Live Checklist

**Status:** pre-launch. Domain is on Cloudflare. Supabase (remote) + Resend keys configured locally but not deployed.
**Verified:** 2026-08-20 — `tsc` clean, 72 tests passing, `npm run build` clean (11 routes).

This is the **ship-blocking** list. Every box in **P0** must be checked before `movers.help` serves real traffic. P1 is the 30-day window after launch.

---

## P0 — SHIP BLOCKING

### 1. Commit the uncommitted WIP
Uncommitted changes ship nothing. Review + commit before any deploy:

```bash
git add app/scan/page.tsx lib/inventory.ts lib/furniture.ts lib/__tests__/ \
  lib/scanner-web/ supabase/migrations/20260814000001_furniture_catalog_accurate.sql
git commit -m "feat: accurate furniture catalog + scanner refinements"
```

- [ ] WIP committed (furniture catalog + scanner changes)

### 2. Confirm migrations are applied to the remote Supabase project
`.env.local` points to `aoysbhiwbpqqhxyfkkvl.supabase.co`. The migrations live in `supabase/migrations/` but **application to that remote project is unverified**.

- [ ] `20260709223924_initial_schema.sql` applied
- [ ] `20260710000000_init.sql` applied
- [ ] `20260711000001_furniture_catalog.sql` applied
- [ ] `20260814000001_furniture_catalog_accurate.sql` applied
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

- [ ] `metadataBase` set → rebuild confirms warning gone

### 6. Generate the missing `og-image.png`
`openGraph.images[0].url = "/og-image.png"` but `public/og-image.png` does not exist.

- [ ] 1200×630 PNG at `public/og-image.png` (matrix/brand aesthetic)
- [ ] Verify with `https://movers.help/og-image.png` post-deploy

### 7. Add `robots.ts` + `sitemap.ts`
No crawl guidance exists.

- [ ] `app/robots.ts` → `allow: /`, `disallow: /dashboard`, `disallow: /api/`
- [ ] `app/sitemap.ts` → `/`, `/scan`, `/login`, `/signup`
- [ ] Verify `/robots.txt` + `/sitemap.xml` render

### 8. Favicon raster
Only `public/favicon.svg` exists (SVG icons work, but social/browser favicons want a raster).

- [ ] `app/icon.png` (512×512) — Next auto-serves as favicon/OG fallback

### 9. Deploy (choose one target)

**Option A — Vercel (recommended, fastest for Next 15):**
- [ ] Push `master` to GitHub
- [ ] Import repo into Vercel (framework auto-detected)
- [ ] Set env vars (see §10)
- [ ] Cloudflare DNS: `movers.help` + `www` → CNAME to Vercel (`cname.vercel-dns.com`), or use Vercel nameservers
- [ ] Verify HTTPS on `https://movers.help`

**Option B — Cloudflare Pages/Workers (if staying fully on Cloudflare):**
- [ ] Add `@opennextjs/cloudflare` + `wrangler` (Next app router requires the OpenNext adapter)
- [ ] `wrangler.toml` / `open-next.config.ts`
- [ ] Set env vars + build command (`opennextjs-cloudflare build && opennextjs-cloudflare deploy`)

- [ ] **Node ≥22 runtime** on the host (supabase-js deprecates Node 20)

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

- [ ] Honeypot field (cheapest) or CAPTCHA (Turnstile/Cloudflare-friendly) on quote form
- [ ] Rate limit on `/api/leads` + `/api/reviews` POST

### 13. Env validation
No zod env schema; missing keys fail silently at runtime.

- [ ] Add `lib/env.ts` (zod / `@t3-oss/env-nextjs`) validating the 4 vars at startup

### 14. Honest trust numbers + testimonials
- [ ] Remove/replace hardcoded "50,000+ Moves Completed" / "200+ Cities" with defensible framing
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
