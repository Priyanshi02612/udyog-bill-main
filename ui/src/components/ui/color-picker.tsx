"use client";

import { useState, useRef, useEffect } from "react";
import { Sketch } from "@uiw/react-color";

type ColorPickerFieldProps = {
  label?: string;
  value?: string;
  onChange: (color: string) => void;
};

export function ColorPickerField({
  label = "Color",
  value = "#6366f1",
  onChange,
}: ColorPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative flex flex-col gap-2" ref={ref}>
      <label className="text-sm font-semibold text-slate-900">{label}</label>

      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between rounded-lg h-12 p-4 bg-slate-50 text-[#0d161b] border border-[#cfdde7] hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <div className="flex items-center gap-2">
          <span
            className="h-5 w-5 rounded-full border border-slate-300"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm font-medium text-slate-700">{value}</span>
        </div>
        <span className="text-xs text-slate-400">Pick</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xl">
            <Sketch color={value} onChange={(c) => onChange(c.hex)} />
          </div>
        </div>
      )}
    </div>
  );
}
