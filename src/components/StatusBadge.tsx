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
    sm: "text-[10px] px-2 py-0.5",
    md: "text-[11.5px] px-3 py-1",
    lg: "text-[13px] px-4 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ${sizeStyles[size]}`}
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}18`,
      }}
    >
      <span className={size === "lg" ? "text-sm" : "text-xs"}>{s.icon}</span>
      {s.label}
    </span>
  );
}
