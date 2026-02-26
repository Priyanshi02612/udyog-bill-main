"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  MdAccountBalanceWallet,
  MdAdd,
  MdBolt,
  MdDelete,
  MdDeleteOutline,
  MdEdit,
  MdEventBusy,
  MdPaid,
  MdPendingActions,
  MdSearch,
  MdVisibility,
} from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "../../../../context/auth.context";
import { KpiCard } from "../../../../components/admin/kpi-card";
import { Button } from "../../../../components/ui/button";
import { Dropdown } from "../../../../components/ui/dropdown";
import { Input } from "../../../../components/ui/input";
import ConfirmModal from "../../../../components/ui/modal";
import Pagination from "../../../../components/pagination";
import {
  InvoicePdf,
  InvoicesPdf,
} from "../../../../components/admin/invoice-pdf-template";
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
} from "../../../../utils/types";
import toast from "react-hot-toast";
import { InvoiceService } from "../../../../lib/api/invoice";
import { ManufacturerService } from "../../../../lib/api/manufacturer";

const PAGE_SIZE = 4;

export default function Invoices() {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [wholesalerNameById, setWholesalerNameById] = useState<
    Record<string, string>
  >({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const searchParams = useSearchParams();
  const wholesalerId = searchParams.get("wholesaler") || "";

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
        const [data, wholesalersResponse] = await Promise.all([
          InvoiceService.getManufacturerInvoices(user._id),
          ManufacturerService.getWholesalers(user._id),
        ]);

        const wholesalerMap = (wholesalersResponse.data || []).reduce(
          (
            acc: Record<string, string>,
            wholesaler: { userId: string; businessName: string },
          ) => {
            acc[String(wholesaler.userId)] = wholesaler.businessName;
            return acc;
          },
          {},
        );

        const invoicesWithSellerInfo = (data || []).map((invoice: Invoice) => ({
          ...invoice,
          sellerInfo: user,
        }));

        setInvoices(invoicesWithSellerInfo);
        setWholesalerNameById(wholesalerMap);
        setSelectedIds([]);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

  useEffect(() => {
    if (!wholesalerId) return;

    setSearchQuery(wholesalerNameById[wholesalerId] || "");
  }, [wholesalerId, wholesalerNameById]);

  const handleDeleteSelected = async () => {
    const idsToDelete = [...selectedIds];
    if (idsToDelete.length === 0) {
      return;
    }

    try {
      setInvoices((prev) =>
        prev.filter((invoice) => !idsToDelete.includes(String(invoice._id))),
      );
      setSelectedIds([]);
    } catch {
      toast.error("Failed to delete selected invoices. Please try again.");
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const resolveWholesalerName = useCallback(
    (invoice: Invoice) =>
      invoice.buyerInfo?.businessName ||
      wholesalerNameById[String(invoice.buyerId)] ||
      invoice.buyerId,
    [wholesalerNameById],
  );

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesSearch =
        query.length === 0 ||
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        resolveWholesalerName(invoice).toLowerCase().includes(query);

      const matchesStatus =
        selectedStatus.length === 0 || invoice.status === selectedStatus;

      const matchesFinancialYear =
        selectedFinancialYear.length === 0 ||
        invoice.financialYear === selectedFinancialYear;

      return matchesSearch && matchesStatus && matchesFinancialYear;
    });
  }, [
    invoices,
    searchQuery,
    selectedStatus,
    selectedFinancialYear,
    resolveWholesalerName,
  ]);

  const totalOutstanding = useMemo(
    () =>
      filteredInvoices
        .filter((invoice) => invoice.status !== "PAID")
        .reduce((total, invoice) => total + invoice.total, 0),
    [filteredInvoices],
  );

  const awaitingPayment = useMemo(
    () =>
      filteredInvoices.filter((invoice) => invoice.status === "SENT").length,
    [filteredInvoices],
  );

  const paidThisMonth = useMemo(
    () =>
      filteredInvoices
        .filter((invoice) => invoice.status === "PAID")
        .reduce((total, invoice) => total + invoice.total, 0),
    [filteredInvoices],
  );

  const overdueCount = useMemo(
    () =>
      filteredInvoices.filter((invoice) => invoice.status === "OVERDUE").length,
    [filteredInvoices],
  );

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
      : `manufacturer-invoices-${selectedInvoices.length}.pdf`;

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

  const handleReset = useCallback(() => {
    if (wholesalerId) {
      router.replace("/manufacturer/invoices");
    }

    setSearchQuery("");
    setSelectedStatus("");
    setSelectedFinancialYear("");
    setSelectedIds([]);
  }, [router, wholesalerId]);

  const handleEditInvoice = (invoiceId: string) => {
    router.push(`/manufacturer/invoices/create?invoiceId=${invoiceId}`);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredInvoices.slice(start, end);
  }, [filteredInvoices, safePage]);

  const financialYearsOptions = useMemo(() => {
    const financialYears = user.financialYears || [];

    return [
      { label: "Select Financial Year", value: "" },
      ...financialYears.map((financialYear: FinancialYear) => ({
        label: financialYear.label,
        value: financialYear.id,
      })),
    ];
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-124px)] p-4 pb-6 sm:p-6 lg:p-8 lg:pb-0">
      <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Manufacturer Invoices
          </h1>
          <p className="text-xs text-primary md:text-base">
            Manage and track your wholesale billing operations.
          </p>
        </div>

        <div className="flex items-center gap-4 self-start md:self-end">
          <Button
            size="sm"
            leadingIcon={<MdAdd className="w-5 h-5" />}
            className="w-full sm:w-auto "
            onClick={() => router.push("/manufacturer/invoices/create")}
          >
            Create New Invoice
          </Button>

          <Button
            size="sm"
            leadingIcon={<MdBolt className="w-5 h-5" />}
            className="w-full sm:w-auto"
            onClick={() => router.push("/manufacturer/invoices/create-ai")}
          >
            Create With AI
          </Button>
        </div>
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
          label="Paid This Month"
          value={formatCurrency(paidThisMonth)}
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

      <div className="mb-6 flex 2xl:flex-row flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(320px,1fr)_220px_220px_auto] items-center">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search wholesaler or invoice number..."
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
            <span className="text-sm text-slate-400 mr-2">
              {selectedIds.length} selected
            </span>
          )}

          <Button
            size="sm"
            disabled={!canDownload}
            className="flex-1 sm:flex-none disabled:bg-gray-200 disabled:text-gray-400 shadow-none disabled:pointer-events-none"
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

          <Button
            size="sm"
            leadingIcon={<MdDeleteOutline className="w-5 h-5" />}
            onClick={() => setDeleteModalOpen(true)}
            disabled={selectedIds.length <= 0}
            className="flex-1 sm:flex-none disabled:bg-gray-200 disabled:text-gray-400 shadow-none disabled:pointer-events-none"
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto min-h-103 xl:min-h-78">
        <table className="w-full min-w-190 text-left">
          <thead>
            <tr className="bg-slate-50/50 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <th className="p-4 w-12 text-center">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-4 sm:px-8">Invoice ID</th>
              <th className="px-4 py-4 sm:px-8">Wholesaler</th>
              <th className="px-4 py-4 sm:px-8">Issue Date</th>
              <th className="px-4 py-4 sm:px-8">Amount</th>
              <th className="px-4 py-4 sm:px-8">Status</th>
              <th className="px-4 py-4 text-end sm:px-8">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedItems.map((invoice, index) => {
              const status =
                statusStyles[invoice.status as keyof typeof statusStyles];

              return (
                <tr
                  key={index}
                  className="hover:bg-primary/5 transition-colors"
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

                  <td className="p-4">{resolveWholesalerName(invoice)}</td>

                  <td className="p-4 text-slate-500">
                    {formatDate(invoice.invoiceDate)}
                  </td>

                  <td className="p-4 font-bold">
                    {formatCurrency(invoice.total)}
                  </td>

                  <td className="px-4 py-4 sm:px-8">
                    <span
                      className={`px-3 py-1 ${status.bg} ${status.text} text-sm font-bold rounded-lg`}
                    >
                      {status.label}
                    </span>
                  </td>

                  <td className="px-4 py-4 sm:px-8">
                    <div className="flex items-center justify-end gap-2">
                      {status.label === "Draft" && (
                        <Button
                          variant="link"
                          className="w-8 h-8"
                          onClick={() => handleEditInvoice(String(invoice._id))}
                        >
                          <MdEdit className="w-5 h-5" />
                        </Button>
                      )}

                      <Button
                        variant="link"
                        className="w-8 h-8"
                        onClick={() =>
                          router.push(`/manufacturer/invoices/${invoice._id}`)
                        }
                      >
                        <MdVisibility className="w-5 h-5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedItems.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
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

      <ConfirmModal
        open={deleteModalOpen}
        title={`Remove Invoice${selectedInvoices.length > 1 ? "s" : ""} `}
        description={`Are you sure you want to remove this invoice${selectedInvoices.length > 1 ? "s" : ""}? This action cannot be undone.`}
        confirmText="Yes, Remove"
        icon={<MdDelete className="h-8 w-8 text-danger" />}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSelected}
      />
    </div>
  );
}
