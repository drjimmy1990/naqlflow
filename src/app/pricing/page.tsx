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
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700">+ إضافة سعر</button>} />

      <div className="p-6">
        {/* Fuel Filter */}
        <div className="flex gap-2 mb-4 ani-up">
          <button onClick={() => setFuelFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${fuelFilter === "all" ? "bg-blue-600 text-white" : "bg-white border border-slate-200 hover:border-slate-300"}`}>
            الكل ({prices.length})
          </button>
          {fuelTypes.map(f => (
            <button key={f.id} onClick={() => setFuelFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${fuelFilter === f.id ? "bg-blue-600 text-white" : "bg-white border border-slate-200 hover:border-slate-300"}`}>
              {f.name}
            </button>
          ))}
        </div>

        {/* Add/Edit Form (inline) */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-5 mb-4 ani-scale">
            <h3 className="text-sm font-bold mb-3">{editId ? "تعديل سعر" : "إضافة سعر جديد"}</h3>
            {error && <div className="bg-red-50 text-red-700 text-xs p-2 rounded-lg mb-3">{error}</div>}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div><label className={labelClass}>العميل *</label>
                <select className={inputClass} value={form.client_id} onChange={e => set("client_id", e.target.value)} required>
                  <option value="">اختر</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select></div>
              <div><label className={labelClass}>نوع الوقود *</label>
                <select className={inputClass} value={form.fuel_type_id} onChange={e => set("fuel_type_id", e.target.value)} required>
                  <option value="">اختر</option>{fuelTypes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select></div>
              <div><label className={labelClass}>حجم الصهريج (لتر) *</label>
                <select className={inputClass} value={form.capacity_liters} onChange={e => set("capacity_liters", e.target.value)} required>
                  <option value="">اختر</option>
                  {[20000, 22000, 32000, 36000].map(c => <option key={c} value={c}>{(c/1000)}K — {c.toLocaleString()} لتر</option>)}
                </select></div>
              <div><label className={labelClass}>زيادة اللتر</label>
                <input type="number" step="0.001" className={inputClass} value={form.liter_increase} onChange={e => set("liter_increase", e.target.value)} dir="ltr" /></div>
              <div><label className={labelClass}>السعر الإجمالي (ر.س) *</label>
                <input type="number" step="0.01" className={inputClass} value={form.total_price} onChange={e => set("total_price", e.target.value)} required dir="ltr" /></div>
            </div>
            <div className="flex gap-2 mt-3">
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white disabled:opacity-50">
                {saving ? "..." : editId ? "تحديث" : "إضافة"}</button>
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200">إلغاء</button>
            </div>
          </form>
        )}

        {/* Matrix View grouped by client */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 animate-pulse">⏳ جاري التحميل...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white rounded-2xl shadow-sm">
            <div className="text-5xl mb-3">💰</div>
            <p className="text-sm font-medium">لا توجد أسعار</p>
          </div>
        ) : (
          <div className="space-y-4 stg">
            {Object.entries(grouped).map(([clientName, items]) => (
              <div key={clientName} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 font-bold text-sm flex items-center gap-2">
                  🏢 {clientName}
                  <span className="text-[10px] font-normal text-slate-400">({items.length} تسعيرة)</span>
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {["نوع الوقود", "حجم الصهريج", "زيادة اللتر", "السعر الإجمالي", ""].map(h => (
                        <th key={h} className="p-3 text-right border-b border-slate-100 text-slate-400 text-[10.5px] font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 border-b border-slate-100 text-xs font-semibold">{p.fuel_name}</td>
                        <td className="p-3 border-b border-slate-100 text-xs" dir="ltr">
                          <span className="font-bold text-blue-600">{(p.capacity_liters / 1000).toFixed(0)}K</span>
                          <span className="text-slate-400 mr-1">{p.capacity_liters.toLocaleString()} لتر</span>
                        </td>
                        <td className="p-3 border-b border-slate-100 text-xs font-semibold text-amber-600" dir="ltr">
                          {p.liter_increase || "—"}
                        </td>
                        <td className="p-3 border-b border-slate-100 text-xs font-bold text-green-700" dir="ltr" style={{ fontFamily: "var(--font-display)" }}>
                          {p.total_price.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ر.س</span>
                        </td>
                        <td className="p-3 border-b border-slate-100">
                          <div className="flex gap-1">
                            <button onClick={() => startEdit(p)} className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">✏️</button>
                            <button onClick={() => handleDelete(p.id)} className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100">🗑️</button>
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
