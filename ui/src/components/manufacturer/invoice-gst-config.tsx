import { MdOutlineAccountBalance } from "react-icons/md";

import { Dropdown } from "../ui/dropdown";
import { gstTypeOptions, TaxMode as TaxModeEnum } from "../../utils/constants";
import { formatCurrency, getInvoicePreviewMetrics } from "../../utils/helpers";
import { GstType, InvoiceItem, TaxMode } from "../../utils/types";

type InvoiceGstConfigProps = {
  gstType: GstType;
  taxMode: TaxMode;
  applyGst: boolean;
  effectiveTaxMode: TaxMode | undefined;
  computedRows: InvoiceItem[];
  onGstTypeChange: (value: GstType) => void;
  onTaxModeChange: (value: TaxMode) => void;
};

export function InvoiceGstConfig({
  gstType,
  taxMode,
  applyGst,
  effectiveTaxMode,
  computedRows,
  onGstTypeChange,
  onTaxModeChange,
}: InvoiceGstConfigProps) {
  const { cgstAmount, sgstAmount, igstAmount, cgstRate, sgstRate, igstRate } =
    getInvoicePreviewMetrics(computedRows, gstType, effectiveTaxMode);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <MdOutlineAccountBalance className="h-5 w-5 text-primary" />
          <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            GST Configuration
          </h3>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <Dropdown
          options={gstTypeOptions}
          label="GST Type"
          className="mb-4"
          value={gstType}
          onChange={(event) => onGstTypeChange(event.target.value as GstType)}
        />

        {applyGst ? (
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onTaxModeChange(TaxModeEnum.CGST_SGST)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                taxMode === TaxModeEnum.CGST_SGST
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-300 bg-white text-slate-500"
              }`}
            >
              CGST + SGST (Intra-state)
            </button>
            <button
              type="button"
              onClick={() => onTaxModeChange(TaxModeEnum.IGST)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                taxMode === TaxModeEnum.IGST
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-300 bg-white text-slate-500"
              }`}
            >
              IGST (Inter-state)
            </button>
          </div>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          {applyGst ? (
            taxMode === TaxModeEnum.CGST_SGST ? (
              <>
                <div className="mb-2 flex items-center justify-between text-slate-700">
                  <span>CGST Rate ({cgstRate.toFixed(2)}%)</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(cgstAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>SGST Rate ({sgstRate.toFixed(2)}%)</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(sgstAmount)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between text-slate-700">
                <span>IGST Rate ({igstRate.toFixed(2)}%)</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(igstAmount)}
                </span>
              </div>
            )
          ) : (
            <div className="text-slate-600">GST disabled for this invoice.</div>
          )}
        </div>
      </div>
    </div>
  );
}
