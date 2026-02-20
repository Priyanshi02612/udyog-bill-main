import { INDIAN_NUMBER_TENS, INDIAN_NUMBER_UNITS } from "./constants";
import {
  FinancialYear,
  GstType,
  InvoiceItem,
  InvoiceStatus,
  TaxMode,
} from "./types";
import { GstType as GstTypeEnum, TaxMode as TaxModeEnum } from "./constants";

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

export const getDefaultFinancialYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  if (month >= 4) {
    return `FY${year}-${year + 1}`;
  }

  return `FY${year - 1}-${year}`;
};

export const parseNumericInput = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getNextDocumentNumber = (
  existingNumbers: string[],
  typePrefix: string,
) => {
  const year = new Date().getFullYear();
  const prefix = `${typePrefix}-${year}-`;

  const maxSequence = existingNumbers.reduce((max, currentNumber) => {
    if (!currentNumber.startsWith(prefix)) {
      return max;
    }

    const sequence = Number(currentNumber.slice(prefix.length));
    return Number.isFinite(sequence) ? Math.max(max, sequence) : max;
  }, 0);

  return `${prefix}${String(maxSequence + 1).padStart(3, "0")}`;
};

export const isDateInFinancialYear = (date: string, fy: string) => {
  const [startYear, endYear] = fy.replace("FY", "").split("-").map(Number);
  const dateObj = new Date(date);

  if (
    Number.isNaN(startYear) ||
    Number.isNaN(endYear) ||
    Number.isNaN(dateObj.getTime())
  ) {
    return false;
  }

  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();

  if (month >= 4) {
    return year === startYear;
  }

  return year === endYear;
};

export const toIndianAmountWords = (value: number) => {
  const number = Math.round(value);
  if (number === 0) return "Zero";

  const convertBelowThousand = (n: number): string => {
    if (n < 20) return INDIAN_NUMBER_UNITS[n];
    if (n < 100) {
      const tenPart = INDIAN_NUMBER_TENS[Math.floor(n / 10)];
      const unitPart = INDIAN_NUMBER_UNITS[n % 10];
      return unitPart ? `${tenPart} ${unitPart}` : tenPart;
    }

    const hundredPart = `${INDIAN_NUMBER_UNITS[Math.floor(n / 100)]} hundred`;
    const remainder = n % 100;

    return remainder
      ? `${hundredPart} ${convertBelowThousand(remainder)}`
      : hundredPart;
  };

  const crore = Math.floor(number / 10000000);
  const lakh = Math.floor((number % 10000000) / 100000);
  const thousand = Math.floor((number % 100000) / 1000);
  const remainder = number % 1000;

  const parts: string[] = [];

  if (crore) parts.push(`${convertBelowThousand(crore)} crore`);
  if (lakh) parts.push(`${convertBelowThousand(lakh)} lakh`);
  if (thousand) parts.push(`${convertBelowThousand(thousand)} thousand`);
  if (remainder) parts.push(convertBelowThousand(remainder));

  return parts.join(" ").replace(/\s+/g, " ").trim();
};

export const getGstRateFromType = (gstType: GstType) => {
  switch (gstType) {
    case GstTypeEnum.GST_5:
      return 5;
    case GstTypeEnum.GST_12:
      return 12;
    case GstTypeEnum.GST_18:
      return 18;
    case GstTypeEnum.NO_GST:
    default:
      return 0;
  }
};

export const getInvoicePreviewMetrics = (
  invoiceItems: InvoiceItem[],
  gstType: GstType,
  taxMode?: TaxMode,
) => {
  const taxableSubtotal = invoiceItems.reduce(
    (sum, item) => sum + Number(item.basePrice) * Number(item.quantity),
    0,
  );

  const gstRate = getGstRateFromType(gstType);
  const applyGst = gstRate > 0;
  const resolvedTaxMode = applyGst
    ? (taxMode ?? TaxModeEnum.CGST_SGST)
    : undefined;

  const cgstRate =
    applyGst && resolvedTaxMode === TaxModeEnum.CGST_SGST ? gstRate / 2 : 0;
  const sgstRate =
    applyGst && resolvedTaxMode === TaxModeEnum.CGST_SGST ? gstRate / 2 : 0;
  const igstRate =
    applyGst && resolvedTaxMode === TaxModeEnum.IGST ? gstRate : 0;

  const cgstAmount = (taxableSubtotal * cgstRate) / 100;
  const sgstAmount = (taxableSubtotal * sgstRate) / 100;
  const igstAmount = (taxableSubtotal * igstRate) / 100;

  const totalGstAmount = cgstAmount + sgstAmount + igstAmount;

  const effectiveGstRate = cgstRate + sgstRate + igstRate;

  const beforeRound = taxableSubtotal + totalGstAmount;

  const roundedTotal = Math.round(beforeRound);
  const roundOff = +(roundedTotal - beforeRound).toFixed(2);

  return {
    taxableSubtotal: +taxableSubtotal.toFixed(2),
    cgstRate,
    sgstRate,
    igstRate,
    effectiveGstRate,
    cgstAmount: +cgstAmount.toFixed(2),
    sgstAmount: +sgstAmount.toFixed(2),
    igstAmount: +igstAmount.toFixed(2),
    totalGstAmount: +totalGstAmount.toFixed(2),
    roundOff,
    totalAmountDue: roundedTotal,
  };
};

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Internal server error";
};

export const buildFinancialYear = (
  startYear: number,
  endYear: number,
): FinancialYear => ({
  id: `FY${startYear}-${endYear}`,
  label: `FY ${startYear} - ${endYear}`,
  range: `April 1, ${startYear} - March 31, ${endYear}`,
  startYear,
  endYear,
});
