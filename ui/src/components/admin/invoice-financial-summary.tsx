import { MdOutlineSummarize } from "react-icons/md";

import {
  formatCurrency,
  getInvoicePreviewMetrics,
  toIndianAmountWords,
} from "../../utils/helpers";
import { GstType, InvoiceItem, TaxMode } from "../../utils/types";

type InvoiceFinancialSummaryProps = {
  gstType: GstType;
  effectiveTaxMode: TaxMode | undefined;
  computedRows: InvoiceItem[];
  selectedBuyerGstin?: string;
};

export function InvoiceFinancialSummary({
  gstType,
  effectiveTaxMode,
  computedRows,
  selectedBuyerGstin,
}: InvoiceFinancialSummaryProps) {
  const {
    taxableSubtotal,
    effectiveGstRate,
    totalGstAmount,
    totalAmountDue,
    roundOff,
  } = getInvoicePreviewMetrics(computedRows, gstType, effectiveTaxMode);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden h-fit">
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
        <MdOutlineSummarize className="h-5 w-5 text-primary" />
        <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Financial Summary
        </h3>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <div className="space-y-3 border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between text-slate-700">
            <span>Subtotal (Taxable Value)</span>
            <span className="font-bold text-slate-900">
              {formatCurrency(taxableSubtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-700">
            <span>Total Tax Amount ({effectiveGstRate.toFixed(2)}%)</span>
            <span className="font-bold text-slate-900">
              {formatCurrency(totalGstAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-700">
            <span>Round Off</span>
            <span
              className={`font-bold ${roundOff < 0 ? "text-rose-600" : "text-slate-900"}`}
            >
              {formatCurrency(roundOff)}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Total Amount Due
          </p>
          <p className="mt-2 text-xl font-black text-slate-900 sm:text-3xl">
            {formatCurrency(totalAmountDue)}
          </p>
          <p className="mt-2 text-right text-sm italic text-slate-500">
            In words: {toIndianAmountWords(totalAmountDue)} only.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 text-sm text-primary sm:px-6">
        <p className="font-semibold">Compliant Invoice</p>
        <p className="text-xs text-slate-600">
          This invoice payload is structured for GST-compliant B2B API
          submission.
        </p>
        {selectedBuyerGstin && (
          <p className="mt-2 text-xs text-slate-500">
            Selected buyer GSTIN: {selectedBuyerGstin}
          </p>
        )}
      </div>
    </div>
  );
}
