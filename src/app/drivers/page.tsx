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

// ── Document Row (new polished style) ──
function DocRow({ date, label }: { date: string | null; label: string }) {
  const days = daysUntil(date);
  const cfg = days === null
    ? { color: "#CBD5E1", bg: "#F8FAFC", text: "غير محدد", icon: "○" }
    : days < 0
    ? { color: "#DC2626", bg: "#FEF2F2", text: `منتهي ${Math.abs(days)} يوم`, icon: "✕" }
    : days < 30
    ? { color: "#D97706", bg: "#FFFBEB", text: `${days} يوم`, icon: "!" }
    : { color: "#059669", bg: "#ECFDF5", text: `${days} يوم`, icon: "✓" };
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: cfg.bg }}>
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
          style={{ background: `${cfg.color}18`, color: cfg.color }}>{cfg.icon}</span>
        <span className="text-[11px] font-semibold" style={{ color: "#334155" }}>{label}</span>
      </div>
      <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.text}</span>
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

      <div className="page-content" style={{ padding: "24px clamp(14px, 3vw, 32px)" }}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {drivers.map(d => {
              const statusColor = d.is_active ? "#059669" : "#DC2626";
              const statusBg = d.is_active ? "#ECFDF5" : "#FEF2F2";
              const statusBorder = d.is_active ? "#A7F3D0" : "#FECACA";
              return (
                <div key={d.id}
                  className="rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col"
                  style={{
                    background: "#fff",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                    padding: "16px",
                  }}>

                  {/* ─── Profile Header ─── */}
                  <div className="pb-3 text-center"
                    style={{ borderBottom: "1px solid #F1F5F9" }}>
                    
                    {/* Name */}
                    <h3 className="text-[17px] font-bold mb-0.5" style={{ color: "#0F172A" }}>{d.name}</h3>
                    
                    {/* Phone */}
                    <div className="text-[12px] font-medium mb-2.5" dir="ltr"
                      style={{ color: "#94A3B8", fontFamily: "var(--font-data)", letterSpacing: "0.5px" }}>
                      {d.phone || "—"}
                    </div>

                    {/* Employee Number */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg mb-2"
                      style={{ background: "#EFF6FF", border: "1px solid #DBEAFE" }}>
                      <span className="text-[10px] font-medium" style={{ color: "#64748B" }}>الرقم الوظيفي</span>
                      <span className="text-[13px] font-bold" style={{ color: "#1D4ED8", fontFamily: "var(--font-data)" }}>{d.employee_number}</span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                        style={{ background: statusBg, color: statusColor, border: `1px solid ${statusBorder}` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                        {d.is_active ? "نشط" : "غير نشط"}
                      </span>
                    </div>
                  </div>

                  {/* ─── Stats Bar ─── */}
                  <div className="grid grid-cols-2 mt-3 rounded-xl overflow-hidden"
                    style={{ border: "1px solid #E2E8F0" }}>
                    <div className="py-3.5 text-center" style={{ borderLeft: "1px solid #E2E8F0" }}>
                      <div className="text-[22px] font-bold leading-none mb-1" style={{ color: "#F59E0B" }}>
                        {d.general_rating ? `${d.general_rating}` : "—"}
                      </div>
                      <div className="text-[10px] font-medium" style={{ color: "#94A3B8" }}>⭐ التقييم</div>
                    </div>
                    <div className="py-3.5 text-center">
                      <div className="text-[22px] font-bold leading-none mb-1" style={{ color: "#059669" }}>
                        {d.total_trips}
                      </div>
                      <div className="text-[10px] font-medium" style={{ color: "#94A3B8" }}>🚛 الرحلات</div>
                    </div>
                  </div>

                  {/* ─── Documents ─── */}
                  <div className="flex-1 pt-4 pb-3">
                    <div className="text-[10px] font-bold mb-3 tracking-wider" style={{ color: "#94A3B8" }}>المستندات</div>
                    <div className="space-y-2">
                      <DocRow date={d.national_id_expiry} label="الهوية الوطنية" />
                      <DocRow date={d.license_expiry} label="رخصة القيادة" />
                      <DocRow date={d.aramco_card_expiry} label="بطاقة أرامكو" />
                      <DocRow date={d.transport_card_expiry} label="بطاقة النقل" />
                    </div>
                  </div>

                  {/* ─── Actions ─── */}
                  <div className="flex gap-2.5 pt-3" style={{ borderTop: "1px solid #F1F5F9" }}>
                    <button onClick={() => { setEditDriver(d); setShowForm(true); }}
                      className="flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5"
                      style={{ background: "#1D4ED8", color: "#fff", boxShadow: "0 2px 8px rgba(29,78,216,0.25)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#1E40AF"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#1D4ED8"; e.currentTarget.style.transform = "translateY(0)"; }}>
                      ✏️ تعديل
                    </button>
                    <button onClick={() => handleDelete(d.id, d.name)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] transition-all duration-200"
                      style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.transform = "scale(1.08)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.transform = "scale(1)"; }}>
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && <DriverForm driver={editDriver} onCancel={() => setShowForm(false)} onSave={() => { setShowForm(false); fetchDrivers(); }} />}
    </div>
  );
}
