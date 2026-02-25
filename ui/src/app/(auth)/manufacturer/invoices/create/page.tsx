/* eslint-disable @typescript-eslint/no-explicit-any */
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
  INVOICE_PREFIX,
  TaxMode,
} from "../../../../../utils/constants";
import {
  getDefaultFinancialYear,
  getNextDocumentNumber,
  getErrorMessage,
  getGstRateFromType,
  getInvoicePreviewMetrics,
  isDateInFinancialYear,
} from "../../../../../utils/helpers";
import {
  AuthContextType,
  CreateManufacturerInvoicePayload,
  FinancialYear,
  Item,
  InvoiceCreateState,
  InvoiceItem,
  InvoiceSubmitAction,
  UserProfile,
} from "../../../../../utils/types";
import { ManufacturerService } from "../../../../../lib/api/manufacturer";
import { ItemsService } from "../../../../../lib/api/items";
import { InvoiceService } from "../../../../../lib/api/invoice";

const createInvoiceItem = (gstPercentage: number): InvoiceItem => ({
  id: crypto.randomUUID(),
  hsnCode: "",
  quantity: "",
  unit: "",
  basePrice: "",
  gstPercentage,
  invoiceId: "",
  itemId: "",
  name: "",
});

type StockErrorField = {
  code: string;
  itemId: string;
  requestedQuantity: number;
  availableQuantity: number;
};

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId");
  const { user } = useContext(AuthContext) as AuthContextType;

  const [wholesalers, setWholesalers] = useState<UserProfile[]>([]);
  const [masterItems, setMasterItems] = useState<Item[]>([]);
  const [existingInvoices, setExistingInvoices] = useState<any[]>([]);
  const [editableInvoice, setEditableInvoice] = useState<any | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceCreateState>({
    wholesalerId: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    financialYear: getDefaultFinancialYear(),
    gstType: GstType.GST_5,
    taxMode: TaxMode.CGST_SGST,
  });
  const { wholesalerId, invoiceDate, financialYear, gstType, taxMode } =
    invoiceDetails;
  const selectedGstRate = useMemo(() => getGstRateFromType(gstType), [gstType]);

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    createInvoiceItem(selectedGstRate),
  ]);
  const [stockErrorsByRowId, setStockErrorsByRowId] = useState<
    Record<string, string>
  >({});

  const applyGst = gstType !== GstType.NO_GST;
  const effectiveTaxMode = applyGst ? taxMode : undefined;

  const [submittingAction, setSubmittingAction] =
    useState<InvoiceSubmitAction | null>(null);
  const isEditMode = Boolean(invoiceId && editableInvoice);

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
    if (!user) {
      setWholesalers([]);
      setMasterItems([]);
      return;
    }

    const fetchInitialInvoiceData = async () => {
      try {
        const [wholesalersResponse, itemsResponse, invoicesResponse] =
          await Promise.all([
          ManufacturerService.getWholesalers(user._id),
          ItemsService.getUsersMasterItems(user._id),
          InvoiceService.getManufacturerInvoices(user._id),
        ]);

        setWholesalers(wholesalersResponse.data || []);
        setMasterItems((itemsResponse.data as Item[]) || []);
        setExistingInvoices(invoicesResponse || []);
      } catch (error) {
        toast.error(
          getErrorMessage(error) || "Failed to fetch invoice form data",
        );
      }
    };

    fetchInitialInvoiceData();
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
    () => wholesalers.find((party) => String(party.userId) === wholesalerId),
    [wholesalerId, wholesalers],
  );

  useEffect(() => {
    const fetchEditableInvoice = async () => {
      if (!invoiceId) {
        setEditableInvoice(null);
        return;
      }

      try {
        const invoice = await InvoiceService.getInvoiceDetails(invoiceId);
        setEditableInvoice(invoice);
      } catch (error) {
        toast.error(getErrorMessage(error) || "Failed to fetch invoice");
        setEditableInvoice(null);
      }
    };

    fetchEditableInvoice();
  }, [invoiceId]);

  useEffect(() => {
    if (!editableInvoice) {
      return;
    }

    const formWholesalerId = String(editableInvoice.buyerId || "");

    const invoiceDateObj = new Date(editableInvoice.invoiceDate);
    const year = invoiceDateObj.getFullYear();
    const month = invoiceDateObj.getMonth() + 1;

    const computedFinancialYear =
      month >= 4 ? `FY${year}-${year + 1}` : `FY${year - 1}-${year}`;

    setInvoiceDetails((prev) => ({
      ...prev,
      wholesalerId: formWholesalerId,
      invoiceDate: invoiceDateObj.toISOString().split("T")[0],
      financialYear: computedFinancialYear,
      gstType: editableInvoice.gstType as GstType,
      taxMode: (editableInvoice.taxMode || TaxMode.CGST_SGST) as TaxMode,
    }));
    setInvoiceNumber(editableInvoice.invoiceNumber);

    setInvoiceItems(
      editableInvoice.items.map((item: any) => ({
        ...item,
        id: String(item.id ?? item._id ?? crypto.randomUUID()),
        name: item.name ?? "",
        hsnCode: item.hsnCode ?? "",
        unit: item.unit ?? "",
        basePrice: item.basePrice ?? "",
      })),
    );
  }, [editableInvoice]);

  useEffect(() => {
    if (editableInvoice) {
      return;
    }

    const currentInvoiceNumbers = existingInvoices.map(
      (invoice) => invoice.invoiceNumber,
    );

    const nextInvoiceNumber = getNextDocumentNumber(
      currentInvoiceNumbers,
      INVOICE_PREFIX,
    );

    setInvoiceNumber((prev) =>
      prev === nextInvoiceNumber ? prev : nextInvoiceNumber,
    );
  }, [editableInvoice, existingInvoices]);

  useEffect(() => {
    setInvoiceItems((prev) =>
      prev.map((item) =>
        item.gstPercentage === selectedGstRate
          ? item
          : { ...item, gstPercentage: selectedGstRate },
      ),
    );
  }, [selectedGstRate]);

  const handleStockErrors = (id: string) => {
    setStockErrorsByRowId((prev) => {
      if (!prev[id]) {
        return prev;
      }

      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, dataset } = event.target;
    const id = dataset.id as string;

    handleStockErrors(id);

    setInvoiceItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [name]: value } : item)),
    );
  };

  const handleSelectItem = (itemRowId: string, selectedItemId: string) => {
    const selectedItem = masterItems.find(
      (item) => item._id === selectedItemId,
    );

    handleStockErrors(itemRowId);

    setInvoiceItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemRowId) {
          return item;
        }

        if (!selectedItem) {
          return {
            ...item,
            itemId: "",
            name: "",
            hsnCode: "",
            unit: "",
            basePrice: "",
          };
        }

        return {
          ...item,
          itemId: selectedItem._id ?? "",
          name: selectedItem.name,
          hsnCode: String(selectedItem.hsnCode ?? ""),
          unit: selectedItem.unit ?? "",
          basePrice: String(selectedItem.basePrice ?? ""),
        };
      }),
    );
  };

  const addNewRow = () => {
    setInvoiceItems((prev) => [...prev, createInvoiceItem(selectedGstRate)]);
  };

  const removeRow = (id: string) => {
    handleStockErrors(id);

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

    if (computedRows.length === 0 || taxableSubtotal <= 0) {
      toast.error("Add at least one valid line item.");
      return false;
    }

    return true;
  };

  const handleStockErrorFields = (error: any) => {
    const stockErrors = (error?.response?.data?.errorFields ?? []).filter(
      (f: StockErrorField) => f.code === "INSUFFICIENT_STOCK",
    );

    if (stockErrors.length > 0) {
      const nextErrors: Record<string, string> = {};

      computedRows.forEach((row) => {
        const matchingStockError = stockErrors.find(
          (stockError: StockErrorField) =>
            stockError.code === "INSUFFICIENT_STOCK" &&
            stockError.itemId === row.itemId,
        );

        if (matchingStockError) {
          nextErrors[row.id] = "Insufficient stock for this item.";
        }
      });

      setStockErrorsByRowId(nextErrors);
    }
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
      total: totalAmountDue,
      items: computedRows.map((item) => ({
        id: "",
        itemId: item.itemId,
        quantity: Number(item.quantity),
        gstPercentage: item.gstPercentage,
        taxableAmount: item.taxableAmount,
      })),
    };

    try {
      setSubmittingAction(action);
      setStockErrorsByRowId({});

      if (isEditMode) {
        await InvoiceService.updateInvoice(String(invoiceId), payload);
      } else {
        await InvoiceService.createInvoice(payload);
      }

      router.push("/manufacturer/invoices");
      toast.success(
        isEditMode
          ? "Invoice updated successfully!"
          : "Invoice created successfully!",
      );
    } catch (error: any) {
      const message = getErrorMessage(error);
      handleStockErrorFields(error);
      toast.error(message);
    } finally {
      setSubmittingAction(null);
    }
  };

  const wholesalersList = useMemo(() => {
    return wholesalers.map((wholesaler: UserProfile) => ({
      value: wholesaler.userId as string,
      label: wholesaler.businessName,
    }));
  }, [wholesalers]);

  const financialYearsOptions = useMemo(() => {
    return user.financialYears.map((financialYear: FinancialYear) => ({
      value: financialYear.id,
      label: financialYear.label,
    }));
  }, [user]);

  const masterItemOptions = useMemo(
    () =>
      masterItems
        .filter((item) => item._id && item.isActive)
        .map((item) => ({
          value: item._id as string,
          label: item.name,
        })),
    [masterItems],
  );

  return (
    <div className="relative min-h-[calc(100vh-124px)] p-4 pb-6 sm:p-6 lg:p-8 lg:pb-0">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {isEditMode ? "Edit Invoice" : "Manual Invoice Creation"}
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
            {isEditMode ? "Update Invoice" : "Create Invoice"}
          </Button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label className="text-[#0d161b] text-sm font-semibold">
              Invoice Number
            </label>

            <div className="w-full  rounded-lg border p-1.75 text-sm bg-slate-50 text-[#0d161b] border-[#cfdde7]">
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
        onQuantityChange={handleQuantityChange}
        onSelectItem={handleSelectItem}
        onAddRow={addNewRow}
        onRemoveRow={removeRow}
        itemOptions={masterItemOptions}
        rowErrors={stockErrorsByRowId}
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
