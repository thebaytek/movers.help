-- Furniture Catalog: canonical cubic footage lookup table
-- Public read access — no auth required for the scanner to look up volumes

CREATE TABLE IF NOT EXISTS public.furniture_catalog (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  label text NOT NULL,
  cu_ft numeric(6,2) NOT NULL,
  category text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.furniture_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.furniture_catalog ADD CONSTRAINT furniture_catalog_pkey PRIMARY KEY (id);
ALTER TABLE public.furniture_catalog ADD CONSTRAINT furniture_catalog_label_key UNIQUE (label);

-- Public read: anyone (including anonymous scanner users) can read the catalog
CREATE POLICY "Furniture catalog is public" ON public.furniture_catalog
  FOR SELECT USING (true);

-- Seed data: canonical cubic footage for common furniture
INSERT INTO public.furniture_catalog (label, cu_ft, category) VALUES
  -- Bedroom
  ('Queen Bed', 60, 'Bedroom'),
  ('King Bed', 75, 'Bedroom'),
  ('Twin Bed', 40, 'Bedroom'),
  ('Dresser', 25, 'Bedroom'),
  ('Nightstand', 8, 'Bedroom'),
  ('Wardrobe', 40, 'Bedroom'),
  ('Mattress (Queen)', 35, 'Bedroom'),
  ('Mattress (King)', 45, 'Bedroom'),
  ('Mattress (Twin)', 20, 'Bedroom'),
  -- Living Room
  ('Sofa (3-seater)', 50, 'Living Room'),
  ('Sofa (2-seater)', 35, 'Living Room'),
  ('Loveseat', 30, 'Living Room'),
  ('Coffee Table', 10, 'Living Room'),
  ('TV Stand', 15, 'Living Room'),
  ('Bookshelf', 20, 'Living Room'),
  ('Armchair', 18, 'Living Room'),
  ('Large Rug', 5, 'Living Room'),
  -- Kitchen
  ('Dining Table', 25, 'Kitchen'),
  ('Dining Chair', 5, 'Kitchen'),
  ('Refrigerator', 40, 'Kitchen'),
  ('Microwave', 3, 'Kitchen'),
  ('Dishwasher', 15, 'Kitchen'),
  ('Stove/Oven', 20, 'Kitchen'),
  -- Office
  ('Desk', 20, 'Office'),
  ('Office Chair', 12, 'Office'),
  ('Filing Cabinet', 15, 'Office'),
  -- Garage
  ('Toolbox (Large)', 15, 'Garage'),
  ('Bicycle', 12, 'Garage'),
  ('Ladder', 8, 'Garage'),
  ('Lawn Mower', 15, 'Garage'),
  -- Other
  ('Large Box', 4, 'Other'),
  ('Medium Box', 3, 'Other'),
  ('Small Box', 2, 'Other')
ON CONFLICT (label) DO NOTHING;

-- Index for label lookups
CREATE INDEX IF NOT EXISTS idx_furniture_catalog_label ON public.furniture_catalog (label);
