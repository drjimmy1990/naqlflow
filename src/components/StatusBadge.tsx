"use client";

import { STATUS_CONFIG, type OrderStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const s = STATUS_CONFIG[status];
  if (!s) return null;

  const sizeStyles = {
    sm: { fontSize: "10px", padding: "3px 10px", gap: "3px" },
    md: { fontSize: "11.5px", padding: "4px 14px", gap: "4px" },
    lg: { fontSize: "13px", padding: "6px 16px", gap: "5px" },
  };

  const st = sizeStyles[size];

  return (
    <span
      className="inline-flex items-center rounded-full font-semibold whitespace-nowrap"
      style={{
        background: `${s.bg}`,
        color: s.color,
        fontSize: st.fontSize,
        padding: st.padding,
        gap: st.gap,
        letterSpacing: "-0.01em",
        boxShadow: `0 1px 4px ${s.color}12`,
      }}
    >
      <span className="flex items-center justify-center" style={{
        width: size === "lg" ? 18 : size === "md" ? 15 : 13,
        height: size === "lg" ? 18 : size === "md" ? 15 : 13,
        fontSize: size === "lg" ? "12px" : size === "md" ? "11px" : "9px",
      }}>{s.icon}</span>
      {s.label}
    </span>
  );
}
