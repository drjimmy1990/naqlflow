-- ============================================================
-- NAQLFLOW v3 — Seed Data (Realistic Test Data)
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ═══════════════════════════════════════════
-- 1. DRIVERS (5 سائقين)
-- ═══════════════════════════════════════════

INSERT INTO drivers (employee_number, name, phone, is_active, national_id, national_id_expiry, license_number, license_expiry, aramco_card, aramco_card_expiry, transport_card, transport_card_expiry, general_rating, total_trips) VALUES
('EMP-001', 'محمد العتيبي', '0551234567', true, '1045678901', '2027-06-15', 'DL-98765', '2027-03-20', 'AR-1001', '2026-12-01', 'TR-5001', '2027-09-10', 4.5, 127),
('EMP-002', 'عبدالله الحربي', '0559876543', true, '1098765432', '2026-04-20', 'DL-87654', '2027-01-15', 'AR-1002', '2026-05-10', 'TR-5002', '2026-08-25', 4.2, 98),
('EMP-003', 'فهد القحطاني', '0553456789', true, '1034567890', '2028-02-10', 'DL-76543', '2028-06-30', 'AR-1003', '2027-04-15', 'TR-5003', '2027-11-20', 3.8, 65),
('EMP-004', 'سعد الغامدي', '0557654321', true, '1023456789', '2026-09-05', 'DL-65432', '2026-11-18', 'AR-1004', '2026-07-22', 'TR-5004', '2027-02-14', 4.0, 82),
('EMP-005', 'خالد الزهراني', '0552345678', false, '1012345678', '2025-12-01', 'DL-54321', '2025-10-10', 'AR-1005', '2025-08-30', 'TR-5005', '2026-01-05', 2.5, 15);

-- ═══════════════════════════════════════════
-- 2. VEHICLES (5 صهاريج)
-- ═══════════════════════════════════════════

INSERT INTO vehicles (tanker_number, plate_number, chassis_number, brand, model, manufacture_year, fuel_type_carried, tank_capacity_liters, is_active, driver_id, tracking_device_number, registration_number, registration_expiry, inspection_expiry, operating_card_number, operating_card_expiry) VALUES
('TK-101', 'أ ب د 1234', 'CH-ABC-001', 'مان', 'TGS 2020', 2020, 'benzene_91', 36000, true, (SELECT id FROM drivers WHERE employee_number = 'EMP-001'), 'GPS-001', 'REG-101', '2027-03-15', '2026-12-20', 'OPC-101', '2027-06-10'),
('TK-102', 'ه و ز 5678', 'CH-DEF-002', 'فولفو', 'FH16', 2021, 'benzene_95', 32000, true, (SELECT id FROM drivers WHERE employee_number = 'EMP-002'), 'GPS-002', 'REG-102', '2027-05-20', '2027-01-15', 'OPC-102', '2027-08-30'),
('TK-103', 'ح ط ي 9012', 'CH-GHI-003', 'سكانيا', 'R500', 2019, 'diesel', 36000, true, (SELECT id FROM drivers WHERE employee_number = 'EMP-003'), 'GPS-003', 'REG-103', '2026-08-10', '2026-06-01', 'OPC-103', '2026-11-25'),
('TK-104', 'ك ل م 3456', 'CH-JKL-004', 'مرسيدس', 'أكتروس', 2022, 'benzene_91', 20000, true, (SELECT id FROM drivers WHERE employee_number = 'EMP-004'), 'GPS-004', 'REG-104', '2028-01-01', '2027-07-20', 'OPC-104', '2028-04-15'),
('TK-105', 'ن س ع 7890', 'CH-MNO-005', 'مان', 'TGX 2018', 2018, 'kerosene', 22000, false, NULL, 'GPS-005', 'REG-105', '2025-11-30', '2025-09-15', 'OPC-105', '2025-12-31');

-- ═══════════════════════════════════════════
-- 3. CLIENTS (4 عملاء)
-- ═══════════════════════════════════════════

INSERT INTO clients (name, commercial_name, operation_type, is_active, cr_number, cr_expiry, notes) VALUES
('شركة ساسكو', 'SASCO', 'transport_and_sell', true, 'CR-1010101010', '2028-06-15', 'عميل رئيسي — عقد سنوي'),
('محطات الراجحي', 'الراجحي للمحروقات', 'transport', true, 'CR-2020202020', '2027-09-01', NULL),
('شركة نفط الجزيرة', 'JPC', 'transport_and_sell', true, 'CR-3030303030', '2027-12-20', 'عقد مؤقت — 6 أشهر'),
('مؤسسة الفارس', 'الفارس', 'transport', false, 'CR-4040404040', '2026-03-01', 'متوقف مؤقتاً — مشكلة مالية');

-- ═══════════════════════════════════════════
-- 4. CLIENT SITES (8 مواقع/محطات)
-- ═══════════════════════════════════════════

INSERT INTO client_sites (client_id, site_name, is_active, site_type, category, is_classified, region, city, detailed_address, base_transport_value) VALUES
-- ساسكو: 3 محطات
((SELECT id FROM clients WHERE name = 'شركة ساسكو'), 'محطة ساسكو — طريق الملك فهد', true, 'branch', 'أ', true, 'المدينة المنورة', 'المدينة المنورة', 'طريق الملك فهد، حي العزيزية', 850.00),
((SELECT id FROM clients WHERE name = 'شركة ساسكو'), 'محطة ساسكو — طريق الهجرة', true, 'branch', 'ب', false, 'المدينة المنورة', 'المدينة المنورة', 'طريق الهجرة، حي قباء', 750.00),
((SELECT id FROM clients WHERE name = 'شركة ساسكو'), 'إدارة ساسكو — الرياض', true, 'admin', NULL, false, 'الرياض', 'الرياض', 'طريق العليا، حي الورود', 0),
-- الراجحي: 2 محطة
((SELECT id FROM clients WHERE name = 'محطات الراجحي'), 'محطة الراجحي — حائل', true, 'branch', 'أ', true, 'حائل', 'حائل', 'شارع الملك عبدالعزيز', 1200.00),
((SELECT id FROM clients WHERE name = 'محطات الراجحي'), 'محطة الراجحي — بريدة', true, 'branch', 'ب', false, 'القصيم', 'بريدة', 'طريق الملك سعود', 1100.00),
-- نفط الجزيرة: 2 محطة
((SELECT id FROM clients WHERE name = 'شركة نفط الجزيرة'), 'محطة JPC — ينبع', true, 'branch', 'أ', true, 'المدينة المنورة', 'ينبع', 'طريق الميناء', 950.00),
((SELECT id FROM clients WHERE name = 'شركة نفط الجزيرة'), 'محطة JPC — العلا', true, 'branch', 'ج', false, 'المدينة المنورة', 'العلا', 'الطريق الرئيسي', 1400.00),
-- الفارس: 1 محطة
((SELECT id FROM clients WHERE name = 'مؤسسة الفارس'), 'محطة الفارس — المدينة', false, 'branch', 'ب', false, 'المدينة المنورة', 'المدينة المنورة', 'طريق أبو بكر الصديق', 800.00);

-- ═══════════════════════════════════════════
-- 5. SITE CONTACTS (10 جهات اتصال)
-- ═══════════════════════════════════════════

INSERT INTO site_contacts (site_id, name, job_title, phone, email) VALUES
((SELECT id FROM client_sites WHERE site_name = 'محطة ساسكو — طريق الملك فهد'), 'أحمد الشمري', 'مدير المحطة', '0561111111', 'ahmed@sasco.sa'),
((SELECT id FROM client_sites WHERE site_name = 'محطة ساسكو — طريق الملك فهد'), 'ناصر العنزي', 'عامل الاستلام', '0562222222', NULL),
((SELECT id FROM client_sites WHERE site_name = 'محطة ساسكو — طريق الهجرة'), 'تركي البلوي', 'مدير المحطة', '0563333333', 'turki@sasco.sa'),
((SELECT id FROM client_sites WHERE site_name = 'إدارة ساسكو — الرياض'), 'فيصل الدوسري', 'مدير المشتريات', '0564444444', 'faisal@sasco.sa'),
((SELECT id FROM client_sites WHERE site_name = 'محطة الراجحي — حائل'), 'بندر الرشيدي', 'مدير الفرع', '0565555555', 'bandar@rajhi-fuel.sa'),
((SELECT id FROM client_sites WHERE site_name = 'محطة الراجحي — حائل'), 'عمر المطيري', 'محاسب', '0566666666', NULL),
((SELECT id FROM client_sites WHERE site_name = 'محطة الراجحي — بريدة'), 'ماجد العتيبي', 'مدير المحطة', '0567777777', 'majed@rajhi-fuel.sa'),
((SELECT id FROM client_sites WHERE site_name = 'محطة JPC — ينبع'), 'حسن الجهني', 'مشرف', '0568888888', 'hassan@jpc.sa'),
((SELECT id FROM client_sites WHERE site_name = 'محطة JPC — العلا'), 'سلطان الحربي', 'مدير المحطة', '0569999999', 'sultan@jpc.sa'),
((SELECT id FROM client_sites WHERE site_name = 'محطة الفارس — المدينة'), 'رائد السبيعي', 'المسؤول', '0560000000', NULL);

-- ═══════════════════════════════════════════
-- 6. CLIENT BANKS (4 حسابات)
-- ═══════════════════════════════════════════

INSERT INTO client_banks (client_id, account_name, account_number, iban, bank_name) VALUES
((SELECT id FROM clients WHERE name = 'شركة ساسكو'), 'شركة ساسكو للمحروقات', '0108123456789', 'SA0380000000608010123456789', 'بنك الراجحي'),
((SELECT id FROM clients WHERE name = 'محطات الراجحي'), 'مؤسسة الراجحي للمحروقات', '0208987654321', 'SA5010000000208987654321001', 'البنك الأهلي السعودي'),
((SELECT id FROM clients WHERE name = 'شركة نفط الجزيرة'), 'شركة نفط الجزيرة', '0301112223334', 'SA7545000000301112223334001', 'بنك الإنماء'),
((SELECT id FROM clients WHERE name = 'مؤسسة الفارس'), 'مؤسسة الفارس التجارية', '0405556667778', 'SA9020000000405556667778001', 'بنك الرياض');

-- ═══════════════════════════════════════════
-- 7. PRICE LISTS (قائمة الأسعار المصفوفية)
-- ساسكو: 8 تسعيرات (91+95 × 20K+32K+36K + ديزل × 36K + كيروسين × 22K)
-- الراجحي: 4 تسعيرات
-- JPC: 4 تسعيرات
-- ═══════════════════════════════════════════

-- ساسكو
INSERT INTO price_lists (client_id, fuel_type_id, capacity_liters, liter_increase, total_price) VALUES
((SELECT id FROM clients WHERE name = 'شركة ساسكو'), (SELECT id FROM fuel_types WHERE category = 'benzene_91'), 20000, 0.045, 4500.00),
((SELECT id FROM clients WHERE name = 'شركة ساسكو'), (SELECT id FROM fuel_types WHERE category = 'benzene_91'), 32000, 0.042, 6800.00),
((SELECT id FROM clients WHERE name = 'شركة ساسكو'), (SELECT id FROM fuel_types WHERE category = 'benzene_91'), 36000, 0.040, 7400.00),
((SELECT id FROM clients WHERE name = 'شركة ساسكو'), (SELECT id FROM fuel_types WHERE category = 'benzene_95'), 20000, 0.055, 5200.00),
((SELECT id FROM clients WHERE name = 'شركة ساسكو'), (SELECT id FROM fuel_types WHERE category = 'benzene_95'), 32000, 0.051, 7800.00),
((SELECT id FROM clients WHERE name = 'شركة ساسكو'), (SELECT id FROM fuel_types WHERE category = 'benzene_95'), 36000, 0.048, 8500.00),
((SELECT id FROM clients WHERE name = 'شركة ساسكو'), (SELECT id FROM fuel_types WHERE category = 'diesel'), 36000, 0.035, 6200.00),
((SELECT id FROM clients WHERE name = 'شركة ساسكو'), (SELECT id FROM fuel_types WHERE category = 'kerosene'), 22000, 0.060, 5800.00),
-- الراجحي
((SELECT id FROM clients WHERE name = 'محطات الراجحي'), (SELECT id FROM fuel_types WHERE category = 'benzene_91'), 32000, 0.044, 7100.00),
((SELECT id FROM clients WHERE name = 'محطات الراجحي'), (SELECT id FROM fuel_types WHERE category = 'benzene_91'), 36000, 0.041, 7600.00),
((SELECT id FROM clients WHERE name = 'محطات الراجحي'), (SELECT id FROM fuel_types WHERE category = 'benzene_95'), 32000, 0.053, 8100.00),
((SELECT id FROM clients WHERE name = 'محطات الراجحي'), (SELECT id FROM fuel_types WHERE category = 'diesel'), 36000, 0.038, 6500.00),
-- JPC
((SELECT id FROM clients WHERE name = 'شركة نفط الجزيرة'), (SELECT id FROM fuel_types WHERE category = 'benzene_91'), 20000, 0.048, 4700.00),
((SELECT id FROM clients WHERE name = 'شركة نفط الجزيرة'), (SELECT id FROM fuel_types WHERE category = 'benzene_91'), 36000, 0.043, 7500.00),
((SELECT id FROM clients WHERE name = 'شركة نفط الجزيرة'), (SELECT id FROM fuel_types WHERE category = 'benzene_95'), 36000, 0.050, 8700.00),
((SELECT id FROM clients WHERE name = 'شركة نفط الجزيرة'), (SELECT id FROM fuel_types WHERE category = 'diesel'), 36000, 0.036, 6300.00);

-- ═══════════════════════════════════════════
-- 8. ORDERS (8 طلبات بحالات مختلفة)
-- ═══════════════════════════════════════════

INSERT INTO orders (order_number, source, status, client_id, site_id, driver_id, vehicle_id, fuel_type_id, quantity_liters, payment_method, unit_price, total_price) VALUES
-- مسودة
('ORD-2026-001', 'manual', 'draft',
  (SELECT id FROM clients WHERE name = 'شركة ساسكو'),
  (SELECT id FROM client_sites WHERE site_name = 'محطة ساسكو — طريق الملك فهد'),
  NULL, NULL,
  (SELECT id FROM fuel_types WHERE category = 'benzene_91'),
  36000, 'bank_transfer', NULL, NULL),
-- مراجعة مالية
('ORD-2026-002', 'whatsapp', 'pending_financial',
  (SELECT id FROM clients WHERE name = 'محطات الراجحي'),
  (SELECT id FROM client_sites WHERE site_name = 'محطة الراجحي — حائل'),
  (SELECT id FROM drivers WHERE employee_number = 'EMP-001'),
  (SELECT id FROM vehicles WHERE tanker_number = 'TK-101'),
  (SELECT id FROM fuel_types WHERE category = 'benzene_91'),
  36000, 'bank_transfer', 0.040, 7600.00),
-- معتمد مالياً
('ORD-2026-003', 'phone', 'financial_approved',
  (SELECT id FROM clients WHERE name = 'شركة ساسكو'),
  (SELECT id FROM client_sites WHERE site_name = 'محطة ساسكو — طريق الهجرة'),
  (SELECT id FROM drivers WHERE employee_number = 'EMP-002'),
  (SELECT id FROM vehicles WHERE tanker_number = 'TK-102'),
  (SELECT id FROM fuel_types WHERE category = 'benzene_95'),
  32000, 'credit', 0.051, 7800.00),
-- تحميل أرامكو
('ORD-2026-004', 'manual', 'aramco_loading',
  (SELECT id FROM clients WHERE name = 'شركة نفط الجزيرة'),
  (SELECT id FROM client_sites WHERE site_name = 'محطة JPC — ينبع'),
  (SELECT id FROM drivers WHERE employee_number = 'EMP-003'),
  (SELECT id FROM vehicles WHERE tanker_number = 'TK-103'),
  (SELECT id FROM fuel_types WHERE category = 'diesel'),
  36000, 'bank_transfer', 0.036, 6300.00),
-- في الطريق
('ORD-2026-005', 'manual', 'in_transit',
  (SELECT id FROM clients WHERE name = 'محطات الراجحي'),
  (SELECT id FROM client_sites WHERE site_name = 'محطة الراجحي — بريدة'),
  (SELECT id FROM drivers WHERE employee_number = 'EMP-004'),
  (SELECT id FROM vehicles WHERE tanker_number = 'TK-104'),
  (SELECT id FROM fuel_types WHERE category = 'benzene_91'),
  20000, 'cash', 0.044, 4500.00),
-- جاري التسليم
('ORD-2026-006', 'whatsapp', 'delivering',
  (SELECT id FROM clients WHERE name = 'شركة ساسكو'),
  (SELECT id FROM client_sites WHERE site_name = 'محطة ساسكو — طريق الملك فهد'),
  (SELECT id FROM drivers WHERE employee_number = 'EMP-001'),
  (SELECT id FROM vehicles WHERE tanker_number = 'TK-101'),
  (SELECT id FROM fuel_types WHERE category = 'benzene_91'),
  36000, 'bank_transfer', 0.040, 7400.00),
-- تم التسليم
('ORD-2026-007', 'phone', 'delivered',
  (SELECT id FROM clients WHERE name = 'شركة نفط الجزيرة'),
  (SELECT id FROM client_sites WHERE site_name = 'محطة JPC — العلا'),
  (SELECT id FROM drivers WHERE employee_number = 'EMP-003'),
  (SELECT id FROM vehicles WHERE tanker_number = 'TK-103'),
  (SELECT id FROM fuel_types WHERE category = 'benzene_91'),
  36000, 'credit', 0.043, 7500.00),
-- مُقفل
('ORD-2026-008', 'manual', 'closed',
  (SELECT id FROM clients WHERE name = 'محطات الراجحي'),
  (SELECT id FROM client_sites WHERE site_name = 'محطة الراجحي — حائل'),
  (SELECT id FROM drivers WHERE employee_number = 'EMP-002'),
  (SELECT id FROM vehicles WHERE tanker_number = 'TK-102'),
  (SELECT id FROM fuel_types WHERE category = 'benzene_95'),
  32000, 'bank_transfer', 0.053, 8100.00);

-- ═══════════════════════════════════════════
-- 9. ORDER LOGS (سجل تتبع — عيّنة)
-- ═══════════════════════════════════════════

INSERT INTO order_logs (order_id, from_status, to_status, changed_by, note) VALUES
((SELECT id FROM orders WHERE order_number = 'ORD-2026-008'), 'draft', 'pending_financial', 'admin', 'إرسال للمراجعة المالية'),
((SELECT id FROM orders WHERE order_number = 'ORD-2026-008'), 'pending_financial', 'financial_approved', 'admin', 'الموقف المالي سليم'),
((SELECT id FROM orders WHERE order_number = 'ORD-2026-008'), 'financial_approved', 'quantities_approved', 'admin', 'تعميد الكميات'),
((SELECT id FROM orders WHERE order_number = 'ORD-2026-008'), 'quantities_approved', 'aramco_loading', 'admin', 'أمر تحميل أرامكو'),
((SELECT id FROM orders WHERE order_number = 'ORD-2026-008'), 'aramco_loading', 'sealed', 'admin', 'تم الختم والتشميع'),
((SELECT id FROM orders WHERE order_number = 'ORD-2026-008'), 'sealed', 'in_transit', 'admin', 'بدء التوزيع'),
((SELECT id FROM orders WHERE order_number = 'ORD-2026-008'), 'in_transit', 'arrived', 'admin', 'وصل الموقع'),
((SELECT id FROM orders WHERE order_number = 'ORD-2026-008'), 'arrived', 'delivering', 'admin', 'بدء التسليم'),
((SELECT id FROM orders WHERE order_number = 'ORD-2026-008'), 'delivering', 'delivered', 'admin', 'تم التسليم — إثبات OTP'),
((SELECT id FROM orders WHERE order_number = 'ORD-2026-008'), 'delivered', 'closed', 'admin', 'إقفال + تقييم السائق 5/5');

-- ═══════════════════════════════════════════
-- 10. DELIVERY PROOFS (إثباتات — عيّنة)
-- ═══════════════════════════════════════════

INSERT INTO delivery_proofs (order_id, proof_type, verbal_note, gps_lat, gps_lng) VALUES
((SELECT id FROM orders WHERE order_number = 'ORD-2026-007'), 'verbal_approval', 'تم الموافقة شفوياً من مدير المحطة سلطان الحربي', 26.7056, 37.7205),
((SELECT id FROM orders WHERE order_number = 'ORD-2026-007'), 'otp', NULL, 26.7056, 37.7205),
((SELECT id FROM orders WHERE order_number = 'ORD-2026-008'), 'stamp_and_id', NULL, 24.4539, 39.6142),
((SELECT id FROM orders WHERE order_number = 'ORD-2026-008'), 'electronic_signature', NULL, 24.4539, 39.6142);

-- ✅ Seed complete!
-- 5 drivers, 5 vehicles, 4 clients, 8 sites, 10 contacts, 4 banks, 16 prices, 8 orders, 10 logs, 4 proofs
