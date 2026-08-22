-- Allow anonymous review submission; the is_verified flag gates display.
-- The prior policy required auth.uid() = customer_id, but the POST route
-- inserts customer_id as NULL for anonymous submissions, so every insert was
-- silently rejected once RLS was enforced.
--
-- The insert policy also forbids forging is_verified=true or spoofing
-- customer_id directly via PostgREST: verified status is app-controlled, and
-- customer_id must be the caller's own id (or null for anonymous).
drop policy if exists "Authenticated users can create reviews" on public.reviews;
create policy "Anyone can insert reviews" on public.reviews for insert
with check (is_verified = false and (customer_id is null or customer_id = auth.uid()));
