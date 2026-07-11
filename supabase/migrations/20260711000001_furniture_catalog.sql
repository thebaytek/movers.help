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

-- Seed data: canonical cubic footage for common furniture (65+ items)
INSERT INTO public.furniture_catalog (label, cu_ft, category) VALUES
  -- Bedroom (20)
  ('Twin Bed', 40, 'Bedroom'),
  ('Full Bed', 50, 'Bedroom'),
  ('Queen Bed', 60, 'Bedroom'),
  ('King Bed', 75, 'Bedroom'),
  ('Cal King Bed', 80, 'Bedroom'),
  ('Bunk Bed', 55, 'Bedroom'),
  ('Crib', 20, 'Bedroom'),
  ('Dresser', 25, 'Bedroom'),
  ('Chest of Drawers', 30, 'Bedroom'),
  ('Nightstand', 8, 'Bedroom'),
  ('Wardrobe', 40, 'Bedroom'),
  ('Armoire', 45, 'Bedroom'),
  ('Vanity', 15, 'Bedroom'),
  ('Bed Frame', 20, 'Bedroom'),
  ('Hope Chest', 10, 'Bedroom'),
  ('Mattress (Twin)', 20, 'Bedroom'),
  ('Mattress (Full)', 28, 'Bedroom'),
  ('Mattress (Queen)', 35, 'Bedroom'),
  ('Mattress (King)', 45, 'Bedroom'),
  ('Mattress (Cal King)', 48, 'Bedroom'),
  -- Living Room (16)
  ('Sofa (3-seater)', 50, 'Living Room'),
  ('Sofa (2-seater)', 35, 'Living Room'),
  ('Sectional Sofa', 100, 'Living Room'),
  ('Loveseat', 30, 'Living Room'),
  ('Recliner', 30, 'Living Room'),
  ('Ottoman', 8, 'Living Room'),
  ('Coffee Table', 10, 'Living Room'),
  ('End Table', 5, 'Living Room'),
  ('TV Stand', 15, 'Living Room'),
  ('Media Console', 12, 'Living Room'),
  ('Entertainment Center', 35, 'Living Room'),
  ('Bookshelf', 20, 'Living Room'),
  ('Armchair', 18, 'Living Room'),
  ('Floor Lamp', 3, 'Living Room'),
  ('Floor Rug', 8, 'Living Room'),
  ('Large Rug', 5, 'Living Room'),
  -- Kitchen (11)
  ('Dining Table', 25, 'Kitchen'),
  ('Dining Chair', 5, 'Kitchen'),
  ('Bar Stool', 6, 'Kitchen'),
  ('Refrigerator', 40, 'Kitchen'),
  ('Freezer Chest', 25, 'Kitchen'),
  ('Microwave', 3, 'Kitchen'),
  ('Dishwasher', 15, 'Kitchen'),
  ('Stove/Oven', 20, 'Kitchen'),
  ('Toaster Oven', 2, 'Kitchen'),
  ('Kitchen Island', 25, 'Kitchen'),
  ('Wine Rack', 8, 'Kitchen'),
  -- Office (9)
  ('Desk', 20, 'Office'),
  ('Standing Desk', 25, 'Office'),
  ('Office Chair', 12, 'Office'),
  ('Filing Cabinet', 15, 'Office'),
  ('Bookshelf (Small)', 10, 'Office'),
  ('Monitor', 5, 'Office'),
  ('Printer', 6, 'Office'),
  ('Shredder', 4, 'Office'),
  ('Whiteboard', 6, 'Office'),
  -- Garage (10)
  ('Workbench', 25, 'Garage'),
  ('Tool Chest', 20, 'Garage'),
  ('Toolbox (Large)', 15, 'Garage'),
  ('Bicycle', 12, 'Garage'),
  ('Ladder', 8, 'Garage'),
  ('Lawn Mower', 15, 'Garage'),
  ('Snowblower', 15, 'Garage'),
  ('Christmas Tree Box', 20, 'Garage'),
  ('Storage Bin (Large)', 8, 'Garage'),
  ('Storage Bin (Medium)', 5, 'Garage'),
  -- Bathroom (3)
  ('Bathroom Vanity', 12, 'Bathroom'),
  ('Medicine Cabinet', 4, 'Bathroom'),
  ('Laundry Basket', 3, 'Bathroom'),
  -- Other (13)
  ('Large Box', 4, 'Other'),
  ('Medium Box', 3, 'Other'),
  ('Small Box', 2, 'Other'),
  ('Suitcase', 8, 'Other'),
  ('Mirror (Large)', 8, 'Other'),
  ('Plant (Large)', 10, 'Other'),
  ('Vacuum Cleaner', 4, 'Other'),
  ('Ironing Board', 3, 'Other'),
  ('Pet Crate (Large)', 12, 'Other'),
  ('Pet Crate (Small)', 6, 'Other'),
  ('Ceiling Fan', 6, 'Other'),
  ('Dehumidifier', 4, 'Other'),
  ('Bench', 8, 'Other')
ON CONFLICT (label) DO NOTHING;

-- Index for label lookups
CREATE INDEX IF NOT EXISTS idx_furniture_catalog_label ON public.furniture_catalog (label);
