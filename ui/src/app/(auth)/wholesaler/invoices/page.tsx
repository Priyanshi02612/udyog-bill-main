"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  MdAccountBalanceWallet,
  MdDownload,
  MdDoneAll,
  MdEventBusy,
  MdPaid,
  MdPendingActions,
  MdSearch,
} from "react-icons/md";
import toast from "react-hot-toast";

import { AuthContext } from "../../../../context/auth.context";
import { KpiCard } from "../../../../components/manufacturer/kpi-card";
import { Button } from "../../../../components/ui/button";
import { Dropdown } from "../../../../components/ui/dropdown";
import { Input } from "../../../../components/ui/input";
import Pagination from "../../../../components/pagination";
import {
  InvoicePdf,
  InvoicesPdf,
} from "../../../../components/manufacturer/invoice-pdf-template";
import { invoiceStatusOptions } from "../../../../utils/constants";
import {
  formatCurrency,
  formatDate,
  getErrorMessage,
  statusStyles,
} from "../../../../utils/helpers";
import {
  AuthContextType,
  FinancialYear,
  Invoice,
  InvoiceStatus,
} from "../../../../utils/types";
import { InvoiceService } from "../../../../lib/api/invoice";

const PAGE_SIZE = 6;

const WholesalerInvoicesPage = () => {
  const { user, authLoading } = useContext(AuthContext) as AuthContextType;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user?._id) {
        setInvoices([]);
        setSelectedIds([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await InvoiceService.getWholesalerInvoices(user._id);
        const normalized = (data || []).map((invoice: Invoice) => ({
          ...invoice,
          buyerInfo: invoice.buyerInfo || user,
        }));
        setInvoices(normalized);
        setSelectedIds([]);
      } catch (error) {
        toast.error(getErrorMessage(error) || "Failed to fetch invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return invoices.filter((invoice) => {
      if (invoice.status === InvoiceStatus.DRAFT) {
        return false;
      }

      const manufacturerName =
        invoice.sellerInfo?.businessName?.toLowerCase() || "";

      const matchesSearch =
        query.length === 0 ||
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        manufacturerName.includes(query);

      const matchesStatus =
        selectedStatus.length === 0 || invoice.status === selectedStatus;

      const matchesFinancialYear =
        selectedFinancialYear.length === 0 ||
        invoice.financialYear === selectedFinancialYear;

      return matchesSearch && matchesStatus && matchesFinancialYear;
    });
  }, [invoices, searchQuery, selectedStatus, selectedFinancialYear]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedFinancialYear, selectedStatus]);

  const totalOutstanding = useMemo(
    () =>
      filteredInvoices
        .filter((invoice) => invoice.status !== InvoiceStatus.PAID)
        .reduce((total, invoice) => total + invoice.total, 0),
    [filteredInvoices],
  );

  const awaitingPayment = useMemo(
    () =>
      filteredInvoices.filter(
        (invoice) => invoice.status === InvoiceStatus.SENT,
      ).length,
    [filteredInvoices],
  );

  const paidTotal = useMemo(
    () =>
      filteredInvoices
        .filter((invoice) => invoice.status === InvoiceStatus.PAID)
        .reduce((total, invoice) => total + invoice.total, 0),
    [filteredInvoices],
  );

  const overdueCount = useMemo(
    () =>
      filteredInvoices.filter(
        (invoice) => invoice.status === InvoiceStatus.OVERDUE,
      ).length,
    [filteredInvoices],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);

  const paginatedInvoices = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredInvoices.slice(start, end);
  }, [filteredInvoices, safePage]);

  const allSelected =
    filteredInvoices.length > 0 &&
    filteredInvoices.every((invoice) =>
      selectedIds.includes(String(invoice._id)),
    );

  const selectedInvoice = useMemo(() => {
    if (selectedIds.length !== 1) {
      return null;
    }

    return (
      invoices.find((invoice) => String(invoice._id) === selectedIds[0]) ?? null
    );
  }, [selectedIds, invoices]);

  const selectedInvoices = useMemo(
    () =>
      invoices.filter((invoice) =>
        selectedIds.some((selectedId) => selectedId === String(invoice._id)),
      ),
    [invoices, selectedIds],
  );

  const canDownload = selectedInvoices.length > 0;
  const downloadFileName =
    selectedInvoices.length === 1
      ? `${selectedInvoices[0].invoiceNumber}.pdf`
      : `wholesaler-invoices-${selectedInvoices.length}.pdf`;

  const toggleSelectAll = () => {
    if (allSelected) {
      const visibleIds = new Set(
        filteredInvoices.map((invoice) => String(invoice._id)),
      );
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
      return;
    }

    const visibleIds = filteredInvoices.map((invoice) => String(invoice._id));
    setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedStatus("");
    setSelectedFinancialYear("");
    setSelectedIds([]);
    setPage(1);
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    if (!user?._id) return;

    try {
      await InvoiceService.markInvoiceAsPaid(invoiceId, user._id);

      setInvoices((prev) =>
        prev.map((invoice) =>
          String(invoice._id) === invoiceId
            ? { ...invoice, status: InvoiceStatus.PAID }
            : invoice,
        ),
      );

      toast.success("Invoice marked as paid");
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to update invoice status");
    }
  };

  const financialYearsOptions = useMemo(() => {
    const financialYears = user?.financialYears || [];

    return [
      { label: "Select Financial Year", value: "" },
      ...financialYears.map((financialYear: FinancialYear) => ({
        label: financialYear.label,
        value: financialYear.id,
      })),
    ];
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-124px)] p-4 pb-6 sm:p-6 lg:p-8 lg:pb-0">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Purchase Invoices
        </h1>
        <p className="text-xs text-primary md:text-base">
          View, filter, and export invoices received from manufacturers.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-8 xl:grid-cols-4">
        <KpiCard
          label="Total Outstanding"
          value={formatCurrency(totalOutstanding)}
          icon={<MdAccountBalanceWallet className="w-6 h-6 text-primary" />}
          color="primary"
        />

        <KpiCard
          label="Awaiting Payment"
          value={awaitingPayment}
          icon={<MdPendingActions className="w-6 h-6 text-emerald-600" />}
          color="emerald"
        />

        <KpiCard
          label="Paid Value"
          value={formatCurrency(paidTotal)}
          icon={<MdPaid className="w-6 h-6 text-amber-500" />}
          color="amber"
        />

        <KpiCard
          label="Overdue"
          value={overdueCount}
          icon={<MdEventBusy className="w-6 h-6 text-danger" />}
          color="red"
        />
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 2xl:flex-row">
        <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(320px,1fr)_220px_220px_auto]">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search manufacturer or invoice number..."
            leadingIcon={<MdSearch />}
          />

          <Dropdown
            value={selectedFinancialYear}
            onChange={(event) => setSelectedFinancialYear(event.target.value)}
            options={financialYearsOptions}
          />

          <Dropdown
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            options={invoiceStatusOptions}
          />

          <Button
            variant="outline-secondary"
            size="sm"
            className="h-max"
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <span className="mr-2 text-sm text-slate-400">
              {selectedIds.length} selected
            </span>
          )}

          <Button
            size="sm"
            disabled={!canDownload}
            leadingIcon={<MdDownload className="w-5 h-5" />}
            className="flex-1 shadow-none disabled:pointer-events-none disabled:bg-gray-200 disabled:text-gray-400 sm:flex-none"
          >
            {selectedInvoices.length === 1 && selectedInvoice ? (
              <PDFDownloadLink
                document={<InvoicePdf invoice={selectedInvoice} />}
                fileName={downloadFileName}
              >
                Download
              </PDFDownloadLink>
            ) : selectedInvoices.length > 1 ? (
              <PDFDownloadLink
                document={<InvoicesPdf invoices={selectedInvoices} />}
                fileName={downloadFileName}
              >
                Download All
              </PDFDownloadLink>
            ) : (
              "Download"
            )}
          </Button>
        </div>
      </div>

      <div className="min-h-110 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm xl:min-h-84">
        <table className="w-full min-w-190 text-left text-xs xl:text-base">
          <thead>
            <tr className="bg-slate-50/50 text-xs font-bold uppercase tracking-widest text-slate-400 xl:text-sm">
              <th className="w-12 p-4 text-center">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-4 sm:px-8">Invoice ID</th>
              <th className="px-4 py-4 sm:px-8">Manufacturer</th>
              <th className="px-4 py-4 sm:px-8">Issue Date</th>
              <th className="px-4 py-4 sm:px-8">Due Date</th>
              <th className="px-4 py-4 sm:px-8">Amount</th>
              <th className="px-4 py-4 sm:px-8">Status</th>
              <th className="px-4 py-4 text-end sm:px-8">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedInvoices.map((invoice) => {
              const status =
                statusStyles[invoice.status as keyof typeof statusStyles];

              return (
                <tr
                  key={String(invoice._id)}
                  className="transition-colors hover:bg-primary/5"
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(String(invoice._id))}
                      onChange={() => toggleSelect(String(invoice._id))}
                      className="cursor-pointer"
                    />
                  </td>

                  <td className="p-4 font-bold">{invoice.invoiceNumber}</td>

                  <td className="p-4">
                    {invoice.sellerInfo?.businessName || invoice.sellerId}
                  </td>

                  <td className="p-4 text-slate-500">
                    {formatDate(invoice.invoiceDate)}
                  </td>

                  <td className="p-4 text-slate-500">
                    {invoice.invoiceDueDate
                      ? formatDate(invoice.invoiceDueDate)
                      : "-"}
                  </td>

                  <td className="p-4 font-bold">
                    {formatCurrency(invoice.total)}
                  </td>

                  <td className="px-4 py-4 sm:px-8">
                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-bold ${status.bg} ${status.text} xl:text-sm`}
                    >
                      {invoice.status === InvoiceStatus.SENT
                        ? "Received"
                        : status.label}
                    </span>
                  </td>

                  <td className="px-4 py-4 sm:px-8">
                    <div className="flex items-center justify-end">
                      {(invoice.status === InvoiceStatus.SENT ||
                        invoice.status === InvoiceStatus.OVERDUE) && (
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          leadingIcon={<MdDoneAll className="w-4 h-4" />}
                          onClick={() => handleMarkAsPaid(String(invoice._id))}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedInvoices.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  No invoices found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={filteredInvoices.length}
        currentPage={safePage}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
};

export default WholesalerInvoicesPage;
