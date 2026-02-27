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
  subtitle?: string;
  trendText?: string;
  trendTone?: "neutral" | "positive" | "warning" | "danger";
}

const trendToneStyles: Record<
  NonNullable<KpiCardProps["trendTone"]>,
  string
> = {
  neutral: "text-slate-500",
  positive: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-red-600",
};

export const KpiCard = ({
  icon,
  label,
  value,
  color = "primary",
  subtitle,
  trendText,
  trendTone = "neutral",
}: KpiCardProps) => {
  const styles = colorStyles[color];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 transition-all hover:shadow-md">
      <div className="flex gap-4">
        <span
          className={`size-11 flex items-center justify-center rounded-xl ${styles.bg}`}
        >
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-slate-500 text-sm font-medium">{label}</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
      </div>

      <div className="flex flex-col">
        {subtitle ? (
          <p className="text-xs text-slate-500 mt-1 truncate">{subtitle}</p>
        ) : null}
        {trendText ? (
          <p
            className={`text-xs font-semibold mt-2 ${trendToneStyles[trendTone]}`}
          >
            {trendText}
          </p>
        ) : null}
      </div>
    </div>
  );
};
