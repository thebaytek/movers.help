-- Prevent self-service privilege escalation via profiles.role.
-- Authenticated users may update only non-privileged columns; role, id, and
-- created_at are no longer client-writable. service_role (the signup server
-- action) retains full UPDATE and is unaffected by these grants.
revoke update on public.profiles from authenticated, anon;
grant update (full_name, company_name, phone, updated_at) on public.profiles to authenticated;
