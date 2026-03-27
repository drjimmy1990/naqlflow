"use client";

import { supabase } from "@/lib/supabase";
import type { Driver } from "@/lib/types";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

// Days until expiry helper
function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ date, label }: { date: string | null; label: string }) {
  const days = daysUntil(date);
  if (days === null) return <span className="text-[10px] text-slate-300">—</span>;
  const color = days < 0 ? "#DC2626" : days < 30 ? "#F59E0B" : "#16A34A";
  const bg = days < 0 ? "#FEE2E2" : days < 30 ? "#FEF3C7" : "#DCFCE7";
  return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ color, background: bg }}>
      {label}: {days < 0 ? `منتهي (${Math.abs(days)} يوم)` : `${days} يوم`}
    </span>
  );
}

// ── Add/Edit Form ──
function DriverForm({ driver, onSave, onCancel }: {
  driver: Partial<Driver> | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!driver?.id;
  const [form, setForm] = useState({
    employee_number: driver?.employee_number || "",
    name: driver?.name || "",
    phone: driver?.phone || "",
    is_active: driver?.is_active ?? true,
    national_id: driver?.national_id || "",
    national_id_expiry: driver?.national_id_expiry || "",
    passport_number: driver?.passport_number || "",
    passport_expiry: driver?.passport_expiry || "",
    license_number: driver?.license_number || "",
    license_expiry: driver?.license_expiry || "",
    aramco_card: driver?.aramco_card || "",
    aramco_card_expiry: driver?.aramco_card_expiry || "",
    transport_card: driver?.transport_card || "",
    transport_card_expiry: driver?.transport_card_expiry || "",
    notes: driver?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_number || !form.name) { setError("الرقم الوظيفي والاسم مطلوبان"); return; }
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      national_id_expiry: form.national_id_expiry || null,
      passport_expiry: form.passport_expiry || null,
      license_expiry: form.license_expiry || null,
      aramco_card_expiry: form.aramco_card_expiry || null,
      transport_card_expiry: form.transport_card_expiry || null,
    };

    const { error: err } = isEdit
      ? await supabase.from("drivers").update(payload).eq("id", driver!.id)
      : await supabase.from("drivers").insert(payload);

    if (err) { setError(err.message); setSaving(false); return; }
    onSave();
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 transition-colors";
  const labelClass = "text-xs font-semibold text-slate-600 mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 ani-fade" onClick={onCancel}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 ani-scale">
        <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "var(--font-display)" }}>
          {isEdit ? "تعديل سائق" : "إضافة سائق جديد"}
        </h2>

        {error && <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg mb-4 font-semibold">{error}</div>}

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div><label className={labelClass}>الرقم الوظيفي *</label><input className={inputClass} value={form.employee_number} onChange={e => set("employee_number", e.target.value)} required /></div>
          <div><label className={labelClass}>اسم السائق *</label><input className={inputClass} value={form.name} onChange={e => set("name", e.target.value)} required /></div>
          <div><label className={labelClass}>رقم الجوال</label><input className={inputClass} value={form.phone} onChange={e => set("phone", e.target.value)} dir="ltr" /></div>
          <div className="flex items-end gap-2 pb-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)}
                className="w-4 h-4 rounded text-blue-600" />
              نشط
            </label>
          </div>
        </div>

        {/* Documents */}
        <h3 className="text-sm font-bold mb-3 text-slate-700 border-t pt-4">الوثائق والمستندات</h3>
        <div className="space-y-3">
          {[
            { label: "الهوية / الإقامة", numKey: "national_id", dateKey: "national_id_expiry" },
            { label: "الجواز", numKey: "passport_number", dateKey: "passport_expiry" },
            { label: "رخصة القيادة", numKey: "license_number", dateKey: "license_expiry" },
            { label: "كرت أرامكو", numKey: "aramco_card", dateKey: "aramco_card_expiry" },
            { label: "كرت وزارة النقل", numKey: "transport_card", dateKey: "transport_card_expiry" },
          ].map(doc => (
            <div key={doc.numKey} className="grid grid-cols-3 gap-2 items-end">
              <div className="col-span-1"><label className={labelClass}>رقم {doc.label}</label><input className={inputClass} value={(form as unknown as Record<string, string>)[doc.numKey]} onChange={e => set(doc.numKey, e.target.value)} /></div>
              <div className="col-span-1"><label className={labelClass}>تاريخ الانتهاء</label><input type="date" className={inputClass} value={(form as unknown as Record<string, string>)[doc.dateKey]} onChange={e => set(doc.dateKey, e.target.value)} dir="ltr" /></div>
              <div className="col-span-1 pb-1">
                <ExpiryBadge date={(form as unknown as Record<string, string>)[doc.dateKey]} label={doc.label} />
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="mt-4">
          <label className={labelClass}>ملاحظات</label>
          <textarea className={inputClass} rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
          <button type="button" onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            إلغاء
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? "جاري الحفظ..." : isEdit ? "تحديث" : "إضافة"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main Page ──
export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);

  const fetchDrivers = async () => {
    setLoading(true);
    const { data } = await supabase.from("drivers").select("*").order("created_at", { ascending: false });
    setDrivers((data as Driver[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`حذف السائق "${name}"؟`)) return;
    await supabase.from("drivers").delete().eq("id", id);
    fetchDrivers();
  };

  return (
    <div className="ani-page">
      <PageHeader
        title="إدارة السائقين"
        subtitle={`${drivers.length} سائق`}
        action={
          <button onClick={() => { setEditDriver(null); setShowForm(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
            + إضافة سائق
          </button>
        }
      />

      <div className="p-6">
        {loading ? (
          <div className="text-center py-20 text-slate-400"><div className="text-3xl mb-2 animate-pulse">⏳</div>جاري التحميل...</div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white rounded-2xl shadow-sm">
            <div className="text-5xl mb-3">👤</div>
            <p className="text-sm font-medium">لا يوجد سائقين</p>
            <p className="text-xs mt-1 text-slate-300">أضف أول سائق بالضغط على &quot;+ إضافة سائق&quot;</p>
          </div>
        ) : (
          <div className="stg grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {drivers.map(d => (
              <div key={d.id} className="hov-lift bg-white rounded-2xl shadow-sm p-4 relative overflow-hidden">
                {/* Active indicator */}
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: d.is_active ? "#16A34A" : "#DC2626" }} />

                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base"
                    style={{
                      background: d.is_active ? "#DCFCE7" : "#FEE2E2",
                      color: d.is_active ? "#16A34A" : "#DC2626",
                      fontFamily: "var(--font-display)",
                    }}>
                    {d.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{d.name}</div>
                    <div className="text-[11px] text-slate-400" dir="ltr">{d.phone || "—"}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{
                      background: d.is_active ? "#DCFCE7" : "#FEE2E2",
                      color: d.is_active ? "#16A34A" : "#DC2626",
                    }}>
                    {d.is_active ? "نشط" : "غير نشط"}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-slate-100">
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-500" style={{ fontFamily: "var(--font-display)" }}>{d.general_rating}</div>
                    <div className="text-[10px] text-slate-400">التقييم</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600" style={{ fontFamily: "var(--font-display)" }}>{d.total_trips}</div>
                    <div className="text-[10px] text-slate-400">الرحلات</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600" style={{ fontFamily: "var(--font-display)" }}>{d.employee_number}</div>
                    <div className="text-[10px] text-slate-400">الرقم الوظيفي</div>
                  </div>
                </div>

                {/* Document Expiry Badges */}
                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-100">
                  <ExpiryBadge date={d.national_id_expiry} label="الهوية" />
                  <ExpiryBadge date={d.license_expiry} label="الرخصة" />
                  <ExpiryBadge date={d.aramco_card_expiry} label="أرامكو" />
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-2 border-t border-slate-100">
                  <button onClick={() => { setEditDriver(d); setShowForm(true); }}
                    className="flex-1 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                    ✏️ تعديل
                  </button>
                  <button onClick={() => handleDelete(d.id, d.name)}
                    className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <DriverForm
          driver={editDriver}
          onCancel={() => setShowForm(false)}
          onSave={() => { setShowForm(false); fetchDrivers(); }}
        />
      )}
    </div>
  );
}
