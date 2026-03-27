import PageHeader from "@/components/PageHeader";

// KPI Card Component
function KPICard({ label, value, icon, accent }: { label: string; value: string | number; icon: string; accent: string }) {
  return (
    <div className="hov-lift bg-white rounded-2xl px-5 py-[18px] flex-1 min-w-[165px] shadow-sm flex items-center gap-3.5"
      style={{ borderRight: `4px solid ${accent}` }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
        style={{ background: accent + "0F" }}>
        {icon}
      </div>
      <div>
        <div className="text-[26px] font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          {value}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="ani-page">
      <PageHeader title="لوحة التحكم" subtitle="نظرة عامة على عمليات اليوم" />

      <div className="p-6">
        {/* KPIs */}
        <div className="stg flex gap-3 flex-wrap mb-5">
          <KPICard label="طلبات اليوم" value="0" icon="📋" accent="#2563EB" />
          <KPICard label="طلبات نشطة" value="0" icon="🚚" accent="#16A34A" />
          <KPICard label="مراجعة مالية" value="0" icon="⏳" accent="#F59E0B" />
          <KPICard label="سائقين نشطين" value="0" icon="👤" accent="#7C3AED" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* Orders Table placeholder */}
          <div className="bg-white rounded-2xl p-5 shadow-sm ani-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14.5px] font-bold m-0">آخر الطلبات</h3>
              <a href="/orders"
                className="text-blue-600 text-xs font-semibold bg-white px-3 py-1.5 rounded-lg border-[1.5px] border-blue-600 no-underline hover:bg-blue-50 transition-colors">
                عرض الكل
              </a>
            </div>
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm">لا توجد طلبات بعد</p>
              <p className="text-xs mt-1 text-slate-300">
                قم بإنشاء مشروع Supabase وربطه لبدء استقبال الطلبات
              </p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex flex-col gap-3.5">
            {/* Map placeholder */}
            <div className="ani-left rounded-2xl p-6 text-white text-center shadow-sm"
              style={{ background: "linear-gradient(150deg, #0F172A 0%, #1E293B 100%)" }}>
              <div className="text-3xl mb-2 ani-pop">🗺️</div>
              <div className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                خريطة المركبات
              </div>
              <div className="text-[10.5px] text-[#4B5A77] mt-1">Google Maps API</div>
              <div className="flex gap-1.5 justify-center mt-3">
                {["المدينة", "حائل", "القصيم"].map(c => (
                  <span key={c} className="px-2.5 py-1 rounded-md text-[9.5px]"
                    style={{ background: "rgba(96,165,250,0.1)", color: "#60A5FA" }}>{c}</span>
                ))}
              </div>
            </div>

            {/* Setup Guide */}
            <div className="ani-left bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                🚀 خطوات الإعداد
              </h3>
              <div className="space-y-2">
                {[
                  { step: "1", text: "أنشئ مشروع Supabase جديد", done: false },
                  { step: "2", text: "انسخ URL و Anon Key إلى .env.local", done: false },
                  { step: "3", text: "نفّذ schema.sql في SQL Editor", done: false },
                  { step: "4", text: "أضف أول عميل وسائق", done: false },
                ].map((s) => (
                  <div key={s.step}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg text-xs"
                    style={{ background: s.done ? "#DCFCE7" : "#F1F5F9" }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: s.done ? "#16A34A" : "#94A3B8" }}>
                      {s.done ? "✓" : s.step}
                    </span>
                    {s.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
