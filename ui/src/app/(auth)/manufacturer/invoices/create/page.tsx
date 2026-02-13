"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import {
  MdAdd,
  MdDeleteOutline,
  MdInventory2,
  MdOutlineAccountBalance,
  MdOutlineSummarize,
} from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Dropdown } from "../../../../../components/ui/dropdown";
import { AuthContext } from "../../../../../context/auth.context";
import {
  DEFAULT_INVOICE_ITEM_UNIT,
  financialYearsOptions,
  GstType,
  gstTypeOptions,
  MAX_INVOICE_NOTES_LENGTH,
  TaxMode,
} from "../../../../../utils/constants";
import { mockInvoices, MOCK_WHOLESALERS } from "../../../../../utils/data";
import {
  formatCurrency,
  getDefaultFinancialYear,
  getErrorMessage,
  getGstRateFromType,
  getInvoicePreviewMetrics,
  isDateInFinancialYear,
  toIndianAmountWords,
} from "../../../../../utils/helpers";
import {
  AuthContextType,
  CreateManufacturerInvoicePayload,
  InvoiceCreateState,
  InvoiceItem,
  InvoiceSubmitAction,
} from "../../../../../utils/types";

const createInvoiceItem = (gstPercentage: number): InvoiceItem => ({
  id: crypto.randomUUID(),
  hsnCode: 0,
  quantity: 0,
  unit: DEFAULT_INVOICE_ITEM_UNIT,
  basePrice: 0,
  gstPercentage,
  invoiceId: "",
  itemId: "",
  itemName: "",
});

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId");
  const { user } = useContext(AuthContext) as AuthContextType;

  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceCreateState>({
    wholesalerId: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    financialYear: getDefaultFinancialYear(),
    notes: "",
    gstType: GstType.GST_5,
    taxMode: TaxMode.CGST_SGST,
  });
  const { wholesalerId, invoiceDate, financialYear, notes, gstType, taxMode } =
    invoiceDetails;
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
        const gross = item.quantity * item.basePrice;
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
  } = getInvoicePreviewMetrics(computedRows, gstType, effectiveTaxMode);

  const selectedWholesaler = useMemo(
    () => MOCK_WHOLESALERS.find((party) => String(party.id) === wholesalerId),
    [wholesalerId],
  );

  const editableInvoice = useMemo(() => {
    if (!invoiceId) {
      return null;
    }

    return (
      mockInvoices.find((invoice) => String(invoice.id) === invoiceId) ?? null
    );
  }, [invoiceId]);

  useEffect(() => {
    if (!editableInvoice) {
      return;
    }

    const formWholesalerId = editableInvoice.buyerId.startsWith("party-")
      ? editableInvoice.buyerId.replace("party-", "")
      : editableInvoice.buyerId;

    const [year, month] = editableInvoice.invoiceDate.split("-").map(Number);

    const computedFinancialYear =
      month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

    setInvoiceDetails((prev) => ({
      ...prev,
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

  const wholesalersList = MOCK_WHOLESALERS.map((wholesaler) => {
    return { value: wholesaler.businessName, label: wholesaler.businessName };
  });

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Financial Year
            </label>
            <select
              value={financialYear}
              onChange={(event) =>
                setInvoiceDetails((prev) => ({
                  ...prev,
                  financialYear: event.target.value,
                }))
              }
              className="h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Select Financial Year</option>
              {financialYearsOptions
                .filter((option) => option.value)
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    FY {option.value}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
          <MdInventory2 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Invoice Line Items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-245">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">HSN Code</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Price (₹)</th>
                <th className="px-4 py-3">GST (%)</th>
                <th className="px-4 py-3 text-right">Amount (₹)</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {computedRows.map((item, index) => {
                return (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {`0${index + 1}`.slice(-2)}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        name="itemName"
                        data-id={item.id}
                        value={item.itemName}
                        onChange={handleInvoiceItemChange}
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
                        placeholder="Enter product name"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={item.hsnCode}
                        name="hsnCode"
                        data-id={item.id}
                        onChange={handleInvoiceItemChange}
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
                        placeholder="5007"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={item.quantity}
                        name="quantity"
                        data-id={item.id}
                        onChange={handleInvoiceItemChange}
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={item.unit}
                        name="unit"
                        data-id={item.id}
                        onChange={handleInvoiceItemChange}
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
                        placeholder="Meters"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={item.basePrice}
                        name="basePrice"
                        data-id={item.id}
                        onChange={handleInvoiceItemChange}
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={item.gstPercentage}
                        name="gstPercentage"
                        data-id={item.id}
                        readOnly
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                      {formatCurrency(item.taxableAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        title="Remove Row"
                      >
                        <MdDeleteOutline className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={addNewRow}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80"
          >
            <MdAdd className="h-5 w-5" />
            Add New Row
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
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
                value={gstType}
                onChange={(event) =>
                  setInvoiceDetails((prev) => ({
                    ...prev,
                    gstType: event.target.value as GstType,
                  }))
                }
              />

              {applyGst ? (
                <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setInvoiceDetails((prev) => ({
                        ...prev,
                        taxMode: TaxMode.CGST_SGST,
                      }))
                    }
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                      taxMode === TaxMode.CGST_SGST
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-300 bg-white text-slate-500"
                    }`}
                  >
                    CGST + SGST (Intra-state)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setInvoiceDetails((prev) => ({
                        ...prev,
                        taxMode: TaxMode.IGST,
                      }))
                    }
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                      taxMode === TaxMode.IGST
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
                  taxMode === TaxMode.CGST_SGST ? (
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
                  <div className="text-slate-600">
                    GST disabled for this invoice.
                  </div>
                )}
              </div>
            </div>
          </div>

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
            {selectedWholesaler && (
              <p className="mt-2 text-xs text-slate-500">
                Selected buyer GSTIN: {selectedWholesaler.gstin}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
