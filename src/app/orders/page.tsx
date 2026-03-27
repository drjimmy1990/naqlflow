"use client";

import { supabase } from "@/lib/supabase";
import type { Order, Client, ClientSite, Driver, Vehicle, FuelType, OrderStatus } from "@/lib/types";
import { STATUS_CONFIG, STATUS_FLOW, FUEL_LABELS } from "@/lib/types";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";

// ── Order Form ──
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
  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm";
  const labelClass = "text-xs font-semibold text-slate-600 mb-1 block";

  // Load sites when client changes
  useEffect(() => {
    if (!form.client_id) { setSites([]); return; }
    supabase.from("client_sites").select("*").eq("client_id", form.client_id).order("site_name")
      .then(({ data }) => setSites((data as ClientSite[]) || []));
  }, [form.client_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id) { setError("العميل مطلوب"); return; }
    setSaving(true);

    // Generate order number
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 ani-fade" onClick={onCancel}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[88vh] overflow-y-auto p-6 ani-scale">
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          {isEdit ? "تعديل طلب" : "إنشاء طلب جديد"}
        </h2>
        {error && <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg mb-3 font-semibold">{error}</div>}

        <div className="space-y-4">
          {/* Client + Site */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>العميل *</label>
              <select className={inputClass} value={form.client_id} onChange={e => { set("client_id", e.target.value); set("site_id", ""); }} required>
                <option value="">— اختر العميل —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>الموقع / المحطة</label>
              <select className={inputClass} value={form.site_id} onChange={e => set("site_id", e.target.value)} disabled={!form.client_id}>
                <option value="">— اختر الموقع —</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.site_name} — {s.city}</option>)}
              </select>
            </div>
          </div>

          {/* Fuel + Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>نوع الوقود</label>
              <select className={inputClass} value={form.fuel_type_id} onChange={e => set("fuel_type_id", e.target.value)}>
                <option value="">— اختر —</option>
                {fuelTypes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>الكمية (لتر)</label><input type="number" className={inputClass} value={form.quantity_liters} onChange={e => set("quantity_liters", e.target.value)} dir="ltr" /></div>
          </div>

          {/* Driver + Vehicle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>السائق</label>
              <select className={inputClass} value={form.driver_id} onChange={e => set("driver_id", e.target.value)}>
                <option value="">— اختر —</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>الصهريج</label>
              <select className={inputClass} value={form.vehicle_id} onChange={e => set("vehicle_id", e.target.value)}>
                <option value="">— اختر —</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.tanker_number} ({(v.tank_capacity_liters / 1000).toFixed(0)}K)</option>)}
              </select>
            </div>
          </div>

          {/* Source + Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>مصدر الطلب</label>
              <select className={inputClass} value={form.source} onChange={e => set("source", e.target.value)}>
                <option value="manual">يدوي</option><option value="whatsapp">واتساب</option>
                <option value="phone">هاتف</option><option value="website">موقع</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>طريقة الدفع</label>
              <select className={inputClass} value={form.payment_method} onChange={e => set("payment_method", e.target.value)}>
                <option value="bank_transfer">تحويل بنكي</option><option value="cash">نقدي</option><option value="credit">آجل</option>
              </select>
            </div>
          </div>

          <div><label className={labelClass}>ملاحظات</label><textarea className={inputClass} rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
        </div>

        <div className="flex gap-3 mt-5 pt-4 border-t">
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200">إلغاء</button>
          <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white disabled:opacity-50">
            {saving ? "..." : isEdit ? "تحديث" : "إنشاء الطلب"}
          </button>
        </div>
      </form>
    </div>
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

  // ── State Machine: advance to next status ──
  const advanceStatus = async (order: Order) => {
    const config = STATUS_CONFIG[order.status];
    if (!config.next) return;
    const nextStatus = config.next;

    // Insert log
    await supabase.from("order_logs").insert({
      order_id: order.id,
      from_status: order.status,
      to_status: nextStatus,
      changed_by: "admin",
    });

    // Update order
    await supabase.from("orders").update({
      status: nextStatus,
      ...(nextStatus === "closed" ? { closed_at: new Date().toISOString() } : {}),
    }).eq("id", order.id);

    fetchAll();
  };

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`حذف الطلب "${num}"؟`)) return;
    await supabase.from("orders").delete().eq("id", id);
    fetchAll();
  };

  const filtered = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);

  // Count per status
  const statusCounts: Record<string, number> = {};
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  return (
    <div className="ani-page">
      <PageHeader title="إدارة الطلبات" subtitle={`${orders.length} طلب`}
        action={<button onClick={() => { setEditOrder(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700">+ طلب جديد</button>} />

      <div className="p-6">
        {/* Status Filter */}
        <div className="flex gap-1.5 mb-4 flex-wrap ani-up">
          <button onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${statusFilter === "all" ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}>
            الكل ({orders.length})
          </button>
          {STATUS_FLOW.map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = statusCounts[s] || 0;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${statusFilter === s ? "" : "bg-white border border-slate-200 hover:border-slate-300"}`}
                style={statusFilter === s ? { background: cfg.color, color: "#fff" } : { color: cfg.color }}>
                {cfg.icon} {cfg.label} {count > 0 ? `(${count})` : ""}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden ani-up">
          {loading ? (
            <div className="text-center py-20 text-slate-400 animate-pulse">⏳ جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-sm font-medium">لا توجد طلبات</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["الطلب", "العميل", "الموقع", "السائق", "الوقود", "الكمية", "الحالة", "الإجراء"].map(h => (
                    <th key={h} className="p-3 text-right border-b-2 border-slate-100 text-slate-400 text-[10.5px] font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="stg">
                {filtered.map(o => {
                  const nextAction = STATUS_CONFIG[o.status];
                  return (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 border-b border-slate-100">
                        <span className="font-bold text-xs text-blue-600" style={{ fontFamily: "var(--font-display)" }}>{o.order_number}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{new Date(o.created_at).toLocaleDateString("ar-SA")}</div>
                      </td>
                      <td className="p-3 border-b border-slate-100 text-xs font-semibold">{o.client_name}</td>
                      <td className="p-3 border-b border-slate-100 text-xs text-slate-500">{o.site_name}</td>
                      <td className="p-3 border-b border-slate-100 text-xs">{o.driver_name}</td>
                      <td className="p-3 border-b border-slate-100 text-xs">{o.fuel_name}</td>
                      <td className="p-3 border-b border-slate-100 text-xs font-semibold" dir="ltr">
                        {o.quantity_liters ? `${o.quantity_liters.toLocaleString()} L` : "—"}
                      </td>
                      <td className="p-3 border-b border-slate-100"><StatusBadge status={o.status} /></td>
                      <td className="p-3 border-b border-slate-100">
                        <div className="flex gap-1 flex-wrap">
                          {nextAction.action && (
                            <button onClick={() => advanceStatus(o)}
                              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                              style={{ background: nextAction.next ? STATUS_CONFIG[nextAction.next].bg : "#EFF6FF", color: nextAction.next ? STATUS_CONFIG[nextAction.next].color : "#2563EB" }}>
                              ← {nextAction.action}
                            </button>
                          )}
                          <button onClick={() => { setEditOrder(o); setShowForm(true); }}
                            className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded hover:bg-slate-100">✏️</button>
                          <button onClick={() => handleDelete(o.id, o.order_number)}
                            className="text-[10px] text-red-500 bg-red-50 px-2 py-1 rounded hover:bg-red-100">🗑️</button>
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
