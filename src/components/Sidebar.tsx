"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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
  const [open, setOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ═══ Mobile Hamburger Button — CSS-controlled visibility ═══ */}
      <button
        onClick={() => setOpen(true)}
        className="sidebar-hamburger"
        aria-label="فتح القائمة"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* ═══ Mobile Backdrop ═══ */}
      <div
        className={`sidebar-backdrop ${open ? "sidebar-backdrop-open" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* ═══ Sidebar ═══ */}
      <aside className={`sidebar-panel ${open ? "sidebar-panel-open" : ""}`}>

        {/* Logo + Close */}
        <div className="p-6 pb-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
            style={{
              background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
              boxShadow: "0 4px 16px rgba(29, 78, 216, 0.4)",
            }}>
            <span className="text-white text-lg">⛽</span>
          </div>
          <div className="flex-1">
            <div className="font-bold text-[17px] text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>NaqlFlow</div>
            <div className="text-[10px] text-[#475569] tracking-wider font-medium" style={{ fontFamily: "var(--font-data)" }}>نقل فلو · v4.0</div>
          </div>
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="sidebar-close-btn"
            aria-label="إغلاق القائمة"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, margin: "0 20px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />

        {/* Nav label */}
        <div className="section-label" style={{ marginTop: 20 }}>التشغيل</div>

        {/* Main Nav */}
        <nav className="flex-1 px-3">
          {NAV_ITEMS.map((n) => {
            const isActive = pathname === n.id || (n.id !== "/" && pathname.startsWith(n.id));
            return (
              <Link key={n.id} href={n.id}
                className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
                style={{
                  color: isActive ? "#93C5FD" : "#94A3B8",
                  fontWeight: isActive ? 600 : 400,
                }}>
                <span className="text-base" style={{ filter: isActive ? "none" : "grayscale(0.3)" }}>{n.icon}</span>
                <span className="flex-1">{n.label}</span>
              </Link>
            );
          })}

          {/* Separator */}
          <div style={{ height: 1, margin: "12px 8px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }} />

          <div className="section-label">إدارة</div>

          {BOTTOM_ITEMS.map((n) => {
            const isActive = pathname === n.id;
            return (
              <Link key={n.id} href={n.id}
                className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
                style={{
                  color: isActive ? "#93C5FD" : "#94A3B8",
                  fontWeight: isActive ? 600 : 400,
                }}>
                <span className="text-base">{n.icon}</span>
                <span className="flex-1">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 mx-3 mb-3 rounded-lg flex items-center gap-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.03)",
          }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
              boxShadow: "0 2px 8px rgba(29, 78, 216, 0.3)",
            }}>
            م
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-semibold text-white/90">المشرف العام</div>
            <div className="text-[10px] text-[#475569]" style={{ fontFamily: "var(--font-data)" }}>admin@naqlflow.sa</div>
          </div>
          <button className="text-[#475569] hover:text-white/70 transition-colors text-sm cursor-pointer">⚡</button>
        </div>
      </aside>
    </>
  );
}
