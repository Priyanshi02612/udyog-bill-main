import React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "primary"
    | "secondary"
    | "outline-primary"
    | "outline-secondary"
    | "icon"
    | "link"
    | "link-secondary";
  size?: "sm" | "md" | "lg";
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  loading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  loading = false,
  children,
  className,
  ...props
}) => {
  const isIconOnly = variant === "icon";
  const isLink = variant === "link";

  const baseStyles =
    "group inline-flex items-center justify-center font-bold transition-all duration-300";

  const sizeStyles = {
    sm: "text-sm px-3 py-2",
    md: "text-base px-6 py-3",
    lg: "text-lg px-8 py-4",
  };

  const variantStyles = {
    primary:
      "bg-primary text-white rounded-xl hover:bg-primary/90 shadow-md shadow-primary/30",
    secondary: "bg-white text-primary rounded-xl hover:bg-primary/20",
    "outline-primary":
      "border-2 border-primary text-primary rounded-xl hover:bg-primary/10",
    "outline-secondary":
      "border-2 border-slate-200 text-slate-900 rounded-xl hover:bg-slate-100",
    icon: "bg-primary text-white rounded-full hover:bg-primary/90 w-10 h-10",
    link: "text-primary px-0 py-0 font-semibold hover:text-primary/80",
    "link-secondary": "text-slate-600 hover:text-slate-500",
  };

  return (
    <button
      className={clsx(
        baseStyles,
        !isIconOnly && !isLink && sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      disabled={loading}
      {...props}
    >
      {loading && (
        <span
          className={clsx(
            "animate-spin rounded-full border-2 border-current border-t-transparent",
            isIconOnly ? "w-5 h-5" : "w-4 h-4",
          )}
        />
      )}

      {!loading && (
        <>
          {leadingIcon && !isIconOnly && (
            <span className="mr-2 flex items-center transition-transform duration-300 group-hover:-translate-x-[5%]">
              {leadingIcon}
            </span>
          )}

          {!isIconOnly && children}

          {trailingIcon && !isIconOnly && (
            <span className="ml-2 flex items-center transition-transform duration-300 group-hover:translate-x-[5%]">
              {trailingIcon}
            </span>
          )}

          {isIconOnly && leadingIcon && (
            <span className="flex items-center justify-center">
              {leadingIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
};
