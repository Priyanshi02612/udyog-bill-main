import React, { forwardRef } from "react";
import clsx from "clsx";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  trailingIcon?: React.ReactNode;
  onTrailingIconClick?: () => void;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, trailingIcon, onTrailingIconClick, className, ...props }, ref) => {
    const hasTrailingIcon = Boolean(trailingIcon);

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-[#0d161b] text-sm font-semibold leading-normal">
            {label}
          </label>
        )}

        <div className="relative group">
          <input
            ref={ref}
            {...props}
            className={clsx(
              "form-input flex w-full rounded-lg h-12 p-4 text-sm font-normal transition-all",
              "bg-slate-50 text-[#0d161b] border border-[#cfdde7]",
              "placeholder:text-[#4c799a]/60",
              "focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary",
              hasTrailingIcon && "pr-12",
              className,
            )}
          />

          {hasTrailingIcon && (
            <button
              type="button"
              onClick={onTrailingIconClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8
                         flex items-center justify-center
                         text-slate-400 hover:text-primary transition-colors"
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
