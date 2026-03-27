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

function ExpiryBadge({ date, label }: { date: string | null; label: string }) {
  const days = daysUntil(date);
  if (days === null) return <span className="text-[10px] text-slate-300">—</span>;
  const color = days < 0 ? "#DC2626" : days < 30 ? "#F59E0B" : "#16A34A";
  const bg = days < 0 ? "#FEE2E2" : days < 30 ? "#FEF3C7" : "#DCFCE7";
  return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ color, background: bg }}>
      {label}: {days < 0 ? `منتهي` : `${days} يوم`}
    </span>
  );
}

function VehicleForm({ vehicle, drivers, onSave, onCancel }: {
  vehicle: Partial<Vehicle> | null;
  drivers: Driver[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!vehicle?.id;
  const [form, setForm] = useState({
    tanker_number: vehicle?.tanker_number || "",
    plate_number: vehicle?.plate_number || "",
    chassis_number: vehicle?.chassis_number || "",
    brand: vehicle?.brand || "",
    model: vehicle?.model || "",
    manufacture_year: vehicle?.manufacture_year?.toString() || "",
    fuel_type_carried: vehicle?.fuel_type_carried || "",
    tank_capacity_liters: vehicle?.tank_capacity_liters?.toString() || "",
    is_active: vehicle?.is_active ?? true,
    driver_id: vehicle?.driver_id || "",
    tracking_device_number: vehicle?.tracking_device_number || "",
    tracking_link: vehicle?.tracking_link || "",
    registration_number: vehicle?.registration_number || "",
    registration_expiry: vehicle?.registration_expiry || "",
    inspection_expiry: vehicle?.inspection_expiry || "",
    operating_card_number: vehicle?.operating_card_number || "",
    operating_card_expiry: vehicle?.operating_card_expiry || "",
    notes: vehicle?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));
  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm";
  const labelClass = "text-xs font-semibold text-slate-600 mb-1 block";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tanker_number || !form.tank_capacity_liters) { setError("رقم الصهريج والسعة مطلوبان"); return; }
    setSaving(true);
    const payload = {
      ...form,
      manufacture_year: form.manufacture_year ? parseInt(form.manufacture_year) : null,
      tank_capacity_liters: parseInt(form.tank_capacity_liters),
      fuel_type_carried: form.fuel_type_carried || null,
      driver_id: form.driver_id || null,
      registration_expiry: form.registration_expiry || null,
      inspection_expiry: form.inspection_expiry || null,
      operating_card_expiry: form.operating_card_expiry || null,
    };
    const { error: err } = isEdit
      ? await supabase.from("vehicles").update(payload).eq("id", vehicle!.id)
      : await supabase.from("vehicles").insert(payload);
    if (err) { setError(err.message); setSaving(false); return; }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 ani-fade" onClick={onCancel}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[88vh] overflow-y-auto p-6 ani-scale">
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          {isEdit ? "تعديل صهريج" : "إضافة صهريج جديد"}
        </h2>
        {error && <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg mb-3 font-semibold">{error}</div>}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className={labelClass}>رقم الصهريج *</label><input className={inputClass} value={form.tanker_number} onChange={e => set("tanker_number", e.target.value)} required /></div>
          <div><label className={labelClass}>رقم اللوحة</label><input className={inputClass} value={form.plate_number} onChange={e => set("plate_number", e.target.value)} /></div>
          <div><label className={labelClass}>رقم الشاسيه</label><input className={inputClass} value={form.chassis_number} onChange={e => set("chassis_number", e.target.value)} /></div>
          <div><label className={labelClass}>الماركة</label><input className={inputClass} value={form.brand} onChange={e => set("brand", e.target.value)} /></div>
          <div><label className={labelClass}>الموديل</label><input className={inputClass} value={form.model} onChange={e => set("model", e.target.value)} /></div>
          <div><label className={labelClass}>سنة الصنع</label><input type="number" className={inputClass} value={form.manufacture_year} onChange={e => set("manufacture_year", e.target.value)} dir="ltr" /></div>
          <div>
            <label className={labelClass}>نوع الوقود المحمول</label>
            <select className={inputClass} value={form.fuel_type_carried} onChange={e => set("fuel_type_carried", e.target.value)}>
              <option value="">— اختر —</option>
              {Object.entries(FUEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>سعة الخزان (لتر) *</label><input type="number" className={inputClass} value={form.tank_capacity_liters} onChange={e => set("tank_capacity_liters", e.target.value)} required dir="ltr" /></div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={labelClass}>السائق المعيّن</label>
            <select className={inputClass} value={form.driver_id} onChange={e => set("driver_id", e.target.value)}>
              <option value="">— بدون سائق —</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.employee_number})</option>)}
            </select>
          </div>
          <div><label className={labelClass}>رقم جهاز التتبع</label><input className={inputClass} value={form.tracking_device_number} onChange={e => set("tracking_device_number", e.target.value)} /></div>
          <div className="col-span-2"><label className={labelClass}>رابط التتبع</label><input className={inputClass} value={form.tracking_link} onChange={e => set("tracking_link", e.target.value)} dir="ltr" /></div>
        </div>

        <h3 className="text-sm font-bold mb-3 text-slate-700 border-t pt-4">الوثائق</h3>
        <div className="space-y-3">
          {[
            { label: "الاستمارة", numKey: "registration_number", dateKey: "registration_expiry" },
            { label: "الفحص الدوري", numKey: null, dateKey: "inspection_expiry" },
            { label: "كرت التشغيل", numKey: "operating_card_number", dateKey: "operating_card_expiry" },
          ].map(doc => (
            <div key={doc.dateKey} className="grid grid-cols-3 gap-2 items-end">
              {doc.numKey ? (
                <div><label className={labelClass}>رقم {doc.label}</label><input className={inputClass} value={(form as unknown as Record<string, string>)[doc.numKey]} onChange={e => set(doc.numKey!, e.target.value)} /></div>
              ) : <div />}
              <div><label className={labelClass}>تاريخ انتهاء {doc.label}</label><input type="date" className={inputClass} value={(form as unknown as Record<string, string>)[doc.dateKey]} onChange={e => set(doc.dateKey, e.target.value)} dir="ltr" /></div>
              <div className="pb-1"><ExpiryBadge date={(form as unknown as Record<string, string>)[doc.dateKey]} label={doc.label} /></div>
            </div>
          ))}
        </div>

        <div className="mt-4"><label className={labelClass}>ملاحظات</label><textarea className={inputClass} rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} /></div>

        <div className="flex gap-3 mt-5 pt-4 border-t">
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200">إلغاء</button>
          <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white disabled:opacity-50">
            {saving ? "..." : isEdit ? "تحديث" : "إضافة"}
          </button>
        </div>
      </form>
    </div>
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
    if (!driverId) return "—";
    return drivers.find(d => d.id === driverId)?.name || "—";
  };

  return (
    <div className="ani-page">
      <PageHeader title="إدارة الصهاريج" subtitle={`${vehicles.length} صهريج`}
        action={<button onClick={() => { setEditVehicle(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700">+ إضافة صهريج</button>} />

      <div className="p-6">
        {loading ? (
          <div className="text-center py-20 text-slate-400 animate-pulse">⏳ جاري التحميل...</div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white rounded-2xl shadow-sm">
            <div className="text-5xl mb-3">🚛</div>
            <p className="text-sm font-medium">لا يوجد صهاريج</p>
          </div>
        ) : (
          <div className="stg grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {vehicles.map(v => (
              <div key={v.id} className="hov-lift bg-white rounded-2xl shadow-sm p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: v.is_active ? "#2563EB" : "#DC2626" }} />
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-2xl">🚛</div>
                  <div className="flex-1">
                    <div className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>{v.tanker_number}</div>
                    <div className="text-[11px] text-slate-400">{v.brand} {v.model} {v.manufacture_year || ""}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                    background: v.is_active ? "#DCFCE7" : "#FEE2E2",
                    color: v.is_active ? "#16A34A" : "#DC2626",
                  }}>{v.is_active ? "نشط" : "معطّل"}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-100 text-center">
                  <div>
                    <div className="text-sm font-bold text-blue-600" style={{ fontFamily: "var(--font-display)" }}>
                      {(v.tank_capacity_liters / 1000).toFixed(0)}K
                    </div>
                    <div className="text-[10px] text-slate-400">لتر</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700">
                      {v.fuel_type_carried ? FUEL_LABELS[v.fuel_type_carried] : "—"}
                    </div>
                    <div className="text-[10px] text-slate-400">الوقود</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700">{v.plate_number || "—"}</div>
                    <div className="text-[10px] text-slate-400">اللوحة</div>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-600">
                  <span className="font-semibold">السائق:</span> {getDriverName(v.driver_id)}
                </div>

                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-100">
                  <ExpiryBadge date={v.registration_expiry} label="الاستمارة" />
                  <ExpiryBadge date={v.inspection_expiry} label="الفحص" />
                  <ExpiryBadge date={v.operating_card_expiry} label="التشغيل" />
                </div>

                <div className="flex gap-2 mt-3 pt-2 border-t border-slate-100">
                  <button onClick={() => { setEditVehicle(v); setShowForm(true); }}
                    className="flex-1 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">✏️ تعديل</button>
                  <button onClick={() => handleDelete(v.id, v.tanker_number)}
                    className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <VehicleForm vehicle={editVehicle} drivers={drivers}
          onCancel={() => setShowForm(false)} onSave={() => { setShowForm(false); fetchData(); }} />
      )}
    </div>
  );
}
