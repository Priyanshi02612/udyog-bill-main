import React, { ReactNode } from "react";

export type KpiColor = "primary" | "blue" | "red" | "emerald" | "amber";

const colorStyles: Record<KpiColor, { bg: string; text: string }> = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
  },
  red: {
    bg: "bg-red-100",
    text: "text-red-600",
  },
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
  },
  amber: {
    bg: "bg-amber-100",
    text: "text-amber-600",
  },
};

export interface KpiCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: KpiColor;
}

export const KpiCard = ({
  icon,
  label,
  value,
  color = "primary",
}: KpiCardProps) => {
  const styles = colorStyles[color];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-center transition-all hover:shadow-md">
      <span
        className={`size-11 flex items-center justify-center rounded-xl ${styles.bg}`}
      >
        {icon}
      </span>

      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
};
