"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import type { Order, Client, Driver, OrderStatus } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/types";

// ── KPI Card ──
function KPICard({ label, value, icon, gradient, subtitle }: {
  label: string; value: string | number; icon: string; gradient: string; subtitle?: string;
}) {
  return (
    <div className="kpi-card flex-1 min-w-[180px] flex items-center gap-4 ani-up">
      <div className={`w-12 h-12 rounded-md flex items-center justify-center text-xl text-white shrink-0 ${gradient}`}
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}>
        {icon}
      </div>
      <div>
        <div className="data-number text-[28px] leading-none" style={{ color: "var(--text-primary)" }}>
          {value}
        </div>
        <div className="text-[12px] font-medium mt-1" style={{ color: "var(--text-muted)" }}>{label}</div>
        {subtitle && <div className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>{subtitle}</div>}
      </div>
    </div>
  );
}

// ── Quick Stats Row ──
function QuickStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-md transition-colors hover:bg-slate-50/50">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}40` }} />
      <span className="flex-1 text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span className="data-number text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<(Order & { client_name?: string })[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, drivers: 0, clients: 0 });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      const [ordersRes, driversRes, clientsRes] = await Promise.all([
        supabase.from("orders").select("*, clients(name)").order("created_at", { ascending: false }).limit(6),
        supabase.from("drivers").select("id").eq("is_active", true),
        supabase.from("clients").select("id").eq("is_active", true),
      ]);

      const allOrders = (ordersRes.data || []) as (Order & { clients?: { name: string } })[];
      const enriched = allOrders.map(o => ({ ...o, client_name: o.clients?.name || "—" }));

      // Status counts from all orders
      const allOrdersRes = await supabase.from("orders").select("status");
      const statuses = (allOrdersRes.data || []) as { status: OrderStatus }[];
      const counts: Record<string, number> = {};
      statuses.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });

      const activeStatuses = ["aramco_loading", "sealed", "in_transit", "arrived", "delivering"];
      const activeCount = statuses.filter(o => activeStatuses.includes(o.status)).length;
      const pendingCount = counts["pending_financial"] || 0;

      setOrders(enriched);
      setStats({
        total: statuses.length,
        active: activeCount,
        pending: pendingCount,
        drivers: (driversRes.data || []).length,
        clients: (clientsRes.data || []).length,
      });
      setStatusCounts(counts);
      setLoading(false);
    };
    loadAll();
  }, []);

  return (
    <div className="ani-page">
      <PageHeader title="لوحة التحكم" subtitle="نظرة عامة على عمليات اليوم" />

      <div className="p-4 lg:p-8">
        {/* KPIs */}
        <div className="flex gap-4 flex-wrap mb-6">
          <KPICard label="إجمالي الطلبات" value={stats.total} icon="📋" gradient="gradient-blue" />
          <KPICard label="طلبات نشطة" value={stats.active} icon="🚚" gradient="gradient-green" subtitle="في مراحل التنفيذ" />
          <KPICard label="مراجعة مالية" value={stats.pending} icon="⏳" gradient="gradient-amber" />
          <KPICard label="سائقين نشطين" value={stats.drivers} icon="👤" gradient="gradient-purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
          {/* Recent Orders */}
          <div className="card p-0 ani-up overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4">
              <h3 className="text-[15px] font-bold m-0" style={{ fontFamily: "var(--font-display)" }}>آخر الطلبات</h3>
              <Link href="/orders" className="btn-ghost text-[12px] px-4 py-2 rounded-md no-underline">
                عرض الكل ←
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-16 animate-pulse" style={{ color: "var(--text-faint)" }}>⏳ جاري التحميل...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>لا توجد طلبات بعد</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>نفّذ seed.sql لإضافة بيانات تجريبية</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table className="table-premium" style={{ minWidth: 500 }}>
                <thead>
                  <tr>
                    {["رقم الطلب", "العميل", "الحالة", "المبلغ"].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="stg">
                  {orders.slice(0, 6).map(o => (
                    <tr key={o.id}>
                      <td>
                        <span className="data-number text-[13px] font-bold" style={{ color: "var(--primary)" }}>{o.order_number}</span>
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)", fontFamily: "var(--font-data)" }}>
                          {new Date(o.created_at).toLocaleDateString("ar-SA")}
                        </div>
                      </td>
                      <td className="font-semibold">{o.client_name}</td>
                      <td><StatusBadge status={o.status} size="sm" /></td>
                      <td>
                        <span className="data-number text-[13px] font-bold">
                          {o.total_price ? `${o.total_price.toLocaleString()} ر.س` : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="flex flex-col gap-4">
            {/* Status Distribution */}
            <div className="card p-5 ani-left">
              <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                📊 توزيع الحالات
              </h3>
              <div className="space-y-0.5">
                {(["draft", "pending_financial", "financial_approved", "in_transit", "delivering", "delivered", "closed"] as OrderStatus[]).map(s => {
                  const cfg = STATUS_CONFIG[s];
                  const count = statusCounts[s] || 0;
                  if (count === 0 && !["draft", "closed"].includes(s)) return null;
                  return (
                    <QuickStat key={s} label={cfg.label} value={count} color={cfg.color} />
                  );
                })}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-lg p-6 text-white text-center ani-left"
              style={{ background: "linear-gradient(150deg, #0B1120 0%, #1E293B 100%)", boxShadow: "var(--shadow-lg)" }}>
              <div className="text-3xl mb-2">🗺️</div>
              <div className="font-bold text-[14px]" style={{ fontFamily: "var(--font-display)" }}>
                خريطة المركبات
              </div>
              <div className="text-[10.5px] text-[#4B5A77] mt-1" style={{ fontFamily: "var(--font-data)" }}>
                تتبع مباشر — قريباً
              </div>
              <div className="flex gap-1.5 justify-center mt-4">
                {["المدينة", "حائل", "القصيم", "ينبع"].map(c => (
                  <span key={c} className="px-2.5 py-1 rounded-lg text-[10px] font-medium"
                    style={{ background: "rgba(96,165,250,0.12)", color: "#60A5FA" }}>{c}</span>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="card p-5 ani-left">
              <h3 className="text-[14px] font-bold mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                ⚡ وصول سريع
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: "/orders", icon: "📋", label: "طلب جديد" },
                  { href: "/drivers", icon: "👤", label: "السائقين" },
                  { href: "/vehicles", icon: "🚛", label: "الصهاريج" },
                  { href: "/clients", icon: "🏢", label: "العملاء" },
                ].map(l => (
                  <Link key={l.href} href={l.href}
                    className="flex items-center gap-2 p-3 rounded-md text-[12px] font-medium no-underline transition-all duration-150"
                    style={{ background: "var(--surface-low)", color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--primary-fixed)"; (e.currentTarget as HTMLElement).style.color = "var(--primary)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-low)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                  >
                    <span className="text-base">{l.icon}</span>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
