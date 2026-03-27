"use client";

import { supabase } from "@/lib/supabase";
import type { PriceList, Client, FuelType } from "@/lib/types";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

export default function PricingPage() {
  const [prices, setPrices] = useState<(PriceList & { client_name?: string; fuel_name?: string })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [fuelFilter, setFuelFilter] = useState<string>("all");

  // Form state
  const [form, setForm] = useState({ client_id: "", fuel_type_id: "", capacity_liters: "", liter_increase: "", total_price: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const fetchAll = async () => {
    setLoading(true);
    const [pRes, cRes, fRes] = await Promise.all([
      supabase.from("price_lists").select("*").order("client_id"),
      supabase.from("clients").select("*").order("name"),
      supabase.from("fuel_types").select("*").order("name"),
    ]);
    const clientMap = Object.fromEntries(((cRes.data || []) as Client[]).map(c => [c.id, c.name]));
    const fuelMap = Object.fromEntries(((fRes.data || []) as FuelType[]).map(f => [f.id, f.name]));
    const enriched = ((pRes.data || []) as PriceList[]).map(p => ({
      ...p, client_name: clientMap[p.client_id] || "—", fuel_name: fuelMap[p.fuel_type_id] || "—",
    }));
    setPrices(enriched);
    setClients((cRes.data as Client[]) || []);
    setFuelTypes((fRes.data as FuelType[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setForm({ client_id: "", fuel_type_id: "", capacity_liters: "", liter_increase: "", total_price: "" });
    setEditId(null); setError(""); setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.fuel_type_id || !form.capacity_liters || !form.total_price) {
      setError("جميع الحقول مطلوبة"); return;
    }
    setSaving(true);
    const payload = {
      client_id: form.client_id,
      fuel_type_id: form.fuel_type_id,
      capacity_liters: parseInt(form.capacity_liters),
      liter_increase: form.liter_increase ? parseFloat(form.liter_increase) : null,
      total_price: parseFloat(form.total_price),
    };
    const { error: err } = editId
      ? await supabase.from("price_lists").update(payload).eq("id", editId)
      : await supabase.from("price_lists").insert(payload);
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false); resetForm(); fetchAll();
  };

  const startEdit = (p: PriceList) => {
    setForm({
      client_id: p.client_id, fuel_type_id: p.fuel_type_id,
      capacity_liters: p.capacity_liters.toString(),
      liter_increase: p.liter_increase?.toString() || "",
      total_price: p.total_price.toString(),
    });
    setEditId(p.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذا السعر؟")) return;
    await supabase.from("price_lists").delete().eq("id", id);
    fetchAll();
  };

  const filtered = fuelFilter === "all" ? prices : prices.filter(p => p.fuel_type_id === fuelFilter);

  // Group by client for matrix view
  const grouped: Record<string, typeof prices> = {};
  filtered.forEach(p => {
    const key = p.client_name || p.client_id;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm";
  const labelClass = "text-xs font-semibold text-slate-600 mb-1 block";

  return (
    <div className="ani-page">
      <PageHeader title="قوائم الأسعار" subtitle={`${prices.length} سعر — عميل × صنف × حجم`}
        action={<button onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary text-[12px]">+ إضافة سعر</button>} />

      <div className="p-6">
        {/* Fuel Filter */}
        <div className="flex gap-2 mb-4 ani-up">
          <button onClick={() => setFuelFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${fuelFilter === "all" ? "text-white" : "hover:shadow-sm"}`}
            style={fuelFilter === "all" ? { background: "linear-gradient(135deg, var(--primary), var(--primary-container))", boxShadow: "0 2px 8px rgba(0,88,190,0.2)" } : { background: "var(--surface-card)", color: "var(--text-secondary)", border: "1px solid rgba(194,198,214,0.15)" }}>
            الكل ({prices.length})
          </button>
          {fuelTypes.map(f => (
            <button key={f.id} onClick={() => setFuelFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${fuelFilter === f.id ? "text-white" : "hover:shadow-sm"}`}
              style={fuelFilter === f.id ? { background: "linear-gradient(135deg, var(--primary), var(--primary-container))", boxShadow: "0 2px 8px rgba(0,88,190,0.2)" } : { background: "var(--surface-card)", color: "var(--text-secondary)", border: "1px solid rgba(194,198,214,0.15)" }}>
              {f.name}
            </button>
          ))}
        </div>

        {/* Add/Edit Form (inline) */}
        {showForm && (
          <form onSubmit={handleSubmit} className="form-section mb-4 ani-scale" style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <div className="form-section-title" style={{ marginBottom: "16px" }}>💰 {editId ? "تعديل سعر" : "إضافة سعر جديد"}</div>
            {error && <div className="p-3 rounded-md mb-4 text-[12px] font-semibold" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>⚠️ {error}</div>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">العميل *</label>
                <select className="input-field" value={form.client_id} onChange={e => set("client_id", e.target.value)} required>
                  <option value="">— اختر —</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">نوع الوقود *</label>
                <select className="input-field" value={form.fuel_type_id} onChange={e => set("fuel_type_id", e.target.value)} required>
                  <option value="">— اختر —</option>{fuelTypes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">حجم الصهريج (لتر) *</label>
                <select className="input-field" value={form.capacity_liters} onChange={e => set("capacity_liters", e.target.value)} required>
                  <option value="">— اختر —</option>
                  {[20000, 22000, 32000, 36000].map(c => <option key={c} value={c}>{(c/1000)}K — {c.toLocaleString()} لتر</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">زيادة اللتر</label>
                <input type="number" step="0.001" className="input-field" value={form.liter_increase} onChange={e => set("liter_increase", e.target.value)} dir="ltr" />
              </div>
              <div className="form-group">
                <label className="form-label">السعر الإجمالي (ر.س) *</label>
                <input type="number" step="0.01" className="input-field" value={form.total_price} onChange={e => set("total_price", e.target.value)} required dir="ltr" />
              </div>
            </div>
            <div className="flex gap-3 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 rounded-md text-[13px] disabled:opacity-50">
                {saving ? "..." : editId ? "✦ تحديث" : "✦ إضافة"}</button>
              <button type="button" onClick={resetForm} className="btn-ghost px-5 py-2.5 rounded-md text-[13px]">إلغاء</button>
            </div>
          </form>
        )}

        {/* Matrix View grouped by client */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 animate-pulse">⏳ جاري التحميل...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white rounded-lg shadow-sm">
            <div className="text-5xl mb-3">💰</div>
            <p className="text-sm font-medium">لا توجد أسعار</p>
          </div>
        ) : (
          <div className="space-y-4 stg">
            {Object.entries(grouped).map(([clientName, items]) => (
              <div key={clientName} className="card overflow-hidden">
                <div className="px-5 py-3 flex items-center gap-2" style={{ background: "var(--surface-low)", borderBottom: "1px solid rgba(194,198,214,0.10)" }}>
                  <span className="font-bold text-[14px]" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>🏢 {clientName}</span>
                  <span className="chip text-[10px]" style={{ background: "var(--primary-fixed)", color: "var(--primary)" }}>({items.length} تسعيرة)</span>
                </div>
                <table className="table-premium" style={{ tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "25%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "25%" }} />
                    <col style={{ width: "15%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>نوع الوقود</th>
                      <th>حجم الصهريج</th>
                      <th>زيادة اللتر</th>
                      <th>السعر الإجمالي</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(p => (
                      <tr key={p.id}>
                        <td className="font-semibold">{p.fuel_name}</td>
                        <td>
                          <span className="font-bold" style={{ color: "var(--primary)", fontFamily: "var(--font-data)" }}>{(p.capacity_liters / 1000).toFixed(0)}K</span>
                          <span className="text-[11px] mr-1" style={{ color: "var(--text-faint)" }}>{p.capacity_liters.toLocaleString()} لتر</span>
                        </td>
                        <td>
                          <span className="font-semibold" style={{ color: "var(--warning)", fontFamily: "var(--font-data)" }}>{p.liter_increase || "—"}</span>
                        </td>
                        <td>
                          <span className="font-bold" style={{ color: "var(--success)", fontFamily: "var(--font-data)" }}>
                            ✦ {p.total_price.toLocaleString()}
                          </span>
                          <span className="text-[10px] mr-1" style={{ color: "var(--text-faint)" }}>ر.س</span>
                        </td>
                        <td>
                          <div className="flex gap-1.5">
                            <button onClick={() => startEdit(p)} title="تعديل"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] transition-all"
                              style={{ background: "var(--primary-fixed)", color: "var(--primary)" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "white"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--primary-fixed)"; e.currentTarget.style.color = "var(--primary)"; }}>✏️</button>
                            <button onClick={() => handleDelete(p.id)} title="حذف"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] transition-all"
                              style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--danger)"; e.currentTarget.style.color = "white"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--danger-bg)"; e.currentTarget.style.color = "var(--danger)"; }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
