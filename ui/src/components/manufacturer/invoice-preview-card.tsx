import Avatar from "react-avatar";

import { GstType, TaxMode } from "../../utils/constants";
import {
  formatCurrency,
  formatDate,
  getInvoicePreviewMetrics,
} from "../../utils/helpers";
import { Invoice, UserProfile } from "../../utils/types";

type InvoicePreviewCardProps = {
  invoice: Invoice;
  buyerInfo?: UserProfile;
  sellerInfo?: UserProfile;
  className?: string;
};

export function InvoicePreviewCard({
  invoice,
  buyerInfo,
  sellerInfo,
  className = "",
}: InvoicePreviewCardProps) {
  const applyGst = invoice.gstType !== GstType.NO_GST;
  const taxMode = invoice.taxMode;
  const dueDate = invoice.invoiceDueDate || invoice.invoiceDate;

  const {
    taxableSubtotal,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalGstAmount,
    cgstRate,
    sgstRate,
    igstRate,
    effectiveGstRate,
    roundOff,
    totalAmountDue,
  } = getInvoicePreviewMetrics(
    invoice.items,
    invoice.gstType as GstType,
    taxMode as TaxMode,
  );

  return (
    <div
      className={`mx-auto mt-2 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-10 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Avatar
              name={sellerInfo?.businessName}
              size="50"
              color="#8b5a2b"
              fgColor="#ffffff"
              className="rounded-lg flex items-center justify-center text-xl font-black"
            />
            <h3 className="text-xl font-black text-slate-900 sm:text-2xl">
              {sellerInfo?.businessName || invoice.sellerId}
            </h3>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {sellerInfo?.registeredAddress}
          </p>
          <p className="text-sm text-slate-500">{sellerInfo?.state || ""}</p>
          <p className="text-sm text-slate-500">GSTIN: {sellerInfo?.gstin}</p>
          <p className="text-sm text-slate-500">Email: {sellerInfo?.email}</p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-4xl font-black tracking-tight text-slate-200 sm:text-5xl">
            INVOICE
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Date:{" "}
            <span className="font-bold text-slate-800">
              {formatDate(invoice.invoiceDate)}
            </span>
          </p>
          <p className="text-sm text-slate-500">
            Due Date:{" "}
            <span className="font-bold text-slate-800">
              {formatDate(dueDate)}
            </span>
          </p>
          <p className="text-sm text-slate-500">
            PO Ref:{" "}
            <span className="font-bold text-slate-800">
              #{invoice.invoiceNumber}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold tracking-widest text-primary">
            BILL TO
          </p>
          <p className="mt-3 text-lg font-bold text-slate-900 sm:text-xl">
            {buyerInfo?.businessName || invoice.buyerId}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {buyerInfo?.registeredAddress}
          </p>
          <p className="text-sm text-slate-500">{buyerInfo?.state || ""}</p>
          <p className="text-sm text-slate-500">GSTIN: {buyerInfo?.gstin}</p>
          <p className="text-sm text-slate-500">Contact: {buyerInfo?.phone}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold tracking-widest text-primary">
            SHIP FROM
          </p>
          <p className="mt-3 text-lg font-bold text-slate-900 sm:text-xl">
            {sellerInfo?.businessName || invoice.sellerId}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {sellerInfo?.registeredAddress}
          </p>
          <p className="text-sm text-slate-500">{sellerInfo?.state || ""}</p>
          <p className="text-sm text-slate-500">Contact: {sellerInfo?.phone}</p>
        </div>
      </div>

      <div
        className="mt-6 overflow-x-auto rounded-xl border border-slate-200"
        style={{ scrollbarWidth: "thin" }}
      >
        <table className="w-full min-w-190 text-left text-xs xl:text-base">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">Item Name</th>
              <th className="px-3 py-3">HSN Code</th>
              <th className="px-3 py-3">Qty</th>
              <th className="px-3 py-3">Unit</th>
              <th className="px-3 py-3">GST</th>
              <th className="px-3 py-3">GST Amount</th>
              <th className="px-3 py-3">Rate (per unit)</th>
              <th className="px-3 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item, index) => {
              const itemTaxableAmount =
                Number(item.basePrice) * Number(item.quantity);
              const itemGstAmount =
                (itemTaxableAmount * effectiveGstRate) / 100;
              const itemTotalWithGst = itemTaxableAmount + itemGstAmount;

              return (
                <tr key={index}>
                  <td className="px-3 py-4 text-xs text-slate-500 xl:text-sm">
                    {`0${index + 1}`.slice(-2)}
                  </td>
                  <td className="px-3 py-4 text-xs font-bold text-slate-900 xl:text-sm">
                    {item.name}
                  </td>
                  <td className="px-3 py-4 text-xs text-slate-600 xl:text-sm">
                    {item.hsnCode}
                  </td>
                  <td className="px-3 py-4 text-xs text-slate-600 xl:text-sm">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-4 text-xs text-slate-600 xl:text-sm">
                    {item.unit}
                  </td>
                  <td className="px-3 py-4 text-xs text-slate-600 xl:text-sm">
                    {effectiveGstRate.toFixed(2)}%
                  </td>
                  <td className="px-3 py-4 text-xs text-slate-600 xl:text-sm">
                    {formatCurrency(itemGstAmount)}
                  </td>
                  <td className="px-3 py-4 text-xs text-slate-600 xl:text-sm">
                    {formatCurrency(Number(item.basePrice))}
                  </td>
                  <td className="px-3 py-4 text-right text-xs font-bold text-slate-900 xl:text-sm">
                    {formatCurrency(itemTotalWithGst)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-1">
            Terms & Conditions:
          </h4>
          <ol className="text-[9px] text-slate-600 list-decimal pl-3 leading-tight">
            <li>Goods once sold will not be taken back.</li>
            <li>
              Interest @ 18% p.a. will be charged if payment is not made within
              30 days.
            </li>
            <li>Subject to Surat jurisdiction only.</li>
          </ol>
        </div>

        <div>
          <div className="space-y-3 border-b border-slate-200 pb-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Sub Total</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(taxableSubtotal)}
              </span>
            </div>
            {applyGst ? (
              taxMode === TaxMode.IGST ? (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    IGST ({igstRate.toFixed(2)}%)
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(igstAmount)}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      CGST ({cgstRate.toFixed(2)}%)
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(cgstAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      SGST ({sgstRate.toFixed(2)}%)
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(sgstAmount)}
                    </span>
                  </div>
                </>
              )
            ) : null}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tax Breakdown</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(totalGstAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Round Off</span>
              <span className="font-bold text-red-500">
                {formatCurrency(roundOff)}
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xl font-black text-slate-900">TOTAL</p>
            <p className="text-xl font-black text-primary sm:text-3xl">
              {formatCurrency(totalAmountDue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
