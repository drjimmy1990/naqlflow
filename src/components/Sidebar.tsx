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

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (open) {
      document.body.classList.add("sidebar-open-lock");
    } else {
      document.body.classList.remove("sidebar-open-lock");
    }
    return () => { document.body.classList.remove("sidebar-open-lock"); };
  }, [open]);

  return (
    <>
      {/* 
        CRITICAL: Inline <style> ensures responsive rules are ALWAYS present,
        regardless of CSS file loading order or caching.
        Desktop (>=1024px): sidebar visible, hamburger hidden
        Mobile (<1024px): sidebar hidden by default, hamburger visible
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        .sb-hamburger { 
          display: flex; 
          position: fixed; top: 12px; right: 12px; z-index: 61;
          width: 44px; height: 44px; border-radius: 12px;
          align-items: center; justify-content: center;
          background: linear-gradient(135deg, #0B1120, #1E293B);
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
        }
        .sb-close { 
          display: flex; 
          width: 32px; height: 32px; border-radius: 8px;
          align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06); color: #94A3B8;
          border: none; cursor: pointer; font-size: 14px;
        }
        .sb-close:hover { background: rgba(255,255,255,0.12); }
        .sb-panel {
          position: fixed; top: 0; right: 0; z-index: 60;
          width: 280px; height: 100vh; height: 100dvh;
          display: flex; flex-direction: column;
          background: linear-gradient(180deg, #0B1120 0%, #0F172A 50%, #131B2E 100%);
          box-shadow: -4px 0 20px rgba(0,0,0,0.15);
          transform: translateX(100%);
          transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sb-panel.sb-open { transform: translateX(0); }
        .sb-backdrop {
          position: fixed; inset: 0; z-index: 55;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
          opacity: 0; pointer-events: none;
          transition: opacity 300ms ease;
        }
        .sb-backdrop.sb-open { opacity: 1; pointer-events: auto; }
        .sidebar-open-lock { overflow: hidden !important; }

        @media (min-width: 1024px) {
          .sb-panel { 
            transform: translateX(0) !important; 
            width: 260px;
          }
          .sb-hamburger { display: none !important; }
          .sb-close { display: none !important; }
          .sb-backdrop { display: none !important; }
        }
      `}} />

      {/* Hamburger — hidden on desktop via inline CSS above */}
      <button className="sb-hamburger" onClick={() => setOpen(true)} aria-label="فتح القائمة">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Backdrop */}
      <div className={`sb-backdrop ${open ? "sb-open" : ""}`} onClick={() => setOpen(false)} />

      {/* Sidebar Panel — hidden by default, shown on desktop via CSS */}
      <aside className={`sb-panel ${open ? "sb-open" : ""}`}>

        {/* Logo + Close */}
        <div style={{ padding: "24px 24px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
            boxShadow: "0 4px 16px rgba(29, 78, 216, 0.4)",
            flexShrink: 0
          }}>
            <span style={{ color: "#fff", fontSize: 18 }}>⛽</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: "-0.02em" }}>NaqlFlow</div>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1.5, fontWeight: 500 }}>نقل فلو · v4.1</div>
          </div>
          <button className="sb-close" onClick={() => setOpen(false)} aria-label="إغلاق القائمة">✕</button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, margin: "0 20px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />

        {/* Nav label */}
        <div className="section-label" style={{ marginTop: 20 }}>التشغيل</div>

        {/* Main Nav */}
        <nav style={{ flex: 1, padding: "0 12px" }}>
          {NAV_ITEMS.map((n) => {
            const isActive = pathname === n.id || (n.id !== "/" && pathname.startsWith(n.id));
            return (
              <Link key={n.id} href={n.id}
                className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
                style={{
                  color: isActive ? "#93C5FD" : "#94A3B8",
                  fontWeight: isActive ? 600 : 400,
                }}>
                <span style={{ fontSize: 16, filter: isActive ? "none" : "grayscale(0.3)" }}>{n.icon}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
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
                <span style={{ fontSize: 16 }}>{n.icon}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: 16, margin: "0 12px 12px", borderRadius: 8,
          display: "flex", alignItems: "center", gap: 12,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.03)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff",
            background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
            boxShadow: "0 2px 8px rgba(29, 78, 216, 0.3)",
          }}>م</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>المشرف العام</div>
            <div style={{ fontSize: 10, color: "#475569" }}>admin@naqlflow.sa</div>
          </div>
        </div>
      </aside>
    </>
  );
}
