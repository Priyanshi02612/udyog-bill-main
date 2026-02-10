import React, { forwardRef } from "react";
import clsx from "clsx";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onTrailingIconClick?: () => void;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      leadingIcon,
      trailingIcon,
      onTrailingIconClick,
      className,
      ...props
    },
    ref,
  ) => {
    const hasLeadingIcon = Boolean(leadingIcon);
    const hasTrailingIcon = Boolean(trailingIcon);

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-[#0d161b] text-sm font-semibold">
            {label}
          </label>
        )}

        <div className="relative">
          {hasLeadingIcon && (
            <span
              className="
                absolute left-3 top-1/2 -translate-y-1/2
                text-slate-400
                pointer-events-none
              "
            >
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            {...props}
            className={clsx(
              "w-full h-12 rounded-lg border p-4 text-sm transition-all",
              "bg-slate-50 text-[#0d161b] border-[#cfdde7]",
              "focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary",
              hasLeadingIcon && "pl-11",
              hasTrailingIcon && "pr-12",
              className,
            )}
          />

          {hasTrailingIcon && (
            <button
              type="button"
              onClick={onTrailingIconClick}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                h-8 w-8 flex items-center justify-center
                text-slate-400 hover:text-primary
                transition-colors
              "
            >
              {trailingIcon}
            </button>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";
