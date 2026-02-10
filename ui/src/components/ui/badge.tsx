type BadgeVariant = "success" | "warning" | "danger" | "info" | "primary";

type BadgeProps = {
  label?: string;
  variant?: BadgeVariant;
  showDot?: boolean; // show / hide dot
  dotOnly?: boolean; // only dot, no label
};

const badgeStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  success: {
    container: "border-green-200 bg-green-50 text-green-700",
    dot: "bg-green-500",
  },
  warning: {
    container: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  danger: {
    container: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  info: {
    container: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  primary: {
    container: "border-primary/20 bg-primary/10 text-primary",
    dot: "bg-primary",
  },
};

export function Badge({
  label,
  variant = "success",
  showDot = true,
  dotOnly = false,
}: BadgeProps) {
  const styles = badgeStyles[variant];

  if (dotOnly) {
    return (
      <span className={`inline-flex h-3 w-3 rounded-full ${styles.dot}`} />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs lg:text-md font-semibold ${styles.container}`}
    >
      {showDot && <span className={`h-2 w-2 rounded-full ${styles.dot}`} />}
      {label}
    </span>
  );
}
