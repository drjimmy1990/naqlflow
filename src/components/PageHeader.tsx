"use client";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-slate-200 sticky top-0 z-10">
      <div className="ani-fade">
        <h1 className="m-0 text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h1>
        {subtitle && <p className="m-0 mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <span className="text-[11.5px] text-slate-400 px-3 py-1 rounded-lg bg-slate-50">
          {new Date().toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>
    </div>
  );
}
