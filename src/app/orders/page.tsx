"use client";

import { supabase } from "@/lib/supabase";
import type { Order, Client, ClientSite, Driver, Vehicle, FuelType, OrderStatus } from "@/lib/types";
import { STATUS_CONFIG, STATUS_FLOW, FUEL_LABELS } from "@/lib/types";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";

// ── Order Form Modal ──
function OrderForm({ order, clients, drivers, vehicles, fuelTypes, onSave, onCancel }: {
  order: Partial<Order> | null;
  clients: Client[];
  drivers: Driver[];
  vehicles: Vehicle[];
  fuelTypes: FuelType[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!order?.id;
  const [sites, setSites] = useState<ClientSite[]>([]);
  const [form, setForm] = useState({
    client_id: order?.client_id || "",
    site_id: order?.site_id || "",
    driver_id: order?.driver_id || "",
    vehicle_id: order?.vehicle_id || "",
    fuel_type_id: order?.fuel_type_id || "",
    source: order?.source || "manual",
    quantity_liters: order?.quantity_liters?.toString() || "",
    payment_method: order?.payment_method || "bank_transfer",
    notes: order?.financial_status_notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!form.client_id) { setSites([]); return; }
    supabase.from("client_sites").select("*").eq("client_id", form.client_id).order("site_name")
      .then(({ data }) => setSites((data as ClientSite[]) || []));
  }, [form.client_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id) { setError("العميل مطلوب"); return; }
    setSaving(true);
    const orderNumber = isEdit ? undefined : `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const payload = {
      ...(orderNumber ? { order_number: orderNumber } : {}),
      client_id: form.client_id,
      site_id: form.site_id || null,
      driver_id: form.driver_id || null,
      vehicle_id: form.vehicle_id || null,
      fuel_type_id: form.fuel_type_id || null,
      source: form.source,
      quantity_liters: form.quantity_liters ? parseInt(form.quantity_liters) : null,
      payment_method: form.payment_method,
      financial_status_notes: form.notes || null,
    };
    const { error: err } = isEdit
      ? await supabase.from("orders").update(payload).eq("id", order!.id)
      : await supabase.from("orders").insert(payload);
    if (err) { setError(err.message); setSaving(false); return; }
    onSave();
  };

  return (
    <>
      {/* Layer 1: Backdrop */}
      <div className="fixed inset-0 z-50 ani-fade" onClick={onCancel}
        style={{ background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} />
      {/* Layer 2: Form */}
      <div className="fixed inset-0 z-[60] flex items-start justify-center pt-8 pointer-events-none">
      <form onSubmit={handleSubmit}
        className="pointer-events-auto bg-white rounded-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto p-7 ani-scale"
        style={{ boxShadow: "var(--shadow-xl)" }}>
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
          {isEdit ? "تعديل طلب" : "إنشاء طلب جديد"}
        </h2>
        <p className="text-[13px] mb-5" style={{ color: "var(--text-muted)" }}>
          {isEdit ? "تعديل بيانات الطلب الحالي" : "أدخل بيانات الطلب الجديد"}
        </p>

        {error && <div className="p-3 rounded-xl mb-4 text-[12px] font-semibold" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>⚠️ {error}</div>}

        <div className="space-y-5">
          {/* Client + Site */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>العميل *</label>
              <select className="input-field" value={form.client_id} onChange={e => { set("client_id", e.target.value); set("site_id", ""); }} required>
                <option value="">— اختر العميل —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>الموقع / المحطة</label>
              <select className="input-field" value={form.site_id} onChange={e => set("site_id", e.target.value)} disabled={!form.client_id}>
                <option value="">— اختر الموقع —</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.site_name} — {s.city}</option>)}
              </select>
            </div>
          </div>

          {/* Fuel + Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>نوع الوقود</label>
              <select className="input-field" value={form.fuel_type_id} onChange={e => set("fuel_type_id", e.target.value)}>
                <option value="">— اختر —</option>
                {fuelTypes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>الكمية (لتر)</label>
              <input type="number" className="input-field" value={form.quantity_liters} onChange={e => set("quantity_liters", e.target.value)} dir="ltr" placeholder="36000" />
            </div>
          </div>

          {/* Driver + Vehicle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>السائق</label>
              <select className="input-field" value={form.driver_id} onChange={e => set("driver_id", e.target.value)}>
                <option value="">— اختر —</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>الصهريج</label>
              <select className="input-field" value={form.vehicle_id} onChange={e => set("vehicle_id", e.target.value)}>
                <option value="">— اختر —</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.tanker_number} ({(v.tank_capacity_liters / 1000).toFixed(0)}K)</option>)}
              </select>
            </div>
          </div>

          {/* Source + Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>مصدر الطلب</label>
              <select className="input-field" value={form.source} onChange={e => set("source", e.target.value)}>
                <option value="manual">يدوي</option><option value="whatsapp">واتساب</option>
                <option value="phone">هاتف</option><option value="website">موقع</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>طريقة الدفع</label>
              <select className="input-field" value={form.payment_method} onChange={e => set("payment_method", e.target.value)}>
                <option value="bank_transfer">تحويل بنكي</option><option value="cash">نقدي</option><option value="credit">آجل</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>ملاحظات</label>
            <textarea className="input-field" rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-5" style={{ borderTop: "1px solid rgba(194,198,214,0.15)" }}>
          <button type="button" onClick={onCancel} className="btn-ghost flex-1 py-3 rounded-xl text-[13px]">إلغاء</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 rounded-xl text-[13px] disabled:opacity-50">
            {saving ? "جاري الحفظ..." : isEdit ? "تحديث الطلب" : "✦ إنشاء الطلب"}
          </button>
        </div>
      </form>
      </div>
    </>
  );
}

// ── Main Page ──
export default function OrdersPage() {
  const [orders, setOrders] = useState<(Order & { client_name?: string; site_name?: string; driver_name?: string; fuel_name?: string })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchAll = async () => {
    setLoading(true);
    const [ordersRes, clientsRes, driversRes, vehiclesRes, fuelsRes, sitesRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("*").order("name"),
      supabase.from("drivers").select("*").eq("is_active", true).order("name"),
      supabase.from("vehicles").select("*").eq("is_active", true).order("tanker_number"),
      supabase.from("fuel_types").select("*").order("name"),
      supabase.from("client_sites").select("*"),
    ]);
    const clientMap = Object.fromEntries(((clientsRes.data || []) as Client[]).map(c => [c.id, c.name]));
    const siteMap = Object.fromEntries(((sitesRes.data || []) as ClientSite[]).map(s => [s.id, s.site_name]));
    const driverMap = Object.fromEntries(((driversRes.data || []) as Driver[]).map(d => [d.id, d.name]));
    const fuelMap = Object.fromEntries(((fuelsRes.data || []) as FuelType[]).map(f => [f.id, f.name]));
    const enriched = ((ordersRes.data || []) as Order[]).map(o => ({
      ...o,
      client_name: clientMap[o.client_id] || "—",
      site_name: o.site_id ? siteMap[o.site_id] : "—",
      driver_name: o.driver_id ? driverMap[o.driver_id] : "—",
      fuel_name: o.fuel_type_id ? fuelMap[o.fuel_type_id] : "—",
    }));
    setOrders(enriched);
    setClients((clientsRes.data as Client[]) || []);
    setDrivers((driversRes.data as Driver[]) || []);
    setVehicles((vehiclesRes.data as Vehicle[]) || []);
    setFuelTypes((fuelsRes.data as FuelType[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const advanceStatus = async (order: Order) => {
    const config = STATUS_CONFIG[order.status];
    if (!config.next) return;
    const nextStatus = config.next;
    await supabase.from("order_logs").insert({ order_id: order.id, from_status: order.status, to_status: nextStatus, changed_by: "admin" });
    await supabase.from("orders").update({ status: nextStatus, ...(nextStatus === "closed" ? { closed_at: new Date().toISOString() } : {}) }).eq("id", order.id);
    fetchAll();
  };

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`حذف الطلب "${num}"؟`)) return;
    await supabase.from("orders").delete().eq("id", id);
    fetchAll();
  };

  const filtered = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);
  const statusCounts: Record<string, number> = {};
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  return (
    <div className="ani-page">
      <PageHeader title="إدارة الطلبات" subtitle={`${orders.length} طلب`}
        action={
          <button onClick={() => { setEditOrder(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-[13px]">
            <span className="text-lg leading-none">+</span> طلب جديد
          </button>
        } />

      <div className="p-8">
        {/* Status Filter — Horizontal Scroll */}
        <div className="flex gap-2 mb-6 flex-wrap ani-up">
          <button onClick={() => setStatusFilter("all")}
            className="px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-200"
            style={{
              background: statusFilter === "all" ? "linear-gradient(135deg, var(--primary), var(--primary-container))" : "var(--surface-card)",
              color: statusFilter === "all" ? "#fff" : "var(--text-secondary)",
              boxShadow: statusFilter === "all" ? "0 3px 12px rgba(0,88,190,0.25)" : "var(--shadow-sm)",
              border: statusFilter === "all" ? "none" : "1px solid rgba(194,198,214,0.12)",
            }}>
            الكل ({orders.length})
          </button>
          {STATUS_FLOW.map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = statusCounts[s] || 0;
            const isActive = statusFilter === s;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 flex items-center gap-1.5"
                style={{
                  background: isActive ? cfg.color : "var(--surface-card)",
                  color: isActive ? "#fff" : cfg.color,
                  boxShadow: isActive ? `0 3px 12px ${cfg.color}40` : "var(--shadow-sm)",
                  border: isActive ? "none" : "1px solid rgba(194,198,214,0.12)",
                }}>
                <span className="text-[13px]">{cfg.icon}</span>
                {cfg.label}
                {count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.25)" : `${cfg.color}15`,
                      color: isActive ? "#fff" : cfg.color,
                    }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden ani-up">
          {loading ? (
            <div className="text-center py-20 animate-pulse" style={{ color: "var(--text-faint)" }}>
              <div className="text-3xl mb-3">📋</div>جاري التحميل...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-3 opacity-50">📋</div>
              <p className="text-[14px] font-bold" style={{ color: "var(--text-muted)" }}>لا توجد طلبات</p>
              <p className="text-[12px] mt-1" style={{ color: "var(--text-faint)" }}>جرّب تغيير الفلتر أو أنشئ طلب جديد</p>
            </div>
          ) : (
            <table className="table-premium">
              <thead>
                <tr>
                  {["رقم الطلب", "العميل", "الموقع", "السائق", "الوقود", "الكمية", "الحالة", "الإجراءات"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="stg">
                {filtered.map(o => {
                  const nextAction = STATUS_CONFIG[o.status];
                  return (
                    <tr key={o.id}>
                      <td>
                        <span className="data-number text-[13px] font-bold" style={{ color: "var(--primary)" }}>
                          {o.order_number}
                        </span>
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)", fontFamily: "var(--font-data)" }}>
                          {new Date(o.created_at).toLocaleDateString("ar-SA")}
                        </div>
                      </td>
                      <td className="font-semibold text-[13px]">{o.client_name}</td>
                      <td className="text-[12px]" style={{ color: "var(--text-muted)" }}>{o.site_name}</td>
                      <td className="text-[12px]">{o.driver_name}</td>
                      <td className="text-[12px]">{o.fuel_name}</td>
                      <td>
                        <span className="data-number text-[13px] font-bold">
                          {o.quantity_liters ? `${(o.quantity_liters / 1000).toFixed(0)}K L` : "—"}
                        </span>
                      </td>
                      <td><StatusBadge status={o.status} size="sm" /></td>
                      <td>
                        <div className="flex gap-1.5 items-center">
                          {nextAction.action && (
                            <button onClick={() => advanceStatus(o)}
                              className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                              style={{
                                background: `linear-gradient(135deg, ${nextAction.next ? STATUS_CONFIG[nextAction.next].color : "var(--primary)"}15, ${nextAction.next ? STATUS_CONFIG[nextAction.next].color : "var(--primary)"}08)`,
                                color: nextAction.next ? STATUS_CONFIG[nextAction.next].color : "var(--primary)",
                                border: `1px solid ${nextAction.next ? STATUS_CONFIG[nextAction.next].color : "var(--primary)"}20`,
                              }}>
                              {nextAction.action} ←
                            </button>
                          )}
                          <button onClick={() => { setEditOrder(o); setShowForm(true); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] transition-all duration-150"
                            style={{ background: "var(--surface-low)", color: "var(--text-muted)" }}
                            onMouseEnter={(e) => { (e.currentTarget).style.background = "var(--primary-fixed)"; (e.currentTarget).style.color = "var(--primary)"; }}
                            onMouseLeave={(e) => { (e.currentTarget).style.background = "var(--surface-low)"; (e.currentTarget).style.color = "var(--text-muted)"; }}>
                            ✏️
                          </button>
                          <button onClick={() => handleDelete(o.id, o.order_number)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] transition-all duration-150"
                            style={{ background: "var(--surface-low)", color: "var(--text-muted)" }}
                            onMouseEnter={(e) => { (e.currentTarget).style.background = "var(--danger-bg)"; (e.currentTarget).style.color = "var(--danger)"; }}
                            onMouseLeave={(e) => { (e.currentTarget).style.background = "var(--surface-low)"; (e.currentTarget).style.color = "var(--text-muted)"; }}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <OrderForm order={editOrder} clients={clients} drivers={drivers} vehicles={vehicles} fuelTypes={fuelTypes}
          onCancel={() => setShowForm(false)} onSave={() => { setShowForm(false); fetchAll(); }} />
      )}
    </div>
  );
}
