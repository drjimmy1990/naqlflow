"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV = [
  { id: "/", icon: "📊", label: "لوحة التحكم" },
  { id: "/orders", icon: "📋", label: "الطلبات" },
  { id: "/drivers", icon: "👤", label: "السائقين" },
  { id: "/vehicles", icon: "🚛", label: "الصهاريج" },
  { id: "/clients", icon: "🏢", label: "العملاء" },
  { id: "/pricing", icon: "💰", label: "قوائم الأسعار" },
];

const MGMT = [
  { id: "/reports", icon: "📈", label: "التقارير" },
  { id: "/settings", icon: "⚙️", label: "الإعدادات" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect desktop via matchMedia (runs only on client)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    if (open && !isDesktop) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, isDesktop]);

  // Determine if sidebar is visible
  const sidebarVisible = isDesktop || open;

  const navItem = (n: { id: string; icon: string; label: string }) => {
    const active = pathname === n.id || (n.id !== "/" && pathname.startsWith(n.id));
    return (
      <Link
        key={n.id}
        href={n.id}
        onClick={() => { if (!isDesktop) setOpen(false); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          borderRadius: 8,
          textDecoration: "none",
          fontSize: 14,
          color: active ? "#93C5FD" : "#94A3B8",
          fontWeight: active ? 600 : 400,
          background: active ? "rgba(59,130,246,0.08)" : "transparent",
          borderRight: active ? "3px solid #3B82F6" : "3px solid transparent",
          transition: "background 150ms ease",
        }}
      >
        <span style={{ fontSize: 16, filter: active ? "none" : "grayscale(0.3)" }}>{n.icon}</span>
        <span style={{ flex: 1 }}>{n.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* ═══ HAMBURGER BUTTON ═══ 
          Visible ONLY when: not desktop AND sidebar is closed
          Uses 100% inline styles — no CSS classes */}
      {!isDesktop && !open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="فتح القائمة"
          style={{
            position: "fixed",
            top: 12,
            right: 12,
            zIndex: 70,
            width: 44,
            height: 44,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0B1120, #1E293B)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* ═══ BACKDROP ═══ 
          Visible ONLY when: mobile AND sidebar is open */}
      {!isDesktop && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 55,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* ═══ SIDEBAR PANEL ═══ 
          Desktop: always visible, inline transform: none
          Mobile: hidden via transform, slides in when open=true
          100% inline styles — impossible to override by any CSS */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 60,
          width: isDesktop ? 260 : 280,
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #0B1120 0%, #0F172A 50%, #131B2E 100%)",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
          transform: sidebarVisible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Logo + Close */}
        <div style={{ padding: "24px 24px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
            boxShadow: "0 4px 16px rgba(29, 78, 216, 0.4)",
          }}>
            <span style={{ color: "#fff", fontSize: 18 }}>⛽</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: "-0.02em" }}>NaqlFlow</div>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1.5, fontWeight: 500 }}>نقل فلو · v5.0</div>
          </div>
          {/* Close button — only on mobile */}
          {!isDesktop && (
            <button
              onClick={() => setOpen(false)}
              aria-label="إغلاق القائمة"
              style={{
                width: 32, height: 32, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.06)", color: "#94A3B8",
                border: "none", cursor: "pointer", fontSize: 14,
              }}
            >✕</button>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, margin: "0 20px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />

        {/* Section Label */}
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.2)", padding: "16px 16px 6px" }}>التشغيل</div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
          {NAV.map(navItem)}

          {/* Separator */}
          <div style={{ height: 1, margin: "12px 8px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }} />

          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.2)", padding: "0 16px 6px" }}>إدارة</div>

          {MGMT.map(navItem)}
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
