"use client";

import { supabase } from "@/lib/supabase";
import type { Vehicle, Driver, FuelCategory } from "@/lib/types";
import { FUEL_LABELS } from "@/lib/types";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

function daysUntil(date: string | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function DocDot({ date, label }: { date: string | null; label: string }) {
  const days = daysUntil(date);
  if (days === null) return <div className="flex items-center gap-1.5 flex-1"><div className="w-2 h-2 rounded-full" style={{ background: "var(--outline)" }} /><span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{label}</span></div>;
  const cfg = days < 0 ? { color: "var(--danger)", text: `منتهي ${Math.abs(days)} يوم` } :
              days < 30 ? { color: "var(--warning)", text: `${days} يوم` } :
                          { color: "var(--success)", text: `${days} يوم` };
  return (
    <div className="flex items-center gap-1.5 flex-1" title={`${label}: ${cfg.text}`}>
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}40` }} />
      <div>
        <div className="text-[10px] font-bold" style={{ color: cfg.color }}>{label}</div>
        <div className="text-[9px]" style={{ color: "var(--text-faint)" }}>{cfg.text}</div>
      </div>
    </div>
  );
}

function ExpiryBadge({ date, label }: { date: string | null; label: string }) {
  const days = daysUntil(date);
  if (days === null) return <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>—</span>;
  const color = days < 0 ? "var(--danger)" : days < 30 ? "var(--warning)" : "var(--success)";
  const bg = days < 0 ? "var(--danger-bg)" : days < 30 ? "var(--warning-bg)" : "var(--success-bg)";
  return <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ color, background: bg }}>{label}: {days < 0 ? `منتهي` : `${days} يوم`}</span>;
}

const FUEL_COLORS: Record<string, string> = {
  benzene_91: "#3B82F6", benzene_95: "#8B5CF6", diesel: "#D97706", kerosene: "#0891B2",
};

function VehicleForm({ vehicle, drivers, onSave, onCancel }: { vehicle: Partial<Vehicle> | null; drivers: Driver[]; onSave: () => void; onCancel: () => void; }) {
  const isEdit = !!vehicle?.id;
  const [form, setForm] = useState({
    tanker_number: vehicle?.tanker_number || "", plate_number: vehicle?.plate_number || "", chassis_number: vehicle?.chassis_number || "",
    brand: vehicle?.brand || "", model: vehicle?.model || "", manufacture_year: vehicle?.manufacture_year?.toString() || "",
    fuel_type_carried: vehicle?.fuel_type_carried || "", tank_capacity_liters: vehicle?.tank_capacity_liters?.toString() || "",
    is_active: vehicle?.is_active ?? true, driver_id: vehicle?.driver_id || "",
    tracking_device_number: vehicle?.tracking_device_number || "", tracking_link: vehicle?.tracking_link || "",
    registration_number: vehicle?.registration_number || "", registration_expiry: vehicle?.registration_expiry || "",
    inspection_expiry: vehicle?.inspection_expiry || "", operating_card_number: vehicle?.operating_card_number || "",
    operating_card_expiry: vehicle?.operating_card_expiry || "", notes: vehicle?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tanker_number || !form.tank_capacity_liters) { setError("رقم الصهريج والسعة مطلوبان"); return; }
    setSaving(true);
    const payload = { ...form, manufacture_year: form.manufacture_year ? parseInt(form.manufacture_year) : null,
      tank_capacity_liters: parseInt(form.tank_capacity_liters), fuel_type_carried: form.fuel_type_carried || null,
      driver_id: form.driver_id || null, registration_expiry: form.registration_expiry || null,
      inspection_expiry: form.inspection_expiry || null, operating_card_expiry: form.operating_card_expiry || null };
    const { error: err } = isEdit ? await supabase.from("vehicles").update(payload).eq("id", vehicle!.id) : await supabase.from("vehicles").insert(payload);
    if (err) { setError(err.message); setSaving(false); return; }
    onSave();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 ani-fade" onClick={onCancel}
        style={{ background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} />
      <div className="fixed inset-0 z-[60] flex items-start justify-center pt-8 pointer-events-none">
      <form onSubmit={handleSubmit}
        className="pointer-events-auto modal-container max-w-2xl max-h-[88vh] ani-scale">
        <div className="modal-header">
          <h2>{isEdit ? "تعديل صهريج" : "إضافة صهريج جديد"}</h2>
          <p>بيانات الصهريج والوثائق</p>
        </div>
        {error && <div className="p-3 rounded-md mb-4 text-[12px] font-semibold" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>⚠️ {error}</div>}

        {/* Vehicle Info */}
        <div className="form-section">
          <div className="form-section-title">🚛 بيانات الصهريج</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">رقم الصهريج *</label>
              <input className="input-field" value={form.tanker_number} onChange={e => set("tanker_number", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">رقم اللوحة</label>
              <input className="input-field" value={form.plate_number} onChange={e => set("plate_number", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">الماركة</label>
              <input className="input-field" value={form.brand} onChange={e => set("brand", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">الموديل</label>
              <input className="input-field" value={form.model} onChange={e => set("model", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">نوع الوقود</label>
              <select className="input-field" value={form.fuel_type_carried} onChange={e => set("fuel_type_carried", e.target.value)}>
                <option value="">— اختر —</option>
                {Object.entries(FUEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">سعة الخزان (لتر) *</label>
              <input type="number" className="input-field" value={form.tank_capacity_liters} onChange={e => set("tank_capacity_liters", e.target.value)} required dir="ltr" />
            </div>
            <div className="form-group">
              <label className="form-label">السائق المعيّن</label>
              <select className="input-field" value={form.driver_id} onChange={e => set("driver_id", e.target.value)}>
                <option value="">— بدون سائق —</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.employee_number})</option>)}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2.5 text-[13px] cursor-pointer font-medium" style={{ color: "var(--text-secondary)" }}>
                <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="w-4 h-4 rounded accent-blue-600" /> نشط
              </label>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="form-section">
          <div className="form-section-title">📄 الوثائق</div>
          <div className="space-y-4">
            {[
              { label: "الاستمارة", numKey: "registration_number", dateKey: "registration_expiry" },
              { label: "الفحص الدوري", numKey: null, dateKey: "inspection_expiry" },
              { label: "كرت التشغيل", numKey: "operating_card_number", dateKey: "operating_card_expiry" },
            ].map(doc => (
              <div key={doc.dateKey} className="grid grid-cols-3 gap-3 items-end">
                {doc.numKey ? <div className="form-group"><label className="form-label">رقم {doc.label}</label><input className="input-field text-[13px]" value={(form as unknown as Record<string, string>)[doc.numKey]} onChange={e => set(doc.numKey!, e.target.value)} /></div> : <div />}
                <div className="form-group"><label className="form-label">تاريخ انتهاء {doc.label}</label><input type="date" className="input-field text-[13px]" value={(form as unknown as Record<string, string>)[doc.dateKey]} onChange={e => set(doc.dateKey, e.target.value)} dir="ltr" /></div>
                <div className="pb-2"><ExpiryBadge date={(form as unknown as Record<string, string>)[doc.dateKey]} label={doc.label} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-footer">
          <button type="button" onClick={onCancel} className="btn-ghost flex-1 py-2.5 rounded-md text-[13px]">إلغاء</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 rounded-md text-[13px] disabled:opacity-50">
            {saving ? "..." : isEdit ? "تحديث" : "✦ إضافة"}
          </button>
        </div>
      </form>
      </div>
    </>
  );
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: v }, { data: d }] = await Promise.all([
      supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
      supabase.from("drivers").select("*").eq("is_active", true).order("name"),
    ]);
    setVehicles((v as Vehicle[]) || []);
    setDrivers((d as Driver[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`حذف الصهريج "${num}"؟`)) return;
    await supabase.from("vehicles").delete().eq("id", id);
    fetchData();
  };

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return null;
    return drivers.find(d => d.id === driverId)?.name || null;
  };

  return (
    <div className="ani-page">
      <PageHeader title="إدارة الصهاريج" subtitle={`${vehicles.length} صهريج`}
        action={
          <button onClick={() => { setEditVehicle(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-[13px]">
            <span className="text-lg leading-none">+</span> إضافة صهريج
          </button>
        } />

      <div className="p-8">
        {loading ? (
          <div className="text-center py-20" style={{ color: "var(--text-faint)" }}>
            <div className="text-3xl mb-2 animate-pulse">🚛</div>جاري التحميل...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-3 opacity-50">🚛</div>
            <p className="text-[14px] font-bold" style={{ color: "var(--text-muted)" }}>لا يوجد صهاريج</p>
          </div>
        ) : (
          <div className="stg grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {vehicles.map(v => {
              const fuelColor = v.fuel_type_carried ? FUEL_COLORS[v.fuel_type_carried] || "var(--primary)" : "var(--primary)";
              const driverName = getDriverName(v.driver_id);
              return (
                <div key={v.id} className="card hov-lift p-0 relative overflow-hidden">
                  {/* Color strip */}
                  <div className="h-1 rounded-t-2xl" style={{
                    background: v.is_active
                      ? `linear-gradient(90deg, ${fuelColor}, ${fuelColor}AA)`
                      : "linear-gradient(90deg, var(--danger), #EF4444)"
                  }} />

                  {/* Header */}
                  <div className="p-5 pb-0">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
                        style={{ background: `${fuelColor}12` }}>
                        🚛
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="data-number text-[18px] font-bold" style={{ color: fuelColor }}>{v.tanker_number}</div>
                        <div className="text-[11px]" style={{ color: "var(--text-faint)" }}>{v.brand} {v.model} {v.manufacture_year || ""}</div>
                      </div>
                      <span className="chip text-[10px]" style={{
                        background: v.is_active ? "var(--success-bg)" : "var(--danger-bg)",
                        color: v.is_active ? "var(--success)" : "var(--danger)",
                      }}>
                        {v.is_active ? "نشط" : "معطّل"}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 mx-5 mt-4 p-3 rounded-md" style={{ background: "var(--surface-low)" }}>
                    <div className="text-center">
                      <div className="data-number text-[18px] font-bold" style={{ color: fuelColor }}>
                        {(v.tank_capacity_liters / 1000).toFixed(0)}K
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>لتر</div>
                    </div>
                    <div className="text-center" style={{ borderRight: "1px solid rgba(194,198,214,0.15)", borderLeft: "1px solid rgba(194,198,214,0.15)" }}>
                      <div className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                        {v.fuel_type_carried ? FUEL_LABELS[v.fuel_type_carried] : "—"}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>الوقود</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>{v.plate_number || "—"}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>اللوحة</div>
                    </div>
                  </div>

                  {/* Driver */}
                  {driverName && (
                    <div className="mx-5 mt-3 p-2.5 rounded-md flex items-center gap-2" style={{ background: "var(--surface-low)" }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
                        style={{ background: "var(--primary-fixed)", color: "var(--primary)" }}>
                        {driverName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-[11px] font-bold" style={{ color: "var(--text-primary)" }}>{driverName}</div>
                        <div className="text-[9px]" style={{ color: "var(--text-faint)" }}>السائق المعيّن</div>
                      </div>
                    </div>
                  )}

                  {/* Document Dots */}
                  <div className="mx-5 mt-3 p-3 rounded-md flex gap-2" style={{ background: "var(--surface-low)" }}>
                    <DocDot date={v.registration_expiry} label="الاستمارة" />
                    <DocDot date={v.inspection_expiry} label="الفحص" />
                    <DocDot date={v.operating_card_expiry} label="التشغيل" />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 p-5 pt-4">
                    <button onClick={() => { setEditVehicle(v); setShowForm(true); }}
                      className="flex-1 py-2.5 rounded-md text-[12px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5"
                      style={{ background: "var(--primary-fixed)", color: "var(--primary)" }}
                      onMouseEnter={(e) => { (e.currentTarget).style.background = "var(--primary)"; (e.currentTarget).style.color = "#fff"; }}
                      onMouseLeave={(e) => { (e.currentTarget).style.background = "var(--primary-fixed)"; (e.currentTarget).style.color = "var(--primary)"; }}>
                      ✏️ تعديل
                    </button>
                    <button onClick={() => handleDelete(v.id, v.tanker_number)}
                      className="w-10 h-10 rounded-md flex items-center justify-center text-[14px] transition-all duration-200 shrink-0"
                      style={{ background: "var(--surface-low)", color: "var(--text-muted)" }}
                      onMouseEnter={(e) => { (e.currentTarget).style.background = "var(--danger-bg)"; (e.currentTarget).style.color = "var(--danger)"; }}
                      onMouseLeave={(e) => { (e.currentTarget).style.background = "var(--surface-low)"; (e.currentTarget).style.color = "var(--text-muted)"; }}>
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && <VehicleForm vehicle={editVehicle} drivers={drivers} onCancel={() => setShowForm(false)} onSave={() => { setShowForm(false); fetchData(); }} />}
    </div>
  );
}
