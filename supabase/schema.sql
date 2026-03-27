-- ============================================================
-- NAQLFLOW v3 — Full Database Schema
-- Target: Supabase (PostgreSQL)
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ═══════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════

CREATE TYPE operation_type AS ENUM ('transport', 'transport_and_sell');
CREATE TYPE site_type AS ENUM ('admin', 'branch');
CREATE TYPE fuel_category AS ENUM ('benzene_91', 'benzene_95', 'benzene_98', 'diesel', 'kerosene');
CREATE TYPE order_status AS ENUM (
  'draft', 'pending_financial', 'financial_approved', 'suspended', 'rejected',
  'quantities_approved', 'aramco_loading', 'sealed',
  'in_transit', 'arrived', 'delivering', 'delivered', 'closed', 'cancelled'
);
CREATE TYPE order_source AS ENUM ('whatsapp', 'phone', 'website', 'manual');
CREATE TYPE proof_type AS ENUM ('verbal_approval', 'stamp_and_id', 'otp', 'electronic_signature', 'truck_photo');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'credit');

-- ═══════════════════════════════════════════
-- 1. DRIVERS (السائقين)
-- ═══════════════════════════════════════════

CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  -- الهوية / الإقامة
  national_id TEXT,
  national_id_expiry DATE,
  national_id_img TEXT,
  -- الجواز
  passport_number TEXT,
  passport_expiry DATE,
  passport_img TEXT,
  -- الرخصة
  license_number TEXT,
  license_expiry DATE,
  license_img TEXT,
  -- كرت أرامكو
  aramco_card TEXT,
  aramco_card_expiry DATE,
  aramco_card_img TEXT,
  -- كرت وزارة النقل
  transport_card TEXT,
  transport_card_expiry DATE,
  transport_card_img TEXT,
  -- Performance
  general_rating NUMERIC(3,2) DEFAULT 0,
  total_trips INTEGER DEFAULT 0,
  bonus NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- 2. VEHICLES (الصهاريج / الراس)
-- ═══════════════════════════════════════════

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanker_number TEXT UNIQUE NOT NULL,
  plate_number TEXT,
  chassis_number TEXT UNIQUE,
  brand TEXT,
  model TEXT,
  manufacture_year SMALLINT,
  fuel_type_carried fuel_category,
  tank_capacity_liters INTEGER NOT NULL,
  tank_img TEXT,
  is_active BOOLEAN DEFAULT true,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  -- Tracking
  tracking_device_number TEXT,
  tracking_link TEXT,
  last_maintenance_date DATE,
  -- الاستمارة
  registration_number TEXT,
  registration_expiry DATE,
  registration_img TEXT,
  -- الفحص الدوري
  inspection_expiry DATE,
  inspection_img TEXT,
  -- كرت التشغيل
  operating_card_number TEXT,
  operating_card_expiry DATE,
  operating_card_img TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- 3. CLIENTS (العملاء)
-- ═══════════════════════════════════════════

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  commercial_name TEXT,
  operation_type operation_type DEFAULT 'transport',
  is_active BOOLEAN DEFAULT true,
  cr_number TEXT,
  cr_expiry DATE,
  registration_date DATE DEFAULT CURRENT_DATE,
  bonus NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- 4. CLIENT SITES (مواقع العميل / المحطات)
-- ═══════════════════════════════════════════

CREATE TABLE client_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  site_type site_type DEFAULT 'branch',
  category TEXT,
  is_classified BOOLEAN DEFAULT false,
  region TEXT,
  city TEXT,
  detailed_address TEXT,
  coordinates_url TEXT,
  base_transport_value NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- 5. SITE CONTACTS (جهات اتصال المحطة)
-- ═══════════════════════════════════════════

CREATE TABLE site_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES client_sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  job_title TEXT,
  phone TEXT,
  email TEXT
);

-- ═══════════════════════════════════════════
-- 6. CLIENT BANKS (البنوك)
-- ═══════════════════════════════════════════

CREATE TABLE client_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  account_name TEXT,
  account_number TEXT,
  iban TEXT,
  bank_name TEXT
);

-- ═══════════════════════════════════════════
-- 7. FUEL TYPES (الأصناف)
-- ═══════════════════════════════════════════

CREATE TABLE fuel_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category fuel_category UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  base_sell_transport_price NUMERIC(10,2),
  base_transport_only_price NUMERIC(10,2)
);

-- Seed fuel types
INSERT INTO fuel_types (name, category) VALUES
  ('بنزين 91', 'benzene_91'),
  ('بنزين 95', 'benzene_95'),
  ('بنزين 98', 'benzene_98'),
  ('ديزل', 'diesel'),
  ('كيروسين', 'kerosene');

-- ═══════════════════════════════════════════
-- 8. PRICE LISTS (قوائم الأسعار المصفوفية)
-- عميل × صنف × حجم = سعر
-- ═══════════════════════════════════════════

CREATE TABLE price_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  fuel_type_id UUID NOT NULL REFERENCES fuel_types(id),
  capacity_liters INTEGER NOT NULL,
  liter_increase NUMERIC(6,3),
  total_price NUMERIC(10,2) NOT NULL,
  effective_date DATE DEFAULT CURRENT_DATE,
  UNIQUE (client_id, fuel_type_id, capacity_liters)
);

-- ═══════════════════════════════════════════
-- 9. ORDERS (الطلبات)
-- ═══════════════════════════════════════════

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  source order_source DEFAULT 'manual',
  status order_status DEFAULT 'draft',
  -- Relations
  client_id UUID NOT NULL REFERENCES clients(id),
  site_id UUID REFERENCES client_sites(id),
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  price_list_id UUID REFERENCES price_lists(id),
  fuel_type_id UUID REFERENCES fuel_types(id),
  -- Quantity
  quantity_liters INTEGER,
  -- Financial
  payment_method payment_method DEFAULT 'bank_transfer',
  unit_price NUMERIC(10,2),
  total_price NUMERIC(10,2),
  cash_amount_due NUMERIC(10,2),
  financial_status_notes TEXT,
  -- Aramco & Sealing
  aramco_loading_order TEXT,
  seal_number TEXT,
  distribution_order_ref TEXT,
  -- Evaluation
  driver_rating SMALLINT CHECK (driver_rating BETWEEN 1 AND 5),
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════
-- 10. DELIVERY PROOFS (إثباتات التسليم)
-- ═══════════════════════════════════════════

CREATE TABLE delivery_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  proof_type proof_type NOT NULL,
  image_url TEXT,
  otp_code TEXT,
  otp_verified_at TIMESTAMPTZ,
  signature_url TEXT,
  verbal_note TEXT,
  gps_lat NUMERIC(10,7),
  gps_lng NUMERIC(10,7),
  captured_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- 11. ORDER LOGS (سجل تغييرات الحالة)
-- ═══════════════════════════════════════════

CREATE TABLE order_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status order_status NOT NULL,
  changed_by TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- TRIGGERS: Auto-update updated_at
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_drivers_ts BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_vehicles_ts BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_orders_ts BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ═══════════════════════════════════════════
-- INDEXES for performance
-- ═══════════════════════════════════════════

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_driver ON orders(driver_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_price_lookup ON price_lists(client_id, fuel_type_id, capacity_liters);
CREATE INDEX idx_client_sites_client ON client_sites(client_id);
CREATE INDEX idx_delivery_proofs_order ON delivery_proofs(order_id);
CREATE INDEX idx_order_logs_order ON order_logs(order_id);

-- ═══════════════════════════════════════════
-- RLS POLICIES (enable after setting up auth)
-- ═══════════════════════════════════════════

-- ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- (Add policies per role: admin, driver, readonly)
