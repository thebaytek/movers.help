-- movers.helpkilo — Supabase Database Schema
-- Run this in the Supabase SQL Editor to create all tables and policies.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- Users (extends auth.users)
-- ============================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  company_name text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'mover', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Leads
-- ============================================
create table public.leads (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid references public.profiles(id) on delete set null,
  mover_id        uuid references public.profiles(id) on delete set null,
  status          text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'booked', 'completed', 'closed')),
  move_from_city  text not null,
  move_from_state text not null,
  move_to_city    text not null,
  move_to_state   text not null,
  move_date       date,
  total_cu_ft     numeric(8,1) default 0,
  total_items     integer default 0,
  agreed_quote    numeric(10,2),
  contact_name    text,
  contact_email   text,
  contact_phone   text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================
-- Inventory Items
-- ============================================
create table public.inventory_items (
  id             uuid primary key default uuid_generate_v4(),
  lead_id        uuid not null references public.leads(id) on delete cascade,
  room           text not null,
  item           text not null,
  quantity       integer default 1,
  cu_ft_per_item numeric(6,2) default 15
);

-- ============================================
-- Reviews
-- ============================================
create table public.reviews (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid references public.profiles(id),
  mover_id        uuid references public.profiles(id),
  lead_id         uuid references public.leads(id),
  rating          integer not null check (rating between 1 and 5),
  title           text,
  body            text not null,
  customer_name   text not null,
  move_from_city  text,
  move_to_city    text,
  is_verified     boolean default false,
  created_at      timestamptz not null default now()
);

-- ============================================
-- Pricing Rules
-- ============================================
create table public.pricing_rules (
  id                        uuid primary key default uuid_generate_v4(),
  name                      text not null,
  base_rate_per_cu_ft       numeric(6,2) not null,
  rate_per_mile             numeric(6,2) default 0.75,
  minimum_price             numeric(10,2) default 500,
  labor_rate_per_hour       numeric(6,2) default 75,
  seasonal_multiplier_summer numeric(4,2) default 1.25,
  seasonal_multiplier_winter numeric(4,2) default 0.85,
  accessibility_fee         numeric(8,2) default 150,
  packing_service_rate      numeric(6,2) default 0,
  storage_rate_per_day      numeric(6,2) default 25,
  active                    boolean default true,
  created_at                timestamptz not null default now()
);

-- ============================================
-- Mover Invite Codes
-- ============================================
create table public.invite_codes (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,
  created_by  uuid references public.profiles(id),
  used_by     uuid references public.profiles(id),
  used_at     timestamptz,
  max_uses    integer default 1,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- ============================================
-- Row Level Security
-- ============================================
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.inventory_items enable row level security;
alter table public.reviews enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.invite_codes enable row level security;

-- Profiles: users can read all profiles, update only their own
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Leads: customers see their own, movers see leads assigned to them
create policy "Customers can view own leads" on public.leads for select using (auth.uid() = customer_id);
create policy "Movers can view assigned leads" on public.leads for select using (auth.uid() = mover_id);
create policy "Anyone can insert leads" on public.leads for insert with check (true);
create policy "Movers can update assigned leads" on public.leads for update using (auth.uid() = mover_id);

-- Inventory: viewable by lead owner or assigned mover
create policy "Lead owner can view inventory" on public.inventory_items for select using (
  exists (select 1 from public.leads where id = inventory_items.lead_id and (customer_id = auth.uid() or mover_id = auth.uid()))
);
create policy "Anyone can insert inventory" on public.inventory_items for insert with check (true);

-- Reviews: public read, authenticated insert
create policy "Reviews are public" on public.reviews for select using (true);
create policy "Authenticated users can create reviews" on public.reviews for insert with check (auth.uid() = customer_id);

-- Pricing: public read
create policy "Pricing rules are public" on public.pricing_rules for select using (true);

-- Invite codes: only admin can create, mover can use
create policy "Admins can manage invite codes" on public.invite_codes for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Anyone can read their own invite code" on public.invite_codes for select using (
  auth.uid() = used_by or auth.uid() = created_by
);

-- ============================================
-- Indexes
-- ============================================
create index idx_leads_status on public.leads(status);
create index idx_leads_customer on public.leads(customer_id);
create index idx_leads_mover on public.leads(mover_id);
create index idx_leads_created on public.leads(created_at desc);
create index idx_inventory_lead on public.inventory_items(lead_id);
create index idx_reviews_verified on public.reviews(is_verified) where is_verified = true;
create index idx_reviews_mover on public.reviews(mover_id);

-- ============================================
-- Seed data: verified reviews
-- ============================================
insert into public.reviews (id, rating, title, body, customer_name, move_from_city, move_to_city, is_verified) values
  (uuid_generate_v4(), 5, 'Made our cross-country move stress-free', 'From the AI scan to the final delivery, everything was transparent and on-budget. The 3D truck view showed us exactly how our stuff would fit. No surprises, no hidden fees — exactly what they promised.', 'Sarah Mitchell', 'Austin', 'Denver', true),
  (uuid_generate_v4(), 5, 'Finally, honest moving pricing', 'I got 4 quotes from other companies and they were all over the place. Movers.help gave me one price based on my actual inventory scan and it was dead-on. The movers showed up on time and the final bill matched the quote.', 'James Rodriguez', 'San Diego', 'Portland', true),
  (uuid_generate_v4(), 5, 'The scanner is a game changer', 'I walked through my apartment with my phone and it automatically detected my furniture. Took 5 minutes. The quote was accurate to within $200 of the final price.', 'Maria Chen', 'Chicago', 'Nashville', true),
  (uuid_generate_v4(), 4, 'Great experience, minor scheduling hiccup', 'The pricing was fair and the team was professional. We had a one-day delay on pickup due to weather, but they communicated clearly. Would use again.', 'David Park', 'Seattle', 'Phoenix', true),
  (uuid_generate_v4(), 5, 'Best moving experience in 20 years', 'I have moved 8 times in my career. This was the first time the final price was within 3% of the quote. The AI inventory scanner eliminates the guesswork.', 'Linda Thompson', 'Miami', 'Atlanta', true),
  (uuid_generate_v4(), 5, 'Perfect for our office relocation', 'We moved our 20-person office and the scanner handled desks, chairs, servers — everything. The truck visualization helped us choose the right truck size.', 'Michael Torres', 'New York', 'Charlotte', true);

insert into public.pricing_rules (id, name, base_rate_per_cu_ft, rate_per_mile, minimum_price, labor_rate_per_hour, seasonal_multiplier_summer, seasonal_multiplier_winter, accessibility_fee, active) values
  (uuid_generate_v4(), 'Standard Long-Distance', 5.50, 0.65, 500, 65, 1.25, 0.85, 150, true);
