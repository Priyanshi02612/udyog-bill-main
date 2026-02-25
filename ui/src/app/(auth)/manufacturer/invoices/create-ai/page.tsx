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
import { InvoicePreviewCard } from "../../../../../components/admin/invoice-preview-card";
import { Button } from "../../../../../components/ui/button";
import InvoicePreviewSkeleton from "../../../../../components/admin/invoice-preview-skeleton";
import PromptHelperModal from "../../../../../components/admin/modal/prompt-helper-modal";
import { AiService } from "../../../../../lib/api/ai";
import { GstType, TaxMode } from "../../../../../utils/constants";
import {
  getErrorMessage,
  getInvoicePreviewMetrics,
} from "../../../../../utils/helpers";
import { AuthContextType, Invoice } from "../../../../../utils/types";

const DEFAULT_ORDER_TEXT = `
  Customer: Om Sai Wholesale Shop.
  Items:
  - 1200 meters of Dyed Silk Fabric - Green, HSN 5007, @ ₹850/m
  Tax 12% GST
`;

const DEFAULT_INVOICE: Invoice = {
  id: 0,
  invoiceNumber: "",
  buyerId: "",
  sellerId: "",
  invoiceDate: "",
  dueDate: "",
  items: [],
  subtotal: 0,
  gstType: "",
  taxMode: "",
  sgst: 0,
  cgst: 0,
  igst: 0,
  total: 0,
  status: "",
};

export default function CreateAiInvoicePage() {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [rawOrderText, setRawOrderText] = useState("");
  const [draftInvoice, setDraftInvoice] = useState<Invoice>(DEFAULT_INVOICE);
  const [analyzing, setAnalyzing] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const isDraftEmpty = draftInvoice.items.length === 0;

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
  };

  const handleAnalyze = async () => {
    if (!rawOrderText.trim()) {
      toast.error("Please add order details before running AI analysis.");
      return;
    }

    setAnalyzing(true);
    try {
      const aiDraft = await AiService.generateInvoiceDraft(
        rawOrderText,
        user._id,
      );
      applyDraft(aiDraft);
    } catch (error) {
      toast.error(`${getErrorMessage(error)}`);
    } finally {
      setAnalyzing(false);
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
          >
            Cancel
          </Button>
          <Button size="sm" className="w-full sm:w-auto">
            Save Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(300px,1fr)_56px_minmax(470px,1.2fr)]">
        <section className="h-max rounded-2xl border border-slate-200 bg-white p-3 sm:p-6">
          <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
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
            leadingIcon={<MdAutoAwesome className="h-5 w-5" />}
            onClick={handleAnalyze}
            loading={analyzing}
          >
            Analyze with AI
          </Button>
        </section>

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
            {analyzing || isDraftEmpty ? (
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
