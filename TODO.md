# Movers.help — Remaining Tasks

## Immediate

- [x] **Fix TypeScript errors** — all 30 TS errors fixed, `npx tsc --noEmit` passes clean
- [x] **Set up test suite** — Vitest + @testing-library/react, smoke test passes, `npm test` script added
- [x] **Configure git user** — `user.name: baytek`, `user.email: admin@thebaytek.com`

## Auth

- [x] **Signup flow** — server action in `app/(auth)/signup/actions.ts` works, connects to local Supabase
- [x] **Login flow** — `/login` renders 200, `app/(auth)/login/page.tsx` functional
- [ ] **OAuth providers** — Google, etc. (routes exist in `app/api/auth/[...nextauth]/`)
- [ ] **Mover invite flow** — `lib/invites.ts` has invite logic, needs UI for admin to create codes

## Dashboard

- [ ] **Lead management** — dashboard page renders but needs CRUD integration with Supabase
- [ ] **Lead detail view** — individual lead page with inventory, notes, status changes
- [ ] **Mover assignment** — admin can assign movers to leads
- [ ] **Role-based views** — customer vs mover vs admin dashboard experiences

## Landing Page

- [ ] **Quote/estimate form** — `components/landing/quote-section.tsx` exists, needs Supabase integration
- [ ] **Review submission** — `lib/reviews.ts` has logic, needs UI form on site
- [ ] **Truck viewer 3D** — `components/truck/truck-canvas.tsx` (Three.js), verify rendering works

## Database / API

- [ ] **API routes** — `/api/leads` exists, needs `/api/reviews`, `/api/inventory`
- [x] **Drizzle migrations** — Supabase migration `20260709223924_initial_schema.sql` exists, schema matches DB. Drizzle is intentionally unused
- [x] **Seed data** — reviews (6 rows), pricing_rules (1 row) confirmed in local DB. inventory_items and profiles start empty (by design)
- [ ] **RLS policies** — policies defined in schema but need testing with authenticated roles

## DevOps

- [x] **Environment variables** — `.env.local` configured with Supabase URL and anon key for local dev
- [ ] **CI/CD** — GitHub Actions or similar for lint, typecheck, test
- [ ] **Production deployment** — Vercel or similar, connected to remote Supabase project
