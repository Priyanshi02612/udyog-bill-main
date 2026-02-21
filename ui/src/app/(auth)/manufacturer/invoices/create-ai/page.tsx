"use client";

import { useContext, useState } from "react";
import { MdChevronRight, MdDescription, MdVerified } from "react-icons/md";

import { InvoicePreviewCard } from "../../../../../components/admin/invoice-preview-card";
import { Button } from "../../../../../components/ui/button";
import { GstType, TaxMode } from "../../../../../utils/constants";
import {
  AuthContextType,
  Invoice,
  InvoicePartyInfo,
} from "../../../../../utils/types";
import { AuthContext } from "@/src/context/auth.context";

const DEFAULT_ORDER_TEXT = `Customer: Vardhman Mills Ltd.
PO Number: #TX-992
Items:
- 1200 meters of Silk Chiffon, HSN 5007, @ ₹375/m
- 500 meters Linen Blend, HSN 5309, @ ₹1,000/m
Tax 12% GST
Ship to Ludhiana Hub by next Tuesday.`;

const AI_DRAFT_INVOICE: Invoice = {
  id: 88392,
  invoiceNumber: "INV-AI-88392",
  buyerId: "party-ai-1",
  sellerId: "seller-ai-1",
  invoiceDate: "2026-02-21",
  dueDate: "2026-03-08",
  items: [
    {
      id: "ai-ii-1",
      invoiceId: "inv-ai-88392",
      itemName: "Silk Chiffon",
      itemId: "item-ai-1",
      hsnCode: 5007,
      quantity: 1200,
      unit: "Meter",
      basePrice: 375,
      gstPercentage: 12,
    },
    {
      id: "ai-ii-2",
      invoiceId: "inv-ai-88392",
      itemName: "Linen Blend",
      itemId: "item-ai-2",
      hsnCode: 5309,
      quantity: 500,
      unit: "Meter",
      basePrice: 1000,
      gstPercentage: 12,
    },
  ],
  subtotal: 950000,
  gstType: GstType.GST_12,
  taxMode: TaxMode.CGST_SGST,
  sgst: 57000,
  cgst: 57000,
  igst: 0,
  total: 1064000,
  status: "DRAFT",
  notes:
    "AI extracted: Delivery expected by next Tuesday. Shipping to Ludhiana Hub.",
  paymentTerms: "15 Days Credit",
};

const AI_BUYER: InvoicePartyInfo = {
  id: "party-ai-1",
  businessName: "Vardhman Mills Ltd.",
  gstin: "03AAACV1234A1Z5",
  contactPerson: "Aman Bedi",
  phone: "+91 98765 22001",
  email: "accounts@vardhman.com",
  registeredAddress: "Ludhiana Industrial Cluster, Plot 22",
  state: "Punjab",
};

export default function CreateAiInvoicePage() {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [rawOrderText, setRawOrderText] = useState(DEFAULT_ORDER_TEXT);

  return (
    <div className="relative min-h-[calc(100vh-124px)] p-4 pb-6 sm:p-6 lg:p-8 lg:pb-0">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            AI Invoice Creation
          </h1>
          <p className="text-xs text-primary md:text-base">
            Convert unstructured messages into professional textile invoices
            instantly.
          </p>
        </div>

        <div className="flex w-full gap-3 sm:w-auto">
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

      <div className="grid gap-6 xl:grid-cols-[minmax(300px,1fr)_56px_minmax(470px,1.2fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 h-max">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <MdDescription className="h-5 w-5 text-primary" />
              Raw Invoice Details
            </h2>
            <button
              type="button"
              className="text-sm font-semibold text-primary hover:text-primary/80"
              onClick={() => setRawOrderText("")}
            >
              Clear Canvas
            </button>
          </div>

          <textarea
            value={rawOrderText}
            onChange={(event) => setRawOrderText(event.target.value)}
            className="h-125 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-base leading-8 text-slate-700 outline-0 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </section>

        <div className="hidden items-center justify-center xl:flex">
          <div className="rounded-full bg-slate-100 p-3 text-slate-400">
            <MdChevronRight className="h-8 w-8" />
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-4 sm:p-6">
            <div>
              <h3 className="text-3xl font-black tracking-tight text-slate-900">
                Invoice Draft Preview
              </h3>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Draft ID: #INV-AI-88392
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              <MdVerified className="h-4 w-4" />
              AI VERIFIED
            </span>
          </div>

          <div
            className="max-h-205 overflow-y-auto p-4 sm:p-6"
            style={{ scrollbarWidth: "thin" }}
          >
            <InvoicePreviewCard
              invoice={AI_DRAFT_INVOICE}
              buyerInfo={AI_BUYER}
              sellerInfo={user}
              className="mt-0 max-w-none p-4 sm:p-6"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
