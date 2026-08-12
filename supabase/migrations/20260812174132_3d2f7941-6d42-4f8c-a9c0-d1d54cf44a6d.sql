-- roles
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- brands
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands public read" ON public.brands FOR SELECT USING (true);
CREATE POLICY "brands admin write" ON public.brands FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  short_description text,
  description text,
  specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  price numeric(12,2),
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read active" ON public.products FOR SELECT TO anon USING (active = true);
CREATE POLICY "products auth read" ON public.products FOR SELECT TO authenticated USING (active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- product images
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_images public read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "product_images admin write" ON public.product_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- inquiries
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit inquiry" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- storage policies for the media bucket
CREATE POLICY "media read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "media admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "media admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));

-- seed categories
INSERT INTO public.categories (name, slug, icon, description) VALUES
 ('Mobile Accessories','mobile-accessories','Smartphone','Cases, holders, screen protection and more'),
 ('Chargers & Cables','chargers-cables','Cable','Fast chargers, GaN adapters and durable cables'),
 ('Power Banks','power-banks','BatteryCharging','High capacity portable power'),
 ('Earbuds & Headphones','earbuds-headphones','Headphones','TWS earbuds, ANC headphones and gaming audio'),
 ('Action Camera Gear','action-camera-gear','Camera','GoPro and action camera accessories'),
 ('Bike Accessories','bike-accessories','Bike','Mobile holders, helmet mounts and rider gear'),
 ('Bags & Cases','bags-cases','Backpack','Carry bags, travel cases and organizers'),
 ('Tripods & Mounts','tripods-mounts','Aperture','Tripods, gimbals and mounting solutions'),
 ('Memory Cards','memory-cards','MemoryStick','High speed microSD and SD storage'),
 ('Adapters & Converters','adapters-converters','Plug','Hubs, converters and dongles');

-- seed brands
INSERT INTO public.brands (name, slug) VALUES
 ('Anker','anker'),('Baseus','baseus'),('GoPro','gopro'),('Insta360','insta360'),
 ('JBL','jbl'),('SanDisk','sandisk'),('Ugreen','ugreen'),('Rockbros','rockbros'),
 ('Joyroom','joyroom'),('Samsung','samsung');

-- seed products
INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, specifications, price, featured, active)
SELECT p.name, p.slug, b.id, c.id, p.short_desc, p.descr, p.specs::jsonb, p.price, p.featured, true
FROM (VALUES
 ('Anker 737 Power Bank 24000mAh','anker-737-power-bank','anker','power-banks','140W output PowerCore with smart display','A travel-ready 24,000mAh PowerCore with 140W bi-directional charging and a live smart display for battery health, temperature and power output.','{"Capacity":"24000mAh","Output":"140W max","Ports":"2x USB-C, 1x USB-A","Display":"Smart digital","Warranty":"18 months"}',189.00,true),
 ('Baseus GaN5 Pro 65W Charger','baseus-gan5-pro-65w','baseus','chargers-cables','Compact 3-port GaN fast charger','Charge a laptop, tablet and phone at once from one wall socket. GaN5 technology keeps it 40% smaller than standard 65W bricks.','{"Power":"65W","Ports":"2x USB-C, 1x USB-A","Tech":"GaN5","Protection":"Multi-layer safety","Warranty":"12 months"}',49.00,true),
 ('GoPro HERO Adventure Mount Kit','gopro-hero-adventure-mount-kit','gopro','action-camera-gear','Complete mounting kit for riders','Everything you need to mount a HERO camera to a helmet, handlebar or chest harness. Includes adhesive mounts, buckles and a tether set.','{"Includes":"9 pieces","Compatibility":"HERO 9-13","Material":"Reinforced polymer","Waterproof":"Yes"}',79.00,true),
 ('JBL Tune Beam 2 TWS Earbuds','jbl-tune-beam-2','jbl','earbuds-headphones','ANC earbuds with 48h playtime','True adaptive noise cancelling with JBL Pure Bass sound, 48 hours of total playtime and a comfortable stick design for all-day wear.','{"Playtime":"48 hours","ANC":"Adaptive","Bluetooth":"5.3","Water resistance":"IP54","Charging":"USB-C"}',99.00,true),
 ('SanDisk Extreme PRO microSD 256GB','sandisk-extreme-pro-microsd-256gb','sandisk','memory-cards','200MB/s A2 V30 card for 4K capture','Built for action cameras and drones with 200MB/s read speeds, 4K UHD ready V30 sustained write and a rugged, temperature-proof design.','{"Capacity":"256GB","Read":"200MB/s","Write":"140MB/s","Rating":"A2 V30 U3","Warranty":"Lifetime limited"}',59.00,false),
 ('Rockbros Bike Mobile Holder Pro','rockbros-bike-mobile-holder-pro','rockbros','bike-accessories','360 degree aluminium handlebar mount','Aircraft-grade aluminium bike mount with silicone shock damping and a 360 degree ball head. Fits phones from 4.7 to 7 inches.','{"Material":"Aluminium alloy","Rotation":"360 degrees","Fits":"4.7-7 inch phones","Mount":"Handlebar 22-32mm"}',34.00,true),
 ('Ugreen Revodok 8-in-1 USB-C Hub','ugreen-revodok-8-in-1-hub','ugreen','adapters-converters','HDMI 4K, SD, ethernet and PD passthrough','Expand one USB-C port into eight: 4K HDMI, gigabit ethernet, SD and microSD readers, three USB-A ports and 100W power delivery.','{"Ports":"8","HDMI":"4K@60Hz","Ethernet":"1Gbps","PD":"100W passthrough"}',69.00,false),
 ('Insta360 Invisible Selfie Stick','insta360-invisible-selfie-stick','insta360','tripods-mounts','114cm carbon-look extension pole','Disappears from 360 footage for true third-person shots. Extends to 114cm and folds down to fit in a jacket pocket.','{"Length":"23-114cm","Weight":"137g","Thread":"1/4 inch","Compatibility":"Insta360 / GoPro"}',29.00,false),
 ('Joyroom 100W Braided USB-C Cable','joyroom-100w-braided-usb-c-cable','joyroom','chargers-cables','2m nylon braided 100W PD cable','A 2 metre nylon braided cable rated for 100W power delivery and 480Mbps data, tested to 30,000 bends.','{"Length":"2m","Power":"100W","Data":"480Mbps","Build":"Nylon braided"}',19.00,false),
 ('Samsung Galaxy Rugged Case','samsung-galaxy-rugged-case','samsung','mobile-accessories','Military-grade drop protection','Dual-layer rugged case with raised camera lip, reinforced corners and a matte grip finish that resists fingerprints.','{"Protection":"MIL-STD 810G","Layers":"TPU + PC","Finish":"Matte","Wireless charging":"Supported"}',24.00,false),
 ('Travel Gadget Organizer Case','travel-gadget-organizer-case','baseus','bags-cases','Water resistant tech pouch','Keep cables, adapters, cards and earbuds sorted with elastic loops, mesh pockets and a water resistant shell.','{"Material":"Water resistant nylon","Size":"22 x 16 x 8cm","Pockets":"11","Zip":"YKK"}',27.00,false),
 ('Anker Helmet Action Mount','anker-helmet-action-mount','anker','bike-accessories','Low-profile helmet chin mount','A vibration-damped chin mount that keeps action footage stable at speed without adding bulk to your helmet.','{"Material":"Nylon composite","Fit":"Full face helmets","Weight":"48g","Mount":"Standard GoPro finger"}',39.00,false)
) AS p(name, slug, brand_slug, cat_slug, short_desc, descr, specs, price, featured)
JOIN public.brands b ON b.slug = p.brand_slug
JOIN public.categories c ON c.slug = p.cat_slug;