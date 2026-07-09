SET check_function_bodies = false;
CREATE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$function$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TABLE public.inventory_items (id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL, lead_id uuid NOT NULL, room text NOT NULL, item text NOT NULL, quantity integer DEFAULT 1, cu_ft_per_item numeric(6,2) DEFAULT 15);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.inventory_items TO anon;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.inventory_items TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.inventory_items TO service_role;
CREATE INDEX idx_inventory_lead ON public.inventory_items (lead_id);
CREATE POLICY "Anyone can insert inventory" ON public.inventory_items FOR INSERT WITH CHECK (true);
CREATE TABLE public.invite_codes (id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL, code text NOT NULL, created_by uuid, used_by uuid, used_at timestamp with time zone, max_uses integer DEFAULT 1, expires_at timestamp with time zone, created_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ADD CONSTRAINT invite_codes_code_key UNIQUE (code);
ALTER TABLE public.invite_codes ADD CONSTRAINT invite_codes_pkey PRIMARY KEY (id);
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.invite_codes TO anon;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.invite_codes TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.invite_codes TO service_role;
CREATE POLICY "Anyone can read their own invite code" ON public.invite_codes FOR SELECT USING (((auth.uid() = used_by) OR (auth.uid() = created_by)));
CREATE TABLE public.leads (id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL, customer_id uuid, mover_id uuid, status text DEFAULT 'new'::text NOT NULL, move_from_city text NOT NULL, move_from_state text NOT NULL, move_to_city text NOT NULL, move_to_state text NOT NULL, move_date date, total_cu_ft numeric(8,1) DEFAULT 0, total_items integer DEFAULT 0, agreed_quote numeric(10,2), contact_name text, contact_email text, contact_phone text, notes text, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
CREATE POLICY "Lead owner can view inventory" ON public.inventory_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.leads
  WHERE ((leads.id = inventory_items.lead_id) AND ((leads.customer_id = auth.uid()) OR (leads.mover_id = auth.uid()))))));
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ADD CONSTRAINT leads_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check CHECK (status = ANY (ARRAY['new'::text, 'contacted'::text, 'quoted'::text, 'booked'::text, 'completed'::text, 'closed'::text]));
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.leads TO anon;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.leads TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.leads TO service_role;
CREATE INDEX idx_leads_status ON public.leads (status);
CREATE INDEX idx_leads_customer ON public.leads (customer_id);
CREATE INDEX idx_leads_mover ON public.leads (mover_id);
CREATE INDEX idx_leads_created ON public.leads (created_at DESC);
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view own leads" ON public.leads FOR SELECT USING ((auth.uid() = customer_id));
CREATE POLICY "Movers can update assigned leads" ON public.leads FOR UPDATE USING ((auth.uid() = mover_id));
CREATE POLICY "Movers can view assigned leads" ON public.leads FOR SELECT USING ((auth.uid() = mover_id));
CREATE TABLE public.pricing_rules (id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL, name text NOT NULL, base_rate_per_cu_ft numeric(6,2) NOT NULL, rate_per_mile numeric(6,2) DEFAULT 0.75, minimum_price numeric(10,2) DEFAULT 500, labor_rate_per_hour numeric(6,2) DEFAULT 75, seasonal_multiplier_summer numeric(4,2) DEFAULT 1.25, seasonal_multiplier_winter numeric(4,2) DEFAULT 0.85, accessibility_fee numeric(8,2) DEFAULT 150, packing_service_rate numeric(6,2) DEFAULT 0, storage_rate_per_day numeric(6,2) DEFAULT 25, active boolean DEFAULT true, created_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ADD CONSTRAINT pricing_rules_pkey PRIMARY KEY (id);
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.pricing_rules TO anon;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.pricing_rules TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.pricing_rules TO service_role;
CREATE POLICY "Pricing rules are public" ON public.pricing_rules FOR SELECT USING (true);
CREATE TABLE public.profiles (id uuid NOT NULL, full_name text, company_name text, phone text, role text DEFAULT 'customer'::text NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
CREATE POLICY "Admins can manage invite codes" ON public.invite_codes USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.invite_codes ADD CONSTRAINT invite_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);
ALTER TABLE public.invite_codes ADD CONSTRAINT invite_codes_used_by_fkey FOREIGN KEY (used_by) REFERENCES public.profiles(id);
ALTER TABLE public.leads ADD CONSTRAINT leads_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD CONSTRAINT leads_mover_id_fkey FOREIGN KEY (mover_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role = ANY (ARRAY['customer'::text, 'mover'::text, 'admin'::text]));
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.profiles TO anon;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.profiles TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.profiles TO service_role;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));
CREATE TABLE public.reviews (id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL, customer_id uuid, mover_id uuid, lead_id uuid, rating integer NOT NULL, title text, body text NOT NULL, customer_name text NOT NULL, move_from_city text, move_to_city text, is_verified boolean DEFAULT false, created_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.profiles(id);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_mover_id_fkey FOREIGN KEY (mover_id) REFERENCES public.profiles(id);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5);
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.reviews TO anon;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.reviews TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.reviews TO service_role;
CREATE INDEX idx_reviews_verified ON public.reviews (is_verified) WHERE is_verified = true;
CREATE INDEX idx_reviews_mover ON public.reviews (mover_id);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK ((auth.uid() = customer_id));
CREATE POLICY "Reviews are public" ON public.reviews FOR SELECT USING (true);
