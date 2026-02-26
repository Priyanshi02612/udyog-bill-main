import { InvoiceStatus, Item } from "./types";

export enum UserRole {
  MANUFACTURER = "manufacturer",
  WHOLESALER = "wholesaler",
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

export const DEFAULT_FORM: Item = {
  name: "",
  imageUrl: "",
  image: null,
  imagePreview: "",
  category: "",
  description: "",
  basePrice: 0,
  unit: "",
  gstPercentage: 0,
  hsnCode: 0,
  color: "",
  materialType: "",
  designPattern: "",
  isActive: true,
};

export const invoiceStatusOptions = [
  { label: "Select Invoice Status", value: "" },
  { label: "Draft", value: InvoiceStatus.DRAFT },
  { label: "Sent", value: InvoiceStatus.SENT },
  { label: "Paid", value: InvoiceStatus.PAID },
  { label: "Overdue", value: InvoiceStatus.OVERDUE },
];

export const previewStatusVariant: Record<
  InvoiceStatus,
  "success" | "warning" | "danger" | "info" | "primary"
> = {
  [InvoiceStatus.DRAFT]: "info",
  [InvoiceStatus.SENT]: "warning",
  [InvoiceStatus.PAID]: "success",
  [InvoiceStatus.OVERDUE]: "danger",
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
export const DEFAULT_INVOICE_ITEM_DISCOUNT = 0;

export const MAX_NEW_FINANCIAL_YEARS = 2;

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

export const GENERAL_PREFIX = "GEN";
export const LOT_PREFIX = "LOT";
export const INVOICE_PREFIX = "INV";
