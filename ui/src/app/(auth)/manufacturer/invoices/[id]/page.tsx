"use client";

import { useContext, useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MdArrowBack, MdDownload } from "react-icons/md";
import { useParams, useRouter } from "next/navigation";

import { InvoicePdf } from "../../../../../components/admin/invoice-pdf-template";
import { InvoicePreviewCard } from "../../../../../components/admin/invoice-preview-card";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import { AuthContext } from "../../../../../context/auth.context";
import { getErrorMessage, statusStyles } from "../../../../../utils/helpers";
import { previewStatusVariant } from "../../../../../utils/constants";
import {
  AuthContextType,
  Invoice,
} from "../../../../../utils/types";
import toast from "react-hot-toast";
import { InvoiceService } from "../../../../../lib/api/invoice";

const InvoicePreviewPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useContext(AuthContext) as AuthContextType;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await InvoiceService.getInvoiceDetails(String(id));
        setInvoice({ ...response, sellerInfo: user });
      } catch (error) {
        toast.error(getErrorMessage(error) || "Failed to fetch invoice");
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, user]);

  const buyerInfo = invoice?.buyerInfo;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  if (!invoice) return null;

  const statusLabel = statusStyles[invoice.status].label.toUpperCase();

  return (
    <div className="relative min-h-[calc(100vh-124px)] p-4 pb-6 sm:p-6 lg:p-8 lg:pb-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-1 text-primary hover:text-primary/80"
            onClick={() => router.back()}
          >
            <MdArrowBack className="h-6 w-6" />
          </button>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Invoice #{invoice.invoiceNumber}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-primary text-xs md:text-base">
                Issued by {user?.businessName || invoice.sellerId}
              </p>
              <Badge
                label={statusLabel}
                variant={previewStatusVariant[invoice.status]}
              />
            </div>
          </div>
        </div>

        <PDFDownloadLink
          document={<InvoicePdf invoice={invoice} />}
          fileName={`${invoice.invoiceNumber}.pdf`}
          className="inline-flex"
        >
          {({ loading }) => (
            <Button
              size="sm"
              className="w-full sm:min-w-36.25 sm:w-auto"
              leadingIcon={<MdDownload className="h-4 w-4" />}
              loading={loading}
            >
              Download PDF
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      <div className="mx-auto w-full max-w-6xl p-2 sm:p-4 md:p-8">
        <InvoicePreviewCard
          invoice={invoice}
          buyerInfo={buyerInfo}
          sellerInfo={user}
        />
      </div>
    </div>
  );
};

export default InvoicePreviewPage;
