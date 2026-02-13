import { AddItemFormState, InvoiceStatus } from "./types";

export enum UserRole {
  MANUFACTURER = "manufacturer",
  WHOLESALER = "wholesaler",
  RETAILER = "retailer",
}

export enum ItemCategory {
  FABRIC = "Fabric",
  MATERIAL = "Material",
  THREAD = "Thread",
}
export enum TaxMode {
  CGST_SGST = "CGST_SGST",
  IGST = "IGST",
}

export enum GstType {
  NO_GST = "NO_GST",
  GST_5 = "GST_5",
  GST_12 = "GST_12",
  GST_18 = "GST_18",
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\d{10}$/;
export const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/;

export const itemCategoryOptions = [
  { label: "Select Item Category", value: "" },
  { label: "Fabric", value: "Fabric" },
  { label: "Material", value: "Material" },
  { label: "Thread", value: "Thread" },
];

export const DEFAULT_FORM: AddItemFormState = {
  name: "",
  imageUrl: "",
  image: null,
  imagePreview: "",
  category: "",
  description: "",
  basePrice: "",
  unit: "",
  gstPercentage: "",
  hsnCode: "",
  color: "",
  materialType: "",
  designPattern: "",
  isActive: true,
};

export const financialYearsOptions = [
  { label: "Select Financial Year", value: "" },
  { label: "2022-2023", value: "2022-2023" },
  { label: "2023-2024", value: "2023-2024" },
  { label: "2024-2025", value: "2024-2025" },
  { label: "2025-2026", value: "2025-2026" },
];

export const invoiceStatusOptions = [
  { label: "Select Invoice Status", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Sent", value: "SENT" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Paid", value: "PAID" },
  { label: "Overdue", value: "OVERDUE" },
];

export const previewStatusVariant: Record<
  InvoiceStatus,
  "success" | "warning" | "danger" | "info" | "primary"
> = {
  DRAFT: "info",
  SENT: "warning",
  ACCEPTED: "primary",
  REJECTED: "danger",
  PAID: "success",
  OVERDUE: "danger",
};

export const INDIAN_NUMBER_UNITS = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
] as const;

export const INDIAN_NUMBER_TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
] as const;

export const DEFAULT_CGST_RATE = 2.5;
export const DEFAULT_SGST_RATE = 2.5;
export const DEFAULT_IGST_RATE = 5;
export const MAX_INVOICE_NOTES_LENGTH = 500;
export const DEFAULT_INVOICE_ITEM_UNIT = "Meters";
export const DEFAULT_INVOICE_ITEM_DISCOUNT = 0;

export const MAX_NEW_FINANCIAL_YEARS = 3;

export const gstTypeOptions = [
  { label: "No GST", value: GstType.NO_GST },
  { label: "GST 5%", value: GstType.GST_5 },
  { label: "GST 12%", value: GstType.GST_12 },
  { label: "GST 18%", value: GstType.GST_18 },
];

export const taxModeOptions = [
  { label: "CGST + SGST", value: TaxMode.CGST_SGST },
  { label: "IGST", value: TaxMode.IGST },
];
