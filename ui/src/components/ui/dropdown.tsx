import React from "react";
import clsx from "clsx";
import { MdArrowDropDown } from "react-icons/md";

type Option = {
  label: string;
  value: string;
};

type DropdownProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
};

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  className,
  required,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-[#0d161b]">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
      )}

      <div className="relative">
        <select
          required={required}
          className={clsx(
            "form-input flex w-full h-9 rounded-lg px-4 pr-10 text-sm transition-all",
            "bg-slate-50 border border-[#cfdde7] text-[#0d161b]",
            "focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "appearance-none cursor-pointer",
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <MdArrowDropDown className="absolute right-3 top-1/3 pointer-events-none text-slate-400" />
      </div>
    </div>
  );
};
