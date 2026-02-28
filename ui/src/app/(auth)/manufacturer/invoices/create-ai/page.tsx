/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useContext, useState } from "react";
import {
  MdAutoAwesome,
  MdChevronRight,
  MdDescription,
  MdHelpOutline,
} from "react-icons/md";
import toast from "react-hot-toast";

import { AuthContext } from "../../../../../context/auth.context";
import { InvoicePreviewCard } from "../../../../../components/manufacturer/invoice-preview-card";
import { Button } from "../../../../../components/ui/button";
import InvoicePreviewSkeleton from "../../../../../components/manufacturer/invoice-preview-skeleton";
import PromptHelperModal from "../../../../../components/modal/prompt-helper-modal";
import { AiService } from "../../../../../lib/api/ai";
import { InvoiceService } from "../../../../../lib/api/invoice";
import { GstType, TaxMode } from "../../../../../utils/constants";
import {
  getErrorMessage,
  getInvoicePreviewMetrics,
} from "../../../../../utils/helpers";
import {
  AuthContextType,
  CreateManufacturerInvoicePayload,
  Invoice,
  InvoiceStatus,
} from "../../../../../utils/types";
import { useRouter } from "next/navigation";

const DEFAULT_ORDER_TEXT = `
  Customer: Om Sai Wholesale Shop.
  Items:
  - 100 meters of Green Printed Rayon Fabric – Floral, HSN 5588, @ ₹50/meter
  Tax 5% GST
`;

const DEFAULT_INVOICE: Invoice = {
  id: 0,
  invoiceNumber: "",
  buyerId: "",
  sellerId: "",
  invoiceDate: "",
  invoiceDueDate: "",
  financialYear: "",
  items: [],
  subtotal: 0,
  gstType: GstType.NO_GST,
  taxMode: TaxMode.CGST_SGST,
  sgst: 0,
  cgst: 0,
  igst: 0,
  total: 0,
  status: InvoiceStatus.DRAFT,
};

type StockErrorField = {
  code: string;
  itemId: string;
  requestedQuantity: number;
  availableQuantity: number;
};

export default function CreateAiInvoicePage() {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [rawOrderText, setRawOrderText] = useState("");
  const [draftInvoice, setDraftInvoice] = useState<Invoice>(DEFAULT_INVOICE);
  const [stockErrorsByItemId, setStockErrorsByItemId] = useState<
    Record<string, string>
  >({});
  const [generating, setGenerating] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const isDraftEmpty = draftInvoice.items.length === 0;
  const [savingInvoice, setSavingInvoice] = useState(false);

  const router = useRouter();

  const handleStockErrorFields = (error: any) => {
    const stockErrors = (error?.response?.data?.errorFields ?? []).filter(
      (f: StockErrorField) => f.code === "INSUFFICIENT_STOCK",
    );

    if (stockErrors.length > 0) {
      const nextErrors: Record<string, string> = {};

      draftInvoice.items.forEach((item) => {
        const matchingStockError = stockErrors.find(
          (stockError: StockErrorField) =>
            stockError.code === "INSUFFICIENT_STOCK" &&
            stockError.itemId === item.itemId,
        );

        if (matchingStockError) {
          nextErrors[item.itemId as string] =
            `Insufficient stock for ${item.name}`;
        }
      });

      setStockErrorsByItemId(nextErrors);
    }
  };

  const applyDraft = (draft: Invoice) => {
    const { taxableSubtotal, cgstRate, sgstRate, igstRate, totalAmountDue } =
      getInvoicePreviewMetrics(
        draft.items,
        draft.gstType as GstType,
        draft.taxMode as TaxMode,
      );

    setDraftInvoice((prev) => ({
      ...prev,
      ...draft,
      taxableSubtotal,
      gstType: draft.gstType,
      taxMode: draft.taxMode,
      cgst: cgstRate,
      sgst: sgstRate,
      igst: igstRate,
      total: totalAmountDue,
    }));
    setStockErrorsByItemId({});
  };

  const handleGenerate = async () => {
    if (!rawOrderText.trim()) {
      toast.error("Please add order details before running AI analysis.");
      return;
    }

    setGenerating(true);
    try {
      const aiDraft = await AiService.generateInvoiceDraft(
        rawOrderText,
        user.userId,
      );
      applyDraft(aiDraft);
    } catch (error) {
      toast.error(`${getErrorMessage(error)}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveInvoice = async () => {
    const [year, month] = draftInvoice.invoiceDate.split("-").map(Number);
    const computedFinancialYear =
      month >= 4 ? `FY${year}-${year + 1}` : `FY${year - 1}-${year}`;

    const {
      taxableSubtotal,
      totalGstAmount,
      cgstRate,
      sgstRate,
      igstRate,
      roundOff,
      totalAmountDue,
    } = getInvoicePreviewMetrics(
      draftInvoice.items,
      draftInvoice.gstType as GstType,
      draftInvoice.taxMode as TaxMode,
    );

    const payload: CreateManufacturerInvoicePayload = {
      ...draftInvoice,
      financialYear: computedFinancialYear,
      cgstRate,
      sgstRate,
      igstRate,
      roundOff,
      sellerId: user._id,
      status: InvoiceStatus.DRAFT,
      totalTaxAmount: totalGstAmount,
      subtotal: taxableSubtotal,
      total: totalAmountDue,
      items: draftInvoice.items.map((item) => ({
        id: "",
        itemId: item.itemId,
        quantity: Number(item.quantity),
        gstPercentage: item.gstPercentage,
        taxableAmount: item.taxableAmount,
      })),
    };

    try {
      setSavingInvoice(true);
      setStockErrorsByItemId({});

      await InvoiceService.createInvoice(payload);
      router.push("/manufacturer/invoices");
      toast.success("Invoice created successfully!");
    } catch (error) {
      const message = getErrorMessage(error);
      handleStockErrorFields(error);
      toast.error(message);
    } finally {
      setSavingInvoice(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-124px)] p-3 pb-5 sm:p-6 lg:p-8 lg:pb-0">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-3xl">
            AI Invoice Creation
          </h1>
          <p className="text-sm text-primary sm:text-base">
            Convert unstructured messages into professional textile invoices
            instantly.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
          <Button
            size="sm"
            variant="outline-secondary"
            className="w-full sm:w-auto"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="w-full sm:w-auto disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:pointer-events-none"
            onClick={handleSaveInvoice}
            disabled={isDraftEmpty}
            loading={savingInvoice}
          >
            Save Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(300px,1fr)_56px_minmax(470px,1.2fr)]">
        <div className="space-y-3 sm:space-y-4">
          <section className="h-max rounded-2xl border border-slate-200 bg-white p-3 sm:p-6">
            <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between xl:flex-col xl:items-baseline 2xl:flex-row 2xl:items-center">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <MdDescription className="h-5 w-5 text-primary" />
                Raw Invoice Details
              </h2>
              <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3">
                <Button
                  variant="link"
                  size="sm"
                  leadingIcon={<MdHelpOutline className="h-4 w-4" />}
                  onClick={() => setIsHelpModalOpen(true)}
                >
                  Format Help
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setRawOrderText("")}
                >
                  Clear Canvas
                </Button>
              </div>
            </div>

            <textarea
              value={rawOrderText}
              onChange={(event) => setRawOrderText(event.target.value)}
              placeholder={DEFAULT_ORDER_TEXT.trim()}
              className="h-56 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 outline-0 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-75 sm:p-4 sm:text-base sm:leading-8"
            />

            <Button
              className="mt-4 w-full"
              size="sm"
              leadingIcon={<MdAutoAwesome className="h-5 w-5" />}
              onClick={handleGenerate}
              loading={generating}
            >
              Generate with AI
            </Button>
          </section>

          {Object.keys(stockErrorsByItemId).length > 0 ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-bold text-rose-500">
                Insufficient stock detected for{" "}
                {Object.keys(stockErrorsByItemId).length} item(s).
              </p>
              <p className="mt-1 text-xs text-rose-500/90">
                {draftInvoice.items
                  .filter(
                    (item) => item.itemId && stockErrorsByItemId[item.itemId],
                  )
                  .map((item) => item.name || item.itemId)
                  .join(", ")}
              </p>
            </div>
          ) : null}
        </div>

        <div className="hidden items-center justify-center xl:flex">
          <div className="rounded-full bg-slate-200/20 p-3">
            <div className="rounded-full bg-slate-200/30 p-2">
              <div className="rounded-full bg-slate-200/70 text-slate-400">
                <MdChevronRight className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-3 sm:p-6">
            <h3 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
              Invoice Draft Preview
            </h3>
          </div>
          <div
            className="max-h-[55vh] overflow-y-auto p-3 sm:max-h-205 sm:p-6"
            style={{ scrollbarWidth: "thin" }}
          >
            {generating || isDraftEmpty ? (
              <InvoicePreviewSkeleton />
            ) : (
              <InvoicePreviewCard
                invoice={draftInvoice}
                buyerInfo={draftInvoice.buyerInfo}
                sellerInfo={user}
                className="mt-0 max-w-none p-3 sm:p-6"
              />
            )}
          </div>
        </section>
      </div>

      <PromptHelperModal
        open={isHelpModalOpen}
        exampleText={DEFAULT_ORDER_TEXT.trim()}
        onClose={() => setIsHelpModalOpen(false)}
        onUseExample={() => {
          setRawOrderText(DEFAULT_ORDER_TEXT.trim());
          setIsHelpModalOpen(false);
        }}
      />
    </div>
  );
}
