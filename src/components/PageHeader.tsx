"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface ExpiringDoc {
  name: string;
  doc_type: string;
  days_left: number;
  entity_type: "driver" | "vehicle";
}

function daysUntil(date: string | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  const [showNotif, setShowNotif] = useState(false);
  const [alerts, setAlerts] = useState<ExpiringDoc[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadAlerts = async () => {
    if (loaded) return;
    const [{ data: drivers }, { data: vehicles }] = await Promise.all([
      supabase.from("drivers").select("name, national_id_expiry, license_expiry, aramco_card_expiry, transport_card_expiry, passport_expiry").eq("is_active", true),
      supabase.from("vehicles").select("tanker_number, registration_expiry, inspection_expiry, operating_card_expiry").eq("is_active", true),
    ]);

    const items: ExpiringDoc[] = [];

    // Driver docs
    (drivers || []).forEach((d: Record<string, string>) => {
      const docs = [
        { key: "national_id_expiry", label: "الهوية" },
        { key: "license_expiry", label: "الرخصة" },
        { key: "aramco_card_expiry", label: "أرامكو" },
        { key: "transport_card_expiry", label: "النقل" },
        { key: "passport_expiry", label: "الجواز" },
      ];
      docs.forEach(doc => {
        const days = daysUntil(d[doc.key]);
        if (days !== null && days < 60) {
          items.push({ name: d.name, doc_type: doc.label, days_left: days, entity_type: "driver" });
        }
      });
    });

    // Vehicle docs
    (vehicles || []).forEach((v: Record<string, string>) => {
      const docs = [
        { key: "registration_expiry", label: "الاستمارة" },
        { key: "inspection_expiry", label: "الفحص" },
        { key: "operating_card_expiry", label: "التشغيل" },
      ];
      docs.forEach(doc => {
        const days = daysUntil(v[doc.key]);
        if (days !== null && days < 60) {
          items.push({ name: v.tanker_number, doc_type: doc.label, days_left: days, entity_type: "vehicle" });
        }
      });
    });

    items.sort((a, b) => a.days_left - b.days_left);
    setAlerts(items);
    setLoaded(true);
  };

  const urgentCount = alerts.filter(a => a.days_left < 30).length;

  // Close on outside click
  useEffect(() => {
    if (!showNotif) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".notif-panel")) setShowNotif(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showNotif]);

  return (
    <div className="px-8 py-5 flex items-center justify-between sticky top-0 z-10 ani-fade"
      style={{
        background: "rgba(247, 249, 251, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(194, 198, 214, 0.12)",
      }}>
      <div>
        <h1 className="m-0 text-xl font-bold tracking-tight" style={{
          fontFamily: "var(--font-display)",
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}>
          {title}
        </h1>
        {subtitle && (
          <p className="m-0 mt-1 text-[13px] font-medium" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {action}

        {/* Notifications */}
        <div className="relative notif-panel">
          <button
            onClick={(e) => { e.stopPropagation(); loadAlerts(); setShowNotif(!showNotif); }}
            className="relative p-2.5 rounded-xl transition-all duration-200"
            style={{
              color: "var(--text-muted)",
              background: showNotif ? "var(--primary-fixed)" : "transparent",
            }}
            onMouseEnter={(e) => { if (!showNotif) (e.currentTarget).style.background = "var(--surface-low)"; }}
            onMouseLeave={(e) => { if (!showNotif) (e.currentTarget).style.background = "transparent"; }}
          >
            🔔
            {urgentCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center text-white px-1"
                style={{ background: "var(--danger)", boxShadow: "0 0 8px rgba(220, 38, 38, 0.4)" }}>
                {urgentCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotif && (
            <div className="absolute left-0 top-full mt-2 w-[340px] rounded-2xl overflow-hidden ani-scale"
              style={{ background: "var(--surface-card)", boxShadow: "var(--shadow-xl)", border: "1px solid rgba(194,198,214,0.12)", zIndex: 100 }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(194,198,214,0.12)" }}>
                <span className="text-[14px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>⚠️ تنبيهات الوثائق</span>
                <span className="chip text-[10px]" style={{ background: urgentCount > 0 ? "var(--danger-bg)" : "var(--success-bg)", color: urgentCount > 0 ? "var(--danger)" : "var(--success)" }}>
                  {urgentCount > 0 ? `${urgentCount} عاجل` : "لا يوجد"}
                </span>
              </div>

              <div className="max-h-[320px] overflow-y-auto">
                {!loaded ? (
                  <div className="text-center py-8 text-[12px] animate-pulse" style={{ color: "var(--text-faint)" }}>جاري التحميل...</div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2">✅</div>
                    <div className="text-[13px] font-medium" style={{ color: "var(--text-muted)" }}>جميع الوثائق سارية</div>
                    <div className="text-[11px] mt-1" style={{ color: "var(--text-faint)" }}>لا توجد وثائق تنتهي خلال 60 يوم</div>
                  </div>
                ) : (
                  alerts.map((a, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3 transition-colors hover:bg-slate-50/50"
                      style={{ borderBottom: "1px solid rgba(194,198,214,0.08)" }}>
                      <div className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: a.days_left < 0 ? "var(--danger)" : a.days_left < 30 ? "var(--warning)" : "var(--info)",
                          boxShadow: a.days_left < 0 ? "0 0 8px rgba(220,38,38,0.4)" : a.days_left < 30 ? "0 0 8px rgba(217,119,6,0.4)" : "none",
                        }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold truncate" style={{ color: "var(--text-primary)" }}>
                          {a.entity_type === "driver" ? "👤" : "🚛"} {a.name} — {a.doc_type}
                        </div>
                        <div className="text-[11px] mt-0.5" style={{
                          color: a.days_left < 0 ? "var(--danger)" : a.days_left < 30 ? "var(--warning)" : "var(--text-muted)",
                          fontWeight: a.days_left < 0 ? 700 : 500,
                        }}>
                          {a.days_left < 0 ? `منتهي منذ ${Math.abs(a.days_left)} يوم` : `ينتهي خلال ${a.days_left} يوم`}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date */}
        <span className="text-[12px] font-medium px-4 py-2 rounded-xl" style={{
          background: "var(--surface-card)",
          color: "var(--text-muted)",
          boxShadow: "var(--shadow-sm)",
          fontFamily: "var(--font-data)",
        }}>
          {new Date().toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>
    </div>
  );
}
