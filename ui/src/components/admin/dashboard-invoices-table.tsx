"use client";

import { MdDownload, MdVisibility } from "react-icons/md";
import { mockInvoices } from "../../utils/data";
import { formatCurrency, formatDate, statusStyles } from "../../utils/helpers";
import { InvoiceStatus } from "../../utils/types";
import { Button } from "../ui/button";

export default function DashboardInvoicesTable() {
  return (
    <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <th className="px-8 py-4">Invoice ID</th>
            <th className="px-8 py-4">Buyer</th>
            <th className="px-8 py-4">Date</th>
            <th className="px-8 py-4">Amount</th>
            <th className="px-8 py-4">Status</th>
            <th className="px-8 py-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 text-sm">
          {mockInvoices.map((invoice) => {
            const status = statusStyles[invoice.status as InvoiceStatus];

            return (
              <tr
                key={invoice.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-8 py-4 font-bold text-slate-900">
                  #{invoice.invoiceNumber}
                </td>

                <td className="px-8 py-4 font-semibold text-slate-700">
                  {invoice.buyerId}
                </td>

                <td className="px-8 py-4 text-slate-500">
                  {formatDate(invoice.invoiceDate)}
                </td>

                <td className="px-8 py-4 font-bold text-slate-900">
                  {formatCurrency(invoice.total)}
                </td>

                <td className="px-8 py-4">
                  <span
                    className={`px-3 py-1 ${status.bg} ${status.text} text-[10px] font-bold rounded-lg uppercase`}
                  >
                    {status.label}
                  </span>
                </td>

                <td className="px-8 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="link"
                      className="w-8 h-8"
                      onClick={() => console.log("View", invoice.id)}
                    >
                      <MdVisibility className="w-5 h-5" />
                    </Button>

                    <Button
                      variant="link"
                      className="w-8 h-8"
                      onClick={() => console.log("Download", invoice.id)}
                    >
                      <MdDownload className="w-5 h-5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
