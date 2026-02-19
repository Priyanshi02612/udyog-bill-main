"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Dropdown } from "../../../../../components/ui/dropdown";
import { InvoiceGstConfig } from "../../../../../components/admin/invoice-gst-config";
import { InvoiceFinancialSummary } from "../../../../../components/admin/invoice-financial-summary";
import { InvoiceItemsTable } from "../../../../../components/admin/invoice-items-table";
import { AuthContext } from "../../../../../context/auth.context";
import {
  GstType,
  MAX_INVOICE_NOTES_LENGTH,
  TaxMode,
} from "../../../../../utils/constants";
import { mockInvoices } from "../../../../../utils/data";
import {
  getDefaultFinancialYear,
  getErrorMessage,
  getGstRateFromType,
  getInvoicePreviewMetrics,
  isDateInFinancialYear,
} from "../../../../../utils/helpers";
import {
  AuthContextType,
  CreateManufacturerInvoicePayload,
  FinancialYear,
  Invoice,
  InvoiceCreateState,
  InvoiceItem,
  InvoiceSubmitAction,
  Party,
} from "../../../../../utils/types";
import { ManufacturerService } from "../../../../../lib/api/manufacturer";

const createInvoiceItem = (gstPercentage: number): InvoiceItem => ({
  id: crypto.randomUUID(),
  hsnCode: "",
  quantity: "",
  unit: "",
  basePrice: "",
  gstPercentage,
  invoiceId: "",
  itemId: "",
  itemName: "",
});

const getNextInvoiceNumber = (invoices: Invoice[], year: number) => {
  const prefix = `INV-${year}-`;

  const maxSequence = invoices.reduce((max, invoice) => {
    if (!invoice.invoiceNumber.startsWith(prefix)) {
      return max;
    }

    const sequence = Number(invoice.invoiceNumber.slice(prefix.length));
    return Number.isFinite(sequence) ? Math.max(max, sequence) : max;
  }, 0);

  return `${prefix}${String(maxSequence + 1).padStart(3, "0")}`;
};

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId");
  const { user } = useContext(AuthContext) as AuthContextType;

  const [wholesalers, setWholesalers] = useState<Party[]>([]);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceCreateState>({
    invoiceNumber: "",
    wholesalerId: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    financialYear: getDefaultFinancialYear(),
    notes: "",
    gstType: GstType.GST_5,
    taxMode: TaxMode.CGST_SGST,
  });
  const {
    invoiceNumber,
    wholesalerId,
    invoiceDate,
    financialYear,
    notes,
    gstType,
    taxMode,
  } = invoiceDetails;
  const selectedGstRate = useMemo(() => getGstRateFromType(gstType), [gstType]);

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    createInvoiceItem(selectedGstRate),
  ]);

  const applyGst = gstType !== GstType.NO_GST;
  const effectiveTaxMode = applyGst ? taxMode : undefined;

  const [submittingAction, setSubmittingAction] =
    useState<InvoiceSubmitAction | null>(null);

  const computedRows = useMemo(
    () =>
      invoiceItems.map((item) => {
        const gross = Number(item.quantity) * Number(item.basePrice);
        const gstAmount =
          gross * (Math.max(Math.min(item.gstPercentage, 100), 0) / 100);
        const taxableAmount = gross - gstAmount;

        return {
          ...item,
          taxableAmount,
        };
      }),
    [invoiceItems],
  );

  useEffect(() => {
    if (!user) return;

    const fetchWholesalers = async () => {
      try {
        const response = await ManufacturerService.getWholesalers(user._id);
        setWholesalers(response.data);
      } catch (error) {
        toast.error(getErrorMessage(error) || "Failed to fetch wholesalers");
      }
    };

    fetchWholesalers();
  }, [user]);

  const {
    taxableSubtotal,
    totalGstAmount,
    cgstRate,
    sgstRate,
    igstRate,
    roundOff,
    totalAmountDue,
  } = getInvoicePreviewMetrics(computedRows, gstType, effectiveTaxMode);

  const selectedWholesaler = useMemo(
    () => wholesalers.find((party) => String(party.id) === wholesalerId),
    [wholesalerId, wholesalers],
  );

  const editableInvoice = useMemo(() => {
    if (!invoiceId) {
      return null;
    }

    return (
      mockInvoices.find((invoice) => String(invoice.id) === invoiceId) ?? null
    );
  }, [invoiceId]);

  const userInvoices = useMemo(
    () =>
      mockInvoices.filter(
        (invoice) => String(invoice.sellerId) === String(user?._id),
      ),
    [user],
  );

  useEffect(() => {
    if (!editableInvoice) {
      return;
    }

    const formWholesalerId = editableInvoice.buyerId.startsWith("party-")
      ? editableInvoice.buyerId.replace("party-", "")
      : editableInvoice.buyerId;

    const [year, month] = editableInvoice.invoiceDate.split("-").map(Number);

    const computedFinancialYear =
      month >= 4 ? `FY${year}-${year + 1}` : `FY${year - 1}-${year}`;

    setInvoiceDetails((prev) => ({
      ...prev,
      invoiceNumber: editableInvoice.invoiceNumber,
      wholesalerId: formWholesalerId,
      invoiceDate: editableInvoice.invoiceDate,
      financialYear: computedFinancialYear,
      notes: editableInvoice.notes || "",
      gstType: editableInvoice.gstType,
      taxMode: editableInvoice.taxMode || TaxMode.CGST_SGST,
    }));

    setInvoiceItems(
      editableInvoice.items.map((item) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
      })),
    );
  }, [editableInvoice]);

  useEffect(() => {
    if (editableInvoice) {
      return;
    }

    const nextInvoiceNumber = getNextInvoiceNumber(
      userInvoices,
      new Date().getFullYear(),
    );

    setInvoiceDetails((prev) =>
      prev.invoiceNumber === nextInvoiceNumber
        ? prev
        : { ...prev, invoiceNumber: nextInvoiceNumber },
    );
  }, [editableInvoice, userInvoices]);

  useEffect(() => {
    setInvoiceItems((prev) =>
      prev.map((item) =>
        item.gstPercentage === selectedGstRate
          ? item
          : { ...item, gstPercentage: selectedGstRate },
      ),
    );
  }, [selectedGstRate]);

  const handleInvoiceItemChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value, dataset } = event.target;
    const id = dataset.id as string;

    let updatedValue = value;

    if (name === "hsnCode") {
      updatedValue = value.replace(/[^0-9]/g, "");
    }

    setInvoiceItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [name]: updatedValue } : item,
      ),
    );
  };

  const addNewRow = () => {
    setInvoiceItems((prev) => [...prev, createInvoiceItem(selectedGstRate)]);
  };

  const removeRow = (id: string) => {
    setInvoiceItems((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((item) => item.id !== id);
    });
  };

  const validateForm = () => {
    if (!wholesalerId) {
      toast.error("Please select a wholesaler/client.");
      return false;
    }

    if (!invoiceDate) {
      toast.error("Invoice date is required.");
      return false;
    } else {
      const today = new Date();
      const selectedDate = new Date(invoiceDate);
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate.getTime() > today.getTime()) {
        toast.error("Invoice date cannot be in the future.");
        return false;
      } else if (
        financialYear &&
        !isDateInFinancialYear(invoiceDate, financialYear)
      ) {
        toast.error("Invoice date does not match the selected financial year.");
        return false;
      }
    }

    if (!financialYear) {
      toast.error("Financial year is required.");
      return false;
    }

    if (notes.length > MAX_INVOICE_NOTES_LENGTH) {
      toast.error(
        `Notes should not exceed ${MAX_INVOICE_NOTES_LENGTH} characters.`,
      );
      return false;
    }

    if (computedRows.length === 0 || taxableSubtotal <= 0) {
      toast.error("Add at least one valid line item.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (action: InvoiceSubmitAction) => {
    if (!validateForm()) {
      return;
    }

    const payload: CreateManufacturerInvoicePayload = {
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate,
      financialYear,
      gstType,
      cgstRate,
      sgstRate,
      igstRate,
      roundOff,
      sellerId: user._id,
      buyerId: wholesalerId,
      status: action,
      taxMode: effectiveTaxMode,
      totalTaxAmount: totalGstAmount,
      subtotal: taxableSubtotal,
      notes: notes.trim() || undefined,
      total: totalAmountDue,
      items: computedRows.map((item) => ({
        id: item.itemName.trim(),
        invoiceId: "",
        itemId: "",
        itemName: item.itemName.trim(),
        hsnCode: item.hsnCode,
        quantity: item.quantity,
        unit: item.unit.trim(),
        basePrice: item.basePrice,
        gstPercentage: item.gstPercentage,
        taxableAmount: item.taxableAmount,
      })),
    };

    try {
      setSubmittingAction(action);
      console.log(payload);
      router.push("/manufacturer/invoices");
      toast.success("Invoice created successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmittingAction(null);
    }
  };

  const wholesalersList = useMemo(() => {
    return wholesalers.map((wholesaler: Party) => ({
      value: wholesaler.businessName,
      label: wholesaler.businessName,
    }));
  }, [wholesalers]);

  const financialYearsOptions = useMemo(() => {
    return user.financialYears.map((financialYear: FinancialYear) => ({
      value: financialYear.id,
      label: financialYear.label,
    }));
  }, [user]);

  return (
    <div className="relative min-h-[calc(100vh-124px)] p-4 pb-6 sm:p-6 lg:p-8 lg:pb-0">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Manual Invoice Creation
          </h1>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 shadow-sm sm:flex-none"
            onClick={() => router.push("/manufacturer/invoices")}
          >
            Cancel
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            className="flex-1 sm:flex-none"
            loading={submittingAction === "DRAFT"}
            onClick={() => handleSubmit("DRAFT")}
          >
            Save Draft
          </Button>
          <Button
            size="sm"
            className="w-full sm:w-auto"
            loading={submittingAction === "SENT"}
            onClick={() => handleSubmit("SENT")}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label className="text-[#0d161b] text-sm font-semibold">
              Invoice Number
            </label>

            <div className="w-full  rounded-lg border p-3.25 text-sm bg-slate-50 text-[#0d161b] border-[#cfdde7]">
              {invoiceNumber}
            </div>
          </div>

          <Dropdown
            options={[
              { value: "", label: "Select Wholesaler" },
              ...wholesalersList,
            ]}
            label="Wholesaler"
            value={wholesalerId}
            onChange={(event) =>
              setInvoiceDetails((prev) => ({
                ...prev,
                wholesalerId: event.target.value,
              }))
            }
          />
          <Dropdown
            options={[
              { value: "", label: "Select Financial Year" },
              ...financialYearsOptions,
            ]}
            label="Financial Year"
            value={financialYear}
            onChange={(event) =>
              setInvoiceDetails((prev) => ({
                ...prev,
                financialYear: event.target.value,
              }))
            }
          />

          <div>
            <Input
              label="Invoice Date"
              type="date"
              value={invoiceDate}
              onChange={(event) =>
                setInvoiceDetails((prev) => ({
                  ...prev,
                  invoiceDate: event.target.value,
                }))
              }
            />
          </div>
        </div>
      </div>

      <InvoiceItemsTable
        items={computedRows}
        onItemChange={handleInvoiceItemChange}
        onAddRow={addNewRow}
        onRemoveRow={removeRow}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <InvoiceGstConfig
            gstType={gstType}
            taxMode={taxMode}
            applyGst={applyGst}
            effectiveTaxMode={effectiveTaxMode}
            computedRows={computedRows}
            onGstTypeChange={(value) =>
              setInvoiceDetails((prev) => ({
                ...prev,
                gstType: value as GstType,
              }))
            }
            onTaxModeChange={(value) =>
              setInvoiceDetails((prev) => ({
                ...prev,
                taxMode: value,
              }))
            }
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Additional Notes / Terms
            </label>
            <textarea
              value={notes}
              onChange={(event) =>
                setInvoiceDetails((prev) => ({
                  ...prev,
                  notes: event.target.value,
                }))
              }
              placeholder="Terms of payment, delivery instructions, etc..."
              rows={5}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm focus:border-primary focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">Optional</span>

              <span className="text-xs text-slate-400">
                {notes.length}/{MAX_INVOICE_NOTES_LENGTH}
              </span>
            </div>
          </div>
        </div>

        <InvoiceFinancialSummary
          gstType={gstType}
          effectiveTaxMode={effectiveTaxMode}
          computedRows={computedRows}
          selectedBuyerGstin={selectedWholesaler?.gstin}
        />
      </div>
    </div>
  );
}
