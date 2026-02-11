import { InvoiceStatus } from "./types";

export const formatCurrency = (amount: number) =>
  amount === 0
    ? "Nil"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const statusStyles: Record<
  InvoiceStatus,
  { bg: string; text: string; label: string }
> = {
  DRAFT: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    label: "Draft",
  },
  SENT: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    label: "Sent",
  },
  ACCEPTED: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    label: "Accepted",
  },
  REJECTED: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    label: "Rejected",
  },
  PAID: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    label: "Paid",
  },
  OVERDUE: {
    bg: "bg-red-50",
    text: "text-danger",
    label: "Overdue",
  },
};
