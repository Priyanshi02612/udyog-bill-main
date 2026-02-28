"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  MdBusiness,
  MdDescription,
  MdEventBusy,
  MdPendingActions,
  MdReceiptLong,
  MdSettings,
  MdVerified,
} from "react-icons/md";

import { AuthContext } from "../../../../context/auth.context";
import { InvoiceService } from "../../../../lib/api/invoice";
import { KpiCard } from "../../../../components/manufacturer/kpi-card";
import {
  formatCurrency,
  formatDate,
  getErrorMessage,
  statusStyles,
} from "../../../../utils/helpers";
import { AuthContextType, Invoice, InvoiceStatus } from "../../../../utils/types";

const WholesalerDashboardPage = () => {
  const { user, authLoading } = useContext(AuthContext) as AuthContextType;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user?._id) {
        setInvoices([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await InvoiceService.getWholesalerInvoices(user._id);
        setInvoices(data || []);
      } catch (error) {
        toast.error(getErrorMessage(error) || "Failed to fetch dashboard data");
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

  const metrics = useMemo(() => {
    const totalInvoices = invoices.length;
    const totalPurchaseValue = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.total || 0),
      0,
    );
    const pendingAmount = invoices
      .filter(
        (invoice) =>
          invoice.status === InvoiceStatus.SENT ||
          invoice.status === InvoiceStatus.OVERDUE,
      )
      .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
    const overdueCount = invoices.filter(
      (invoice) => invoice.status === InvoiceStatus.OVERDUE,
    ).length;
    const paidCount = invoices.filter(
      (invoice) => invoice.status === InvoiceStatus.PAID,
    ).length;

    const supplierSet = new Set(
      invoices
        .map((invoice) => String(invoice.sellerId))
        .filter((supplierId) => supplierId.length > 0),
    );

    return {
      totalInvoices,
      totalPurchaseValue,
      pendingAmount,
      overdueCount,
      paidCount,
      activeSuppliers: supplierSet.size,
    };
  }, [invoices]);

  const supplierSummary = useMemo(() => {
    const supplierMap = new Map<
      string,
      { id: string; name: string; invoices: number; outstanding: number }
    >();

    invoices.forEach((invoice) => {
      const supplierId = String(invoice.sellerId);
      const supplierName =
        invoice.sellerInfo?.businessName || `Supplier ${supplierId.slice(-5)}`;

      const current = supplierMap.get(supplierId) ?? {
        id: supplierId,
        name: supplierName,
        invoices: 0,
        outstanding: 0,
      };

      current.invoices += 1;
      if (
        invoice.status === InvoiceStatus.SENT ||
        invoice.status === InvoiceStatus.OVERDUE
      ) {
        current.outstanding += Number(invoice.total || 0);
      }

      supplierMap.set(supplierId, current);
    });

    return Array.from(supplierMap.values())
      .sort((a, b) => b.outstanding - a.outstanding)
      .slice(0, 5);
  }, [invoices]);

  const recentInvoices = useMemo(() => invoices.slice(0, 8), [invoices]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-124px)] p-4 pb-6 sm:p-6 lg:p-8 lg:pb-0">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Wholesaler Dashboard
        </h1>
        <p className="mt-1 text-xs text-primary sm:text-base">
          Track purchase invoices, pending liabilities, and supplier exposure.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard
          icon={<MdReceiptLong className="w-6 h-6 text-blue-600" />}
          label="Total Invoices"
          value={metrics.totalInvoices}
          color="blue"
          subtitle={`${metrics.activeSuppliers} active suppliers`}
        />
        <KpiCard
          icon={<MdDescription className="w-6 h-6 text-primary" />}
          label="Total Purchase Value"
          value={formatCurrency(metrics.totalPurchaseValue)}
          color="primary"
        />
        <KpiCard
          icon={<MdPendingActions className="w-6 h-6 text-amber-600" />}
          label="Pending Amount"
          value={formatCurrency(metrics.pendingAmount)}
          color="amber"
          trendText={`${metrics.overdueCount} overdue invoices`}
          trendTone={metrics.overdueCount > 0 ? "danger" : "neutral"}
        />
        <KpiCard
          icon={<MdEventBusy className="w-6 h-6 text-red-600" />}
          label="Overdue"
          value={metrics.overdueCount}
          color="red"
        />
        <KpiCard
          icon={<MdVerified className="w-6 h-6 text-emerald-600" />}
          label="Paid Invoices"
          value={metrics.paidCount}
          color="emerald"
        />
        <KpiCard
          icon={<MdBusiness className="w-6 h-6 text-blue-600" />}
          label="Active Suppliers"
          value={metrics.activeSuppliers}
          color="blue"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Recent Purchase Invoices
            </h2>
          </div>
          <table className="min-w-210 w-full text-left text-xs xl:text-base">
            <thead className="border-b border-slate-200 bg-white">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Manufacturer</th>
                <th className="px-6 py-4">Invoice Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-slate-500">
                    No invoices available yet.
                  </td>
                </tr>
              ) : (
                recentInvoices.map((invoice) => {
                  const statusStyle = statusStyles[invoice.status];
                  return (
                    <tr key={String(invoice._id)} className="border-b border-slate-200">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {invoice.sellerInfo?.businessName || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(invoice.invoiceDate)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {invoice.invoiceDueDate
                          ? formatDate(invoice.invoiceDueDate)
                          : "-"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Supplier Outstanding
              </h3>
            </div>
            <div className="space-y-3 p-5">
              {supplierSummary.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No supplier data available.
                </p>
              ) : (
                supplierSummary.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="truncate text-sm font-bold text-slate-900">
                      {supplier.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {supplier.invoices} invoices
                    </p>
                    <p className="mt-2 text-sm font-semibold text-amber-700">
                      {formatCurrency(supplier.outstanding)} pending
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => router.push("/wholesaler/invoices")}
                className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left text-sm font-semibold text-blue-700"
              >
                Open Invoice Register
              </button>
              <button
                type="button"
                onClick={() => router.push("/wholesaler/profile")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700"
              >
                <span className="inline-flex items-center gap-2">
                  <MdSettings className="h-4 w-4" />
                  Update Profile
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesalerDashboardPage;
