"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { id: "/", icon: "🏠", label: "لوحة التحكم" },
  { id: "/orders", icon: "📋", label: "الطلبات" },
  { id: "/drivers", icon: "👤", label: "السائقين" },
  { id: "/vehicles", icon: "🚛", label: "الصهاريج" },
  { id: "/clients", icon: "🏢", label: "العملاء" },
  { id: "/pricing", icon: "💰", label: "قوائم الأسعار" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 right-0 h-screen flex flex-col bg-[#0F172A] text-white z-50"
      style={{ width: "var(--sidebar-width)" }}>
      {/* Logo */}
      <div className="p-5 pb-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-sm shrink-0"
          style={{ fontFamily: "var(--font-display)" }}>نق</div>
        <div>
          <div className="font-bold text-[15px]" style={{ fontFamily: "var(--font-display)" }}>نقل فلو</div>
          <div className="text-[9.5px] text-[#4B5A77] tracking-wider">NaqlFlow v3.0</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 pt-2">
        <div className="px-5 py-2 text-[9px] text-[#3D4B66] uppercase tracking-[2px] font-bold">التشغيل</div>
        {NAV_ITEMS.map((n) => {
          const isActive = pathname === n.id || (pathname.startsWith(n.id) && n.id !== "/");
          return (
            <Link key={n.id} href={n.id}
              className="flex items-center gap-3 px-5 py-[10px] text-[13px] transition-all duration-150 no-underline"
              style={{
                background: isActive ? "rgba(37,99,235,0.12)" : "transparent",
                color: isActive ? "#93C5FD" : "#6B7A99",
                borderLeft: isActive ? "3px solid #3B82F6" : "3px solid transparent",
                fontWeight: isActive ? 600 : 400,
              }}>
              <span className="text-base">{n.icon}</span>
              <span className="flex-1">{n.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center text-xs font-bold text-[#6B7A99]">م</div>
        <div>
          <div className="text-xs font-semibold">المشرف العام</div>
          <div className="text-[9.5px] text-[#4B5A77]">admin@naqlflow.sa</div>
        </div>
      </div>
    </aside>
  );
}
