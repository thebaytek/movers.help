# Movers.help — Remaining Tasks

## Immediate

- [ ] **Fix TypeScript errors** — 30 pre-existing TS errors, mostly Drizzle ORM `never` type inference and implicit `any` params in `lib/auth.ts`, `lib/supabase/server.ts`, `app/api/leads/route.ts`, etc.
- [ ] **Set up test suite** — no test framework configured yet (Vitest or Jest recommended)
- [ ] **Configure git user** — `git config user.name` and `git config user.email` not set

## Auth

- [ ] **Signup flow** — form exists at `/signup` but needs end-to-end testing with Supabase local
- [ ] **Login flow** — verify email/password auth works with the Supabase local instance
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
- [ ] **Drizzle migrations** — `npm run db:generate` to create initial migration
- [ ] **Seed data** — `lib/db/seed.ts` exists, verify it populates correctly against local DB
- [ ] **RLS policies** — policies defined in schema but need testing with authenticated roles

## DevOps

- [ ] **Environment variables** — `.env.local` with Supabase URL and anon key for local dev
- [ ] **CI/CD** — GitHub Actions or similar for lint, typecheck, test
- [ ] **Production deployment** — Vercel or similar, connected to remote Supabase project
