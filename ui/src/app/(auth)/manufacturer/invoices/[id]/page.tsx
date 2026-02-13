"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { MdArrowBack, MdDownload } from "react-icons/md";
import Avatar from "react-avatar";
import { useParams, useRouter } from "next/navigation";

import { InvoicePdf } from "../../../../../components/admin/invoice-pdf-template";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import {
  formatCurrency,
  formatDate,
  getInvoicePreviewMetrics,
  statusStyles,
} from "../../../../../utils/helpers";
import {
  getInvoiceBuyerById,
  getInvoiceSellerById,
  mockInvoices,
} from "../../../../../utils/data";
import {
  GstType,
  previewStatusVariant,
  TaxMode,
} from "../../../../../utils/constants";

const InvoicePreviewPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const invoice =
    mockInvoices.find((invoice) => String(invoice.id) === id) || null;

  if (!invoice) return null;

  const buyerInfo = getInvoiceBuyerById(invoice.buyerId);
  const sellerInfo = getInvoiceSellerById(invoice.sellerId);
  const applyGst = invoice.gstType !== GstType.NO_GST;
  const taxMode = invoice.taxMode;

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
  } = getInvoicePreviewMetrics(invoice.items, invoice.gstType, taxMode);

  const statusLabel = statusStyles[invoice.status].label.toUpperCase();

  return (
    <div className="relative min-h-[calc(100vh-124px)] p-4 pb-6 sm:p-6 lg:p-8 lg:pb-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-1 text-primary hover:text-primary/80"
            onClick={() => router.back()}
          >
            <MdArrowBack className="h-6 w-6" />
          </button>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Invoice #{invoice.invoiceNumber}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-primary text-xs md:text-base">
                Issued by {sellerInfo?.businessName || invoice.sellerId}
              </p>
              <Badge
                label={statusLabel}
                variant={previewStatusVariant[invoice.status]}
              />
            </div>
          </div>
        </div>

        <PDFDownloadLink
          document={<InvoicePdf invoice={invoice} />}
          fileName={`${invoice.invoiceNumber}.pdf`}
          className="inline-flex"
        >
          {({ loading }) => (
            <Button
              size="sm"
              className="w-full sm:min-w-36.25 sm:w-auto"
              leadingIcon={<MdDownload className="h-4 w-4" />}
              loading={loading}
            >
              Download PDF
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      <div className="mx-auto w-full max-w-6xl p-2 sm:p-4 md:p-8">
        <div className="mx-auto mt-2 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-10">
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
                <h3 className="text-xl font-black text-slate-900 sm:text-3xl">
                  {sellerInfo?.businessName}
                </h3>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                {sellerInfo?.addressLine1}
              </p>
              <p className="text-sm text-slate-500">
                {`${sellerInfo?.city}, ${sellerInfo?.state} - ${sellerInfo?.pincode}`}
              </p>
              <p className="text-sm text-slate-500">
                GSTIN: {sellerInfo?.gstin}
              </p>
              <p className="text-sm text-slate-500">
                Email: {sellerInfo?.email}
              </p>
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
                  {formatDate(invoice.dueDate)}
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

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold tracking-widest text-primary">
                BILL TO
              </p>
              <p className="mt-3 text-xl font-bold text-slate-900 sm:text-3xl">
                {buyerInfo?.businessName}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {buyerInfo?.addressLine1}
              </p>
              <p className="text-sm text-slate-500">
                {`${buyerInfo?.city}, ${buyerInfo?.state} - ${buyerInfo?.pincode}`}
              </p>
              <p className="text-sm text-slate-500">
                GSTIN: {buyerInfo?.gstin}
              </p>
              <p className="text-sm text-slate-500">
                Contact: {buyerInfo?.phone}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold tracking-widest text-primary">
                SHIP FROM
              </p>
              <p className="mt-3 text-xl font-bold text-slate-900 sm:text-3xl">
                {sellerInfo?.businessName}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {sellerInfo?.addressLine1}
              </p>
              <p className="text-sm text-slate-500">
                {`${sellerInfo?.city}, ${sellerInfo?.state} - ${sellerInfo?.pincode}`}
              </p>
              <p className="text-sm text-slate-500">
                Contact: {sellerInfo?.phone}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-190 text-left">
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
                  const itemTaxableAmount = item.basePrice * item.quantity;
                  const itemGstAmount =
                    (itemTaxableAmount * effectiveGstRate) / 100;
                  const itemTotalWithGst = itemTaxableAmount + itemGstAmount;

                  return (
                    <tr key={item.id}>
                      <td className="px-3 py-4 text-sm text-slate-500">
                        {`0${index + 1}`.slice(-2)}
                      </td>
                      <td className="px-3 py-4 text-sm font-bold text-slate-900">
                        {item.itemName}
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-600">5577</td>
                      <td className="px-3 py-4 text-sm text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-600">
                        {item.unit}
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-600">
                        {effectiveGstRate.toFixed(2)}%
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-600">
                        {formatCurrency(itemGstAmount)}
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-600">
                        {formatCurrency(item.basePrice)}
                      </td>
                      <td className="px-3 py-4 text-right text-sm font-bold text-slate-900">
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
                  Interest @ 18% p.a. will be charged if payment is not made
                  within 30 days.
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
      </div>
    </div>
  );
};

export default InvoicePreviewPage;
