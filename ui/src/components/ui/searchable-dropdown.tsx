"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Input } from "./input";

export type SearchableDropdownOption = {
  value: string;
  label: string;
};

type SearchableDropdownProps = {
  value: string;
  options: SearchableDropdownOption[];
  placeholder?: string;
  noResultsText?: string;
  inputClassName?: string;
  onInputChange: (value: string) => void;
  onSelect: (option: SearchableDropdownOption) => void;
};

export function SearchableDropdown({
  value,
  options,
  placeholder = "Search...",
  noResultsText = "No matching item found.",
  inputClassName,
  onInputChange,
  onSelect,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const anchorRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const hasOptions = useMemo(() => options.length > 0, [options]);

  const updatePopoverPosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) {
      return;
    }

    const rect = anchor.getBoundingClientRect();
    setPopoverPosition({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePopoverPosition();

    const handleWindowChange = () => {
      updatePopoverPosition();
    };

    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    return () => {
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [isOpen, updatePopoverPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) {
        return;
      }

      const target = event.target as Node;
      if (
        anchorRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <div ref={anchorRef}>
        <Input
          value={value}
          onChange={(event) => {
            onInputChange(event.target.value);
            setIsOpen(true);
            updatePopoverPosition();
          }}
          onClick={() => {
            setIsOpen(true);
            updatePopoverPosition();
          }}
          className={inputClassName}
          placeholder={placeholder}
        />
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-80 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl"
          style={{
            top: popoverPosition.top,
            left: popoverPosition.left,
            width: popoverPosition.width,
          }}
        >
          {hasOptions ? (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 last:border-b-0"
              >
                {option.label}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-slate-500">{noResultsText}</p>
          )}
        </div>
      )}
    </>
  );
}
