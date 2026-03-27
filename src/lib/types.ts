// Database types matching our Supabase schema

export type OperationType = "transport" | "transport_and_sell";
export type SiteType = "admin" | "branch";
export type FuelCategory = "benzene_91" | "benzene_95" | "benzene_98" | "diesel" | "kerosene";
export type OrderStatus =
  | "draft" | "pending_financial" | "financial_approved" | "suspended" | "rejected"
  | "quantities_approved" | "aramco_loading" | "sealed"
  | "in_transit" | "arrived" | "delivering" | "delivered" | "closed" | "cancelled";
export type OrderSource = "whatsapp" | "phone" | "website" | "manual";
export type ProofType = "verbal_approval" | "stamp_and_id" | "otp" | "electronic_signature" | "truck_photo";
export type PaymentMethod = "cash" | "bank_transfer" | "credit";

// ── Status UI Config ──
export const STATUS_CONFIG: Record<OrderStatus, {
  label: string; color: string; bg: string; icon: string; next: OrderStatus | null; action: string | null;
}> = {
  draft:               { label: "مسودة",           color: "#94A3B8", bg: "#F1F5F9",  icon: "📝", next: "pending_financial", action: "إرسال للمراجعة" },
  pending_financial:   { label: "مراجعة مالية",    color: "#F59E0B", bg: "#FEF3C7",  icon: "⏳", next: "financial_approved", action: "موافقة مالية" },
  financial_approved:  { label: "معتمد مالياً",    color: "#2563EB", bg: "#EFF6FF",  icon: "✔️", next: "quantities_approved", action: "تعميد الكميات" },
  suspended:           { label: "معلّق",           color: "#EA580C", bg: "#FFF7ED",  icon: "⏸️", next: "pending_financial", action: "إعادة مراجعة" },
  rejected:            { label: "مرفوض",           color: "#DC2626", bg: "#FEE2E2",  icon: "❌", next: null, action: null },
  quantities_approved: { label: "كميات معتمدة",    color: "#7C3AED", bg: "#EDE9FE",  icon: "📦", next: "aramco_loading", action: "أمر تحميل" },
  aramco_loading:      { label: "تحميل أرامكو",    color: "#0891B2", bg: "#CFFAFE",  icon: "🏭", next: "sealed", action: "ختم وتشميع" },
  sealed:              { label: "مُختوم",          color: "#059669", bg: "#D1FAE5",  icon: "🔏", next: "in_transit", action: "بدء التوزيع" },
  in_transit:          { label: "في الطريق",       color: "#1E40AF", bg: "#DBEAFE",  icon: "🚚", next: "arrived", action: "وصل الموقع" },
  arrived:             { label: "وصل الموقع",      color: "#0D9488", bg: "#CCFBF1",  icon: "📍", next: "delivering", action: "بدء التسليم" },
  delivering:          { label: "جاري التسليم",    color: "#9333EA", bg: "#F3E8FF",  icon: "🤝", next: "delivered", action: "تأكيد التسليم" },
  delivered:           { label: "تم التسليم",      color: "#16A34A", bg: "#DCFCE7",  icon: "✅", next: "closed", action: "إقفال الطلب" },
  closed:              { label: "مُقفل",          color: "#374151", bg: "#F3F4F6",  icon: "🔒", next: null, action: null },
  cancelled:           { label: "ملغي",           color: "#991B1B", bg: "#FEE2E2",  icon: "🚫", next: null, action: null },
};

export const STATUS_FLOW: OrderStatus[] = [
  "draft", "pending_financial", "financial_approved", "quantities_approved",
  "aramco_loading", "sealed", "in_transit", "arrived", "delivering", "delivered", "closed"
];

// ── Fuel Type Labels ──
export const FUEL_LABELS: Record<FuelCategory, string> = {
  benzene_91: "بنزين 91",
  benzene_95: "بنزين 95",
  benzene_98: "بنزين 98",
  diesel: "ديزل",
  kerosene: "كيروسين",
};

// ── Table Types ──

export interface Driver {
  id: string;
  employee_number: string;
  name: string;
  phone: string | null;
  is_active: boolean;
  national_id: string | null;
  national_id_expiry: string | null;
  national_id_img: string | null;
  passport_number: string | null;
  passport_expiry: string | null;
  passport_img: string | null;
  license_number: string | null;
  license_expiry: string | null;
  license_img: string | null;
  aramco_card: string | null;
  aramco_card_expiry: string | null;
  aramco_card_img: string | null;
  transport_card: string | null;
  transport_card_expiry: string | null;
  transport_card_img: string | null;
  general_rating: number;
  total_trips: number;
  bonus: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  tanker_number: string;
  plate_number: string | null;
  chassis_number: string | null;
  brand: string | null;
  model: string | null;
  manufacture_year: number | null;
  fuel_type_carried: FuelCategory | null;
  tank_capacity_liters: number;
  tank_img: string | null;
  is_active: boolean;
  driver_id: string | null;
  tracking_device_number: string | null;
  tracking_link: string | null;
  last_maintenance_date: string | null;
  registration_number: string | null;
  registration_expiry: string | null;
  registration_img: string | null;
  inspection_expiry: string | null;
  inspection_img: string | null;
  operating_card_number: string | null;
  operating_card_expiry: string | null;
  operating_card_img: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  commercial_name: string | null;
  operation_type: OperationType;
  is_active: boolean;
  cr_number: string | null;
  cr_expiry: string | null;
  registration_date: string;
  bonus: number;
  notes: string | null;
  created_at: string;
}

export interface ClientSite {
  id: string;
  client_id: string;
  site_name: string;
  is_active: boolean;
  site_type: SiteType;
  category: string | null;
  is_classified: boolean;
  region: string | null;
  city: string | null;
  detailed_address: string | null;
  coordinates_url: string | null;
  base_transport_value: number;
  notes: string | null;
  created_at: string;
}

export interface SiteContact {
  id: string;
  site_id: string;
  name: string;
  job_title: string | null;
  phone: string | null;
  email: string | null;
}

export interface ClientBank {
  id: string;
  client_id: string;
  account_name: string | null;
  account_number: string | null;
  iban: string | null;
  bank_name: string | null;
}

export interface FuelType {
  id: string;
  name: string;
  category: FuelCategory;
  is_active: boolean;
  base_sell_transport_price: number | null;
  base_transport_only_price: number | null;
}

export interface PriceList {
  id: string;
  client_id: string;
  fuel_type_id: string;
  capacity_liters: number;
  liter_increase: number | null;
  total_price: number;
  effective_date: string;
}

export interface Order {
  id: string;
  order_number: string;
  source: OrderSource;
  status: OrderStatus;
  client_id: string;
  site_id: string | null;
  driver_id: string | null;
  vehicle_id: string | null;
  price_list_id: string | null;
  fuel_type_id: string | null;
  quantity_liters: number | null;
  payment_method: PaymentMethod;
  unit_price: number | null;
  total_price: number | null;
  cash_amount_due: number | null;
  financial_status_notes: string | null;
  aramco_loading_order: string | null;
  seal_number: string | null;
  distribution_order_ref: string | null;
  driver_rating: number | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface DeliveryProof {
  id: string;
  order_id: string;
  proof_type: ProofType;
  image_url: string | null;
  otp_code: string | null;
  otp_verified_at: string | null;
  signature_url: string | null;
  verbal_note: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  captured_at: string;
}

export interface OrderLog {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}
