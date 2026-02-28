"use client";

import { MdVisibility } from "react-icons/md";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate, statusStyles } from "../../utils/helpers";
import { InvoiceStatus } from "../../utils/types";
import { Button } from "../ui/button";

type DashboardInvoiceRow = {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  invoiceDate: string;
  total: number;
  status: InvoiceStatus;
};

export default function DashboardInvoicesTable({
  invoices,
}: {
  invoices: DashboardInvoiceRow[];
}) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
      <table className="w-full text-left text-xs xl:text-base">
        <thead>
          <tr className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest xl:text-sm">
            <th className="px-8 py-4">Invoice ID</th>
            <th className="px-8 py-4">Buyer</th>
            <th className="px-8 py-4">Date</th>
            <th className="px-8 py-4">Amount</th>
            <th className="px-8 py-4">Status</th>
            <th className="px-8 py-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 text-xs xl:text-sm">
          {invoices.map((invoice) => {
            const status = statusStyles[invoice.status];

            return (
              <tr
                key={invoice.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-8 py-4 font-bold text-slate-900">
                  #{invoice.invoiceNumber}
                </td>

                <td className="px-8 py-4 font-semibold text-slate-700">
                  {invoice.buyerName}
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
                      onClick={() =>
                        router.push(`/manufacturer/invoices/${invoice.id}`)
                      }
                    >
                      <MdVisibility className="w-5 h-5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}

          {invoices.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-8 py-10 text-center text-xs text-slate-500 xl:text-sm"
              >
                No invoices found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
