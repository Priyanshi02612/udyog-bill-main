"use client";

import { useMemo } from "react";
import { MdClose, MdOutlineArrowForward } from "react-icons/md";
import { Button } from "../../ui/button";
import { Dropdown } from "../../ui/dropdown";

type AddFinancialYearModalProps = {
  open: boolean;
  selectedStartYear: string;
  yearOptions: { label: string; value: string }[];
  onChangeStartYear: (value: string) => void;
  onClose: () => void;
  onCreate: () => void;
};

export const AddFinancialYearModal = ({
  open,
  selectedStartYear,
  yearOptions,
  onChangeStartYear,
  onClose,
  onCreate,
}: AddFinancialYearModalProps) => {
  const selectedYear = Number(selectedStartYear);

  const startPeriodOptions = useMemo(
    () =>
      yearOptions.map((year) => ({
        label: `April ${year.value}`,
        value: year.value,
      })),
    [yearOptions],
  );

  const endPeriodOptions = useMemo(
    () =>
      yearOptions.map((year) => ({
        label: `March ${Number(year.value) + 1}`,
        value: year.value,
      })),
    [yearOptions],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="rounded-3xl w-full max-w-lg bg-white shadow-2xl">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight text-slate-900">
              Add Financial Year
            </h3>
            <p className="text-sm text-slate-500">
              Setup a new accounting period for your textile business.
            </p>
          </div>

          <Button
            variant="icon"
            size="sm"
            className="rounded-md bg-white hover:bg-white"
            leadingIcon={<MdClose className="w-7 h-7 text-primary" />}
            onClick={onClose}
          />
        </div>

        <div className="space-y-6 px-7 py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Dropdown
              label="Start Date"
              options={startPeriodOptions}
              value={selectedStartYear}
              onChange={(event) => onChangeStartYear(event.target.value)}
            />
            <Dropdown
              label="End Date"
              options={endPeriodOptions}
              value={selectedStartYear}
              disabled
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-7 py-5">
          <Button size="sm" variant="link-secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onCreate}
            trailingIcon={<MdOutlineArrowForward className="h-5 w-5" />}
            disabled={!selectedYear}
          >
            Create Financial Year
          </Button>
        </div>
      </div>
    </div>
  );
};
