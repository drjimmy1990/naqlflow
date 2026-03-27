"use client";

import { supabase } from "@/lib/supabase";
import type { Driver } from "@/lib/types";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

function daysUntil(date: string | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ── Document Status Dot ──
function DocDot({ date, label }: { date: string | null; label: string }) {
  const days = daysUntil(date);
  if (days === null) return <div className="flex items-center gap-1.5 flex-1"><div className="w-2 h-2 rounded-full" style={{ background: "var(--outline)" }} /><span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{label}</span></div>;
  const cfg = days < 0 ? { color: "var(--danger)", bg: "var(--danger-bg)", text: `منتهي ${Math.abs(days)} يوم` } :
              days < 30 ? { color: "var(--warning)", bg: "var(--warning-bg)", text: `${days} يوم` } :
                          { color: "var(--success)", bg: "var(--success-bg)", text: `${days} يوم` };
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

// ── ExpiryBadge (for forms) ──
function ExpiryBadge({ date, label }: { date: string | null; label: string }) {
  const days = daysUntil(date);
  if (days === null) return <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>—</span>;
  const color = days < 0 ? "var(--danger)" : days < 30 ? "var(--warning)" : "var(--success)";
  const bg = days < 0 ? "var(--danger-bg)" : days < 30 ? "var(--warning-bg)" : "var(--success-bg)";
  return (
    <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ color, background: bg }}>
      {label}: {days < 0 ? `منتهي (${Math.abs(days)} يوم)` : `${days} يوم`}
    </span>
  );
}

// ── Form ──
function DriverForm({ driver, onSave, onCancel }: { driver: Partial<Driver> | null; onSave: () => void; onCancel: () => void; }) {
  const isEdit = !!driver?.id;
  const [form, setForm] = useState({
    employee_number: driver?.employee_number || "", name: driver?.name || "", phone: driver?.phone || "",
    is_active: driver?.is_active ?? true, national_id: driver?.national_id || "", national_id_expiry: driver?.national_id_expiry || "",
    passport_number: driver?.passport_number || "", passport_expiry: driver?.passport_expiry || "",
    license_number: driver?.license_number || "", license_expiry: driver?.license_expiry || "",
    aramco_card: driver?.aramco_card || "", aramco_card_expiry: driver?.aramco_card_expiry || "",
    transport_card: driver?.transport_card || "", transport_card_expiry: driver?.transport_card_expiry || "",
    notes: driver?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_number || !form.name) { setError("الرقم الوظيفي والاسم مطلوبان"); return; }
    setSaving(true); setError("");
    const payload = { ...form, national_id_expiry: form.national_id_expiry || null, passport_expiry: form.passport_expiry || null,
      license_expiry: form.license_expiry || null, aramco_card_expiry: form.aramco_card_expiry || null, transport_card_expiry: form.transport_card_expiry || null };
    const { error: err } = isEdit ? await supabase.from("drivers").update(payload).eq("id", driver!.id) : await supabase.from("drivers").insert(payload);
    if (err) { setError(err.message); setSaving(false); return; }
    onSave();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 ani-fade" onClick={onCancel}
        style={{ background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} />
      <div className="fixed inset-0 z-[60] flex items-start justify-center pt-8 pointer-events-none">
      <form onSubmit={handleSubmit}
        className="pointer-events-auto modal-container max-w-2xl max-h-[85vh] ani-scale">
        <div className="modal-header">
          <h2>{isEdit ? "تعديل سائق" : "إضافة سائق جديد"}</h2>
          <p>بيانات السائق والوثائق</p>
        </div>
        {error && <div className="p-3 rounded-md mb-4 text-[12px] font-semibold" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>⚠️ {error}</div>}

        {/* Basic Info Section */}
        <div className="form-section">
          <div className="form-section-title">👤 البيانات الأساسية</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">الرقم الوظيفي *</label>
              <input className="input-field" value={form.employee_number} onChange={e => set("employee_number", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">اسم السائق *</label>
              <input className="input-field" value={form.name} onChange={e => set("name", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">رقم الجوال</label>
              <input className="input-field" value={form.phone} onChange={e => set("phone", e.target.value)} dir="ltr" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2.5 text-[13px] cursor-pointer font-medium" style={{ color: "var(--text-secondary)" }}>
                <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="w-4 h-4 rounded accent-blue-600" /> نشط
              </label>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="form-section">
          <div className="form-section-title">📄 الوثائق والمستندات</div>
          <div className="space-y-4">
            {[
              { label: "الهوية / الإقامة", numKey: "national_id", dateKey: "national_id_expiry" },
              { label: "الجواز", numKey: "passport_number", dateKey: "passport_expiry" },
              { label: "رخصة القيادة", numKey: "license_number", dateKey: "license_expiry" },
              { label: "كرت أرامكو", numKey: "aramco_card", dateKey: "aramco_card_expiry" },
              { label: "كرت وزارة النقل", numKey: "transport_card", dateKey: "transport_card_expiry" },
            ].map(doc => (
              <div key={doc.numKey} className="grid grid-cols-3 gap-3 items-end">
                <div className="form-group">
                  <label className="form-label">رقم {doc.label}</label>
                  <input className="input-field text-[13px]" value={(form as unknown as Record<string, string>)[doc.numKey]} onChange={e => set(doc.numKey, e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">تاريخ الانتهاء</label>
                  <input type="date" className="input-field text-[13px]" value={(form as unknown as Record<string, string>)[doc.dateKey]} onChange={e => set(doc.dateKey, e.target.value)} dir="ltr" />
                </div>
                <div className="pb-2"><ExpiryBadge date={(form as unknown as Record<string, string>)[doc.dateKey]} label={doc.label} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">ملاحظات</label>
          <textarea className="input-field" rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>

        <div className="form-footer">
          <button type="button" onClick={onCancel} className="btn-ghost flex-1 py-2.5 rounded-md text-[13px]">إلغاء</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 rounded-md text-[13px] disabled:opacity-50">
            {saving ? "جاري الحفظ..." : isEdit ? "تحديث" : "✦ إضافة"}
          </button>
        </div>
      </form>
      </div>
    </>
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
      <PageHeader title="إدارة السائقين" subtitle={`${drivers.length} سائق`}
        action={
          <button onClick={() => { setEditDriver(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-[13px]">
            <span className="text-lg leading-none">+</span> إضافة سائق
          </button>
        } />

      <div className="p-8">
        {loading ? (
          <div className="text-center py-20" style={{ color: "var(--text-faint)" }}>
            <div className="text-3xl mb-2 animate-pulse">👤</div>جاري التحميل...
          </div>
        ) : drivers.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-3 opacity-50">👤</div>
            <p className="text-[14px] font-bold" style={{ color: "var(--text-muted)" }}>لا يوجد سائقين</p>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-faint)" }}>أضف أول سائق بالضغط على "+ إضافة سائق"</p>
          </div>
        ) : (
          <div className="stg grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {drivers.map(d => (
              <div key={d.id} className="card hov-lift p-0 relative overflow-hidden" style={{ borderRadius: "var(--radius-lg)" }}>
                {/* Color strip top */}
                <div className="h-1" style={{ borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", background: d.is_active ? "var(--success)" : "var(--danger)" }} />

                {/* Header */}
                <div className="p-5 pb-0">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-base shrink-0"
                      style={{
                        background: d.is_active ? "linear-gradient(135deg, #D1FAE5, #A7F3D0)" : "linear-gradient(135deg, #FEE2E2, #FECACA)",
                        color: d.is_active ? "var(--success)" : "var(--danger)",
                        fontFamily: "var(--font-display)",
                      }}>
                      {d.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[15px] truncate" style={{ color: "var(--text-primary)" }}>{d.name}</div>
                      <div className="text-[11px] mt-0.5" dir="ltr" style={{ color: "var(--text-faint)", fontFamily: "var(--font-data)" }}>{d.phone || "—"}</div>
                    </div>
                    <span className="chip text-[10px]" style={{
                      background: d.is_active ? "var(--success-bg)" : "var(--danger-bg)",
                      color: d.is_active ? "var(--success)" : "var(--danger)",
                    }}>
                      {d.is_active ? "نشط" : "غير نشط"}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 mx-5 mt-4 p-3 rounded-lg" style={{ background: "var(--surface-low)", border: "1px solid var(--border-light)" }}>
                  <div className="text-center">
                    <div className="data-number text-[18px] font-bold" style={{ color: "var(--primary)" }}>{d.employee_number}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>الرقم الوظيفي</div>
                  </div>
                  <div className="text-center" style={{ borderRight: "1px solid var(--border)", borderLeft: "1px solid var(--border)" }}>
                    <div className="data-number text-[18px] font-bold" style={{ color: "var(--warning)" }}>
                      {d.general_rating ? `${d.general_rating}` : "—"}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>التقييم ⭐</div>
                  </div>
                  <div className="text-center">
                    <div className="data-number text-[18px] font-bold" style={{ color: "var(--success)" }}>{d.total_trips}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>رحلة</div>
                  </div>
                </div>

                {/* Document Dots */}
                <div className="mx-5 mt-3 p-3 rounded-lg grid grid-cols-2 gap-y-2" style={{ background: "var(--surface-low)", border: "1px solid var(--border-light)" }}>
                  <DocDot date={d.national_id_expiry} label="الهوية" />
                  <DocDot date={d.license_expiry} label="الرخصة" />
                  <DocDot date={d.aramco_card_expiry} label="أرامكو" />
                  <DocDot date={d.transport_card_expiry} label="النقل" />
                </div>

                {/* Actions */}
                <div className="flex gap-2 p-5 pt-4">
                  <button onClick={() => { setEditDriver(d); setShowForm(true); }}
                    className="flex-1 py-2 rounded-md text-[12px] font-semibold transition-all duration-150 flex items-center justify-center gap-1.5"
                    style={{ background: "var(--primary-fixed)", color: "var(--primary)" }}
                    onMouseEnter={(e) => { (e.currentTarget).style.background = "var(--primary)"; (e.currentTarget).style.color = "#fff"; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.background = "var(--primary-fixed)"; (e.currentTarget).style.color = "var(--primary)"; }}>
                    ✏️ تعديل
                  </button>
                  <button onClick={() => handleDelete(d.id, d.name)}
                    className="w-9 h-9 rounded-md flex items-center justify-center text-[13px] transition-all duration-150 shrink-0"
                    style={{ background: "var(--surface-low)", color: "var(--text-muted)" }}
                    onMouseEnter={(e) => { (e.currentTarget).style.background = "var(--danger-bg)"; (e.currentTarget).style.color = "var(--danger)"; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.background = "var(--surface-low)"; (e.currentTarget).style.color = "var(--text-muted)"; }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && <DriverForm driver={editDriver} onCancel={() => setShowForm(false)} onSave={() => { setShowForm(false); fetchDrivers(); }} />}
    </div>
  );
}
