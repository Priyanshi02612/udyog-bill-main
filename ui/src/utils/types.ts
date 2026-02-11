/* eslint-disable @typescript-eslint/no-explicit-any */

import { KpiCardProps } from "../components/admin/kpi-card";

export type Role = "manufacturer" | "wholesaler" | "retailer";

export type ItemCategory = "FABRIC" | "MATERIAL" | "THREAD";

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "PAID"
  | "OVERDUE";

export type OnboardingContextType = {
  onBoardingStep: number;
  setOnBoardingStep: React.Dispatch<React.SetStateAction<number>>;
  onBoardingData: OnboardingData;
  handleOnBoardingData: (data: Partial<OnboardingData>) => void;
  validateForm: () => boolean;
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  resetOnBoardingState: () => void;
};

export type AuthContextType = {
  user: any | null;
  authLoading: boolean;
};

export type OnboardingData = {
  firebaseUid?: string;
  name?: string;
  email: string;
  password: string;
  phone?: string;

  businessName?: string;
  gstin?: string;
  address?: string;
  state?: string;

  role?: Role;
  onboardingStep?: number;
};

export type OnboardingPageWrapperProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export interface Item {
  _id?: string;
  name: string;
  imageUrl?: string;
  category: ItemCategory | string;
  description: string;
  basePrice: number;
  unit: string;
  gstPercentage: number;
  hsnCode: number;
  color?: string;
  materialType?: string;
  designPattern?: string;
  isActive: boolean;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AddItemFormState = {
  name: string;
  imageUrl?: string;
  image?: File | null;
  imagePreview?: string;
  category: ItemCategory | string;
  description?: string;
  basePrice: string | number;
  unit: string;
  gstPercentage: string | number;
  hsnCode: string | number;
  color?: string;
  materialType?: string;
  designPattern?: string;
  isActive: boolean;
};

export type AddEditTextileItemModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: Partial<AddItemFormState>;
};

export type Errors = Partial<Record<keyof AddItemFormState, string>>;

export type Party = {
  id: number;
  businessName: string;
  gstin: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  outstanding: number;
  overdueInvoices: number;
  invoices: Invoice[];
};

export type Invoice = {
  id: number;
  invoiceNumber: string;
  buyerId: string;
  sellerId: string;
  invoiceDate: string;
  items: InvoiceItem[];
  subtotal: number;
  sgst: number;
  cgst: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  notes?: string;
  paymentTerms?: string;
};

export type InvoiceItem = {
  id: string;
  itemId: string;
  invoiceId: string;
  quantity: number;
  price: number;
};

export interface Insight {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface DashboardData {
  kpis: KpiCardProps[];
  insights: Insight[];
}
