"use client";

import { supabase } from "@/lib/supabase";
import type { Client, ClientSite, SiteContact, ClientBank } from "@/lib/types";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

// ── Client Form ──
function ClientForm({ client, onSave, onCancel }: {
  client: Partial<Client> | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!client?.id;
  const [form, setForm] = useState({
    name: client?.name || "",
    commercial_name: client?.commercial_name || "",
    operation_type: client?.operation_type || "transport",
    is_active: client?.is_active ?? true,
    cr_number: client?.cr_number || "",
    cr_expiry: client?.cr_expiry || "",
    notes: client?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));
  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm";
  const labelClass = "text-xs font-semibold text-slate-600 mb-1 block";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { setError("اسم العميل مطلوب"); return; }
    setSaving(true);
    const payload = { ...form, cr_expiry: form.cr_expiry || null };
    const { error: err } = isEdit
      ? await supabase.from("clients").update(payload).eq("id", client!.id)
      : await supabase.from("clients").insert(payload);
    if (err) { setError(err.message); setSaving(false); return; }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 ani-fade" onClick={onCancel}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 ani-scale">
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          {isEdit ? "تعديل عميل" : "إضافة عميل جديد"}
        </h2>
        {error && <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg mb-3 font-semibold">{error}</div>}

        <div className="space-y-3">
          <div><label className={labelClass}>اسم العميل *</label><input className={inputClass} value={form.name} onChange={e => set("name", e.target.value)} required /></div>
          <div><label className={labelClass}>الاسم التجاري</label><input className={inputClass} value={form.commercial_name} onChange={e => set("commercial_name", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>النوع</label>
              <select className={inputClass} value={form.operation_type} onChange={e => set("operation_type", e.target.value)}>
                <option value="transport">نقل</option>
                <option value="transport_and_sell">نقل وبيع</option>
              </select>
            </div>
            <div className="flex items-end pb-1"><label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="w-4 h-4 rounded" /> نشط
            </label></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>رقم السجل التجاري</label><input className={inputClass} value={form.cr_number} onChange={e => set("cr_number", e.target.value)} /></div>
            <div><label className={labelClass}>تاريخ انتهاء السجل</label><input type="date" className={inputClass} value={form.cr_expiry} onChange={e => set("cr_expiry", e.target.value)} dir="ltr" /></div>
          </div>
          <div><label className={labelClass}>ملاحظات</label><textarea className={inputClass} rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
        </div>

        <div className="flex gap-3 mt-5 pt-4 border-t">
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50">إلغاء</button>
          <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "جاري الحفظ..." : isEdit ? "تحديث" : "إضافة"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Site Form ──
function SiteForm({ clientId, site, onSave, onCancel }: {
  clientId: string;
  site: Partial<ClientSite> | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!site?.id;
  const [form, setForm] = useState({
    site_name: site?.site_name || "",
    site_type: site?.site_type || "branch",
    category: site?.category || "",
    is_classified: site?.is_classified ?? false,
    is_active: site?.is_active ?? true,
    region: site?.region || "",
    city: site?.city || "",
    detailed_address: site?.detailed_address || "",
    coordinates_url: site?.coordinates_url || "",
    base_transport_value: site?.base_transport_value?.toString() || "0",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));
  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm";
  const labelClass = "text-xs font-semibold text-slate-600 mb-1 block";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, client_id: clientId, base_transport_value: parseFloat(form.base_transport_value) || 0 };
    const { error } = isEdit
      ? await supabase.from("client_sites").update(payload).eq("id", site!.id)
      : await supabase.from("client_sites").insert(payload);
    if (error) { alert(error.message); setSaving(false); return; }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 ani-fade" onClick={onCancel}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 ani-scale">
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          {isEdit ? "تعديل موقع" : "إضافة موقع/محطة"}
        </h2>
        <div className="space-y-3">
          <div><label className={labelClass}>اسم الموقع *</label><input className={inputClass} value={form.site_name} onChange={e => set("site_name", e.target.value)} required /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={labelClass}>النوع</label>
              <select className={inputClass} value={form.site_type} onChange={e => set("site_type", e.target.value)}>
                <option value="branch">فرع/محطة</option><option value="admin">إدارة</option>
              </select>
            </div>
            <div><label className={labelClass}>الفئة</label><input className={inputClass} value={form.category} onChange={e => set("category", e.target.value)} placeholder="أ, ب, ج" /></div>
            <div className="flex items-end pb-1"><label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={form.is_classified} onChange={e => set("is_classified", e.target.checked)} className="w-4 h-4 rounded" /> مصنّف
            </label></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>المنطقة</label><input className={inputClass} value={form.region} onChange={e => set("region", e.target.value)} /></div>
            <div><label className={labelClass}>المدينة</label><input className={inputClass} value={form.city} onChange={e => set("city", e.target.value)} /></div>
          </div>
          <div><label className={labelClass}>العنوان التفصيلي</label><input className={inputClass} value={form.detailed_address} onChange={e => set("detailed_address", e.target.value)} /></div>
          <div><label className={labelClass}>إحداثيات / رابط جوجل</label><input className={inputClass} value={form.coordinates_url} onChange={e => set("coordinates_url", e.target.value)} dir="ltr" /></div>
          <div><label className={labelClass}>قيمة النقل الأساسية (ر.س)</label><input type="number" className={inputClass} value={form.base_transport_value} onChange={e => set("base_transport_value", e.target.value)} dir="ltr" /></div>
        </div>
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

// ── Client Detail Panel (sites + contacts + banks) ──
function ClientDetail({ client, onClose }: { client: Client; onClose: () => void }) {
  const [sites, setSites] = useState<ClientSite[]>([]);
  const [contacts, setContacts] = useState<SiteContact[]>([]);
  const [banks, setBanks] = useState<ClientBank[]>([]);
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [editSite, setEditSite] = useState<ClientSite | null>(null);

  const fetchAll = async () => {
    const { data: s } = await supabase.from("client_sites").select("*").eq("client_id", client.id).order("created_at");
    setSites((s as ClientSite[]) || []);
    if (s && s.length > 0) {
      const siteIds = s.map((x: ClientSite) => x.id);
      const { data: c } = await supabase.from("site_contacts").select("*").in("site_id", siteIds);
      setContacts((c as SiteContact[]) || []);
    }
    const { data: b } = await supabase.from("client_banks").select("*").eq("client_id", client.id);
    setBanks((b as ClientBank[]) || []);
  };

  useEffect(() => { fetchAll(); }, [client.id]);

  const deleteSite = async (id: string) => {
    if (!confirm("حذف هذا الموقع؟")) return;
    await supabase.from("client_sites").delete().eq("id", id);
    fetchAll();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center pt-6 ani-fade" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[88vh] overflow-y-auto p-6 ani-scale">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>🏢 {client.name}</h2>
            <p className="text-xs text-slate-400">{client.commercial_name || "—"} · {client.operation_type === "transport" ? "نقل" : "نقل وبيع"}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        {/* Sites */}
        <div className="border-t pt-4 mt-3">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold">📍 المواقع والمحطات ({sites.length})</h3>
            <button onClick={() => { setEditSite(null); setShowSiteForm(true); }}
              className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100">+ إضافة موقع</button>
          </div>

          {sites.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">لا توجد مواقع — أضف أول محطة</p>
          ) : (
            <div className="space-y-2">
              {sites.map(s => {
                const siteContacts = contacts.filter(c => c.site_id === s.id);
                return (
                  <div key={s.id} className="border border-slate-100 rounded-xl p-3 hover:border-slate-200 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {s.site_name}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            {s.site_type === "admin" ? "إدارة" : "فرع"}
                          </span>
                          {s.category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">فئة {s.category}</span>}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {s.city || "—"} · {s.region || "—"} · نقل: {s.base_transport_value} ر.س
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditSite(s); setShowSiteForm(true); }} className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">✏️</button>
                        <button onClick={() => deleteSite(s.id)} className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100">🗑️</button>
                      </div>
                    </div>
                    {siteContacts.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-50 flex flex-wrap gap-2">
                        {siteContacts.map(c => (
                          <span key={c.id} className="text-[10px] px-2 py-1 rounded bg-slate-50 text-slate-600">
                            👤 {c.name} {c.job_title ? `(${c.job_title})` : ""} {c.phone ? `· ${c.phone}` : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Banks */}
        {banks.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-bold mb-2">🏦 الحسابات البنكية</h3>
            <div className="space-y-1">
              {banks.map(b => (
                <div key={b.id} className="text-xs text-slate-600 p-2 rounded bg-slate-50">
                  {b.bank_name} · {b.account_name} · IBAN: <span dir="ltr">{b.iban}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showSiteForm && (
        <SiteForm clientId={client.id} site={editSite} onCancel={() => setShowSiteForm(false)} onSave={() => { setShowSiteForm(false); fetchAll(); }} />
      )}
    </div>
  );
}

// ── Main Page ──
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [siteCounts, setSiteCounts] = useState<Record<string, number>>({});

  const fetchClients = async () => {
    setLoading(true);
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    const cls = (data as Client[]) || [];
    setClients(cls);
    // Fetch site counts
    if (cls.length > 0) {
      const { data: sites } = await supabase.from("client_sites").select("client_id");
      const counts: Record<string, number> = {};
      (sites || []).forEach((s: { client_id: string }) => { counts[s.client_id] = (counts[s.client_id] || 0) + 1; });
      setSiteCounts(counts);
    }
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`حذف العميل "${name}" وجميع مواقعه؟`)) return;
    await supabase.from("clients").delete().eq("id", id);
    fetchClients();
  };

  return (
    <div className="ani-page">
      <PageHeader title="إدارة العملاء" subtitle={`${clients.length} عميل`}
        action={<button onClick={() => { setEditClient(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700">+ إضافة عميل</button>} />

      <div className="p-6">
        {loading ? (
          <div className="text-center py-20 text-slate-400"><div className="text-3xl mb-2 animate-pulse">⏳</div>جاري التحميل...</div>
        ) : clients.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white rounded-2xl shadow-sm">
            <div className="text-5xl mb-3">🏢</div>
            <p className="text-sm font-medium">لا يوجد عملاء</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden ani-up">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["العميل", "الاسم التجاري", "النوع", "السجل", "المواقع", "الحالة", "إجراء"].map(h => (
                    <th key={h} className="p-3 text-right border-b-2 border-slate-100 text-slate-400 text-[10.5px] font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="stg">
                {clients.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setDetailClient(c)}>
                    <td className="p-3 border-b border-slate-100 font-semibold text-sm">{c.name}</td>
                    <td className="p-3 border-b border-slate-100 text-xs text-slate-500">{c.commercial_name || "—"}</td>
                    <td className="p-3 border-b border-slate-100">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                        background: c.operation_type === "transport" ? "#EFF6FF" : "#F3E8FF",
                        color: c.operation_type === "transport" ? "#2563EB" : "#7C3AED",
                      }}>{c.operation_type === "transport" ? "نقل" : "نقل وبيع"}</span>
                    </td>
                    <td className="p-3 border-b border-slate-100 text-xs text-slate-500">{c.cr_number || "—"}</td>
                    <td className="p-3 border-b border-slate-100">
                      <span className="text-xs font-bold text-blue-600">{siteCounts[c.id] || 0}</span>
                      <span className="text-[10px] text-slate-400 mr-1">موقع</span>
                    </td>
                    <td className="p-3 border-b border-slate-100">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                        background: c.is_active ? "#DCFCE7" : "#FEE2E2",
                        color: c.is_active ? "#16A34A" : "#DC2626",
                      }}>{c.is_active ? "نشط" : "غير نشط"}</span>
                    </td>
                    <td className="p-3 border-b border-slate-100" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1.5">
                        <button onClick={() => setDetailClient(c)} className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">📍 المواقع</button>
                        <button onClick={() => { setEditClient(c); setShowForm(true); }} className="text-[10px] text-slate-600 bg-slate-50 px-2 py-1 rounded hover:bg-slate-100">✏️</button>
                        <button onClick={() => handleDelete(c.id, c.name)} className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && <ClientForm client={editClient} onCancel={() => setShowForm(false)} onSave={() => { setShowForm(false); fetchClients(); }} />}
      {detailClient && <ClientDetail client={detailClient} onClose={() => { setDetailClient(null); fetchClients(); }} />}
    </div>
  );
}
