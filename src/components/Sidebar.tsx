"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { id: "/", icon: "📊", label: "لوحة التحكم" },
  { id: "/orders", icon: "📋", label: "الطلبات" },
  { id: "/drivers", icon: "👤", label: "السائقين" },
  { id: "/vehicles", icon: "🚛", label: "الصهاريج" },
  { id: "/clients", icon: "🏢", label: "العملاء" },
  { id: "/pricing", icon: "💰", label: "قوائم الأسعار" },
];

const BOTTOM_ITEMS = [
  { id: "/reports", icon: "📈", label: "التقارير" },
  { id: "/settings", icon: "⚙️", label: "الإعدادات" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 right-0 h-screen flex flex-col z-50"
      style={{
        width: "var(--sidebar-width)",
        background: "linear-gradient(180deg, #0B1120 0%, #111827 100%)",
      }}>

      {/* Logo */}
      <div className="p-6 pb-5 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 gradient-blue shadow-lg"
          style={{ fontFamily: "var(--font-display)", boxShadow: "0 4px 16px rgba(0, 88, 190, 0.35)" }}>
          <span className="text-white text-lg">⛽</span>
        </div>
        <div>
          <div className="font-bold text-[16px] text-white" style={{ fontFamily: "var(--font-display)" }}>NaqlFlow</div>
          <div className="text-[10px] text-[#4B5A77] tracking-wider font-medium" style={{ fontFamily: "var(--font-data)" }}>نقل فلو · v3.0</div>
        </div>
      </div>

      {/* Tonal divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />

      {/* Nav label */}
      <div className="px-6 pt-5 pb-2 text-[10px] text-[#3D4B66] uppercase tracking-[2.5px] font-bold"
        style={{ fontFamily: "var(--font-data)" }}>التشغيل</div>

      {/* Main Nav */}
      <nav className="flex-1 px-3">
        {NAV_ITEMS.map((n) => {
          const isActive = pathname === n.id || (pathname.startsWith(n.id) && n.id !== "/");
          return (
            <Link key={n.id} href={n.id}
              className="flex items-center gap-3 px-4 py-2.5 mb-0.5 rounded-xl text-[13px] transition-all duration-200 no-underline group"
              style={{
                background: isActive ? "rgba(0, 88, 190, 0.15)" : "transparent",
                color: isActive ? "#ADC6FF" : "#6B7A99",
                fontWeight: isActive ? 600 : 400,
              }}>
              <span className="text-base transition-transform duration-200 group-hover:scale-110">{n.icon}</span>
              <span className="flex-1">{n.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#3B82F6", boxShadow: "0 0 8px rgba(59,130,246,0.6)" }} />
              )}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="my-3" style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }} />

        <div className="px-4 pb-2 text-[10px] text-[#3D4B66] uppercase tracking-[2.5px] font-bold"
          style={{ fontFamily: "var(--font-data)" }}>إدارة</div>

        {BOTTOM_ITEMS.map((n) => {
          const isActive = pathname === n.id;
          return (
            <Link key={n.id} href={n.id}
              className="flex items-center gap-3 px-4 py-2.5 mb-0.5 rounded-xl text-[13px] transition-all duration-200 no-underline group"
              style={{
                background: isActive ? "rgba(0, 88, 190, 0.15)" : "transparent",
                color: isActive ? "#ADC6FF" : "#6B7A99",
                fontWeight: isActive ? 600 : 400,
              }}>
              <span className="text-base">{n.icon}</span>
              <span className="flex-1">{n.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 mx-3 mb-3 rounded-xl flex items-center gap-3"
        style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold gradient-blue text-white"
          style={{ boxShadow: "0 2px 8px rgba(0, 88, 190, 0.25)" }}>
          م
        </div>
        <div className="flex-1">
          <div className="text-[12px] font-semibold text-white/90">المشرف العام</div>
          <div className="text-[10px] text-[#4B5A77]" style={{ fontFamily: "var(--font-data)" }}>admin@naqlflow.sa</div>
        </div>
        <button className="text-[#4B5A77] hover:text-white/70 transition-colors text-sm">⚡</button>
      </div>
    </aside>
  );
}
