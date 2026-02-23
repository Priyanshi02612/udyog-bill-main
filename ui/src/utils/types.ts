/* eslint-disable @typescript-eslint/no-explicit-any */

import { KpiCardProps } from "../components/admin/kpi-card";

export type Role = "manufacturer" | "wholesaler";

export type ItemCategory = "FABRIC" | "MATERIAL" | "THREAD";

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "PAID"
  | "OVERDUE";

export type TaxMode = "CGST_SGST" | "IGST";

export type GstType = "NO_GST" | "GST_5" | "GST_12" | "GST_18";

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
  setUser: React.Dispatch<React.SetStateAction<any | null>>;
  authLoading: boolean;
};

export type UserContextType = {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  addedFinancialYearCount: number;
  savingProfile: boolean;
  hasUnsavedProfileChanges: boolean;
  canAddFinancialYear: boolean;
  handleAddFinancialYear: (startYear: number) => void;
  canActivateFinancialYear: (startYear: number) => boolean;
  handleActivateFinancialYear: (financialYearId: string) => void;
  handleDiscardProfileChanges: () => void;
  handleSaveProfile: () => Promise<void>;
};

export type OnboardingData = {
  firebaseUid?: string;
  contactPerson?: string;
  email: string;
  password: string;
  phone?: string;

  businessName?: string;
  gstin?: string;
  registeredAddress?: string;
  state?: string;

  role?: Role;
  onboardingStep?: number;
};

export type SignupPayload = {
  firebaseUid: string;
  email: string;
  contactPerson: string;
  phone: string;
  businessName: string;
  gstin: string;
  registeredAddress: string;
  state: string;
  role: Role;
  gstType?: GstType;
  gstTaxMode?: TaxMode;
  financialYears?: FinancialYear[];
  activeFinancialYearId?: string;
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
  image?: File | null;
  imagePreview?: string;
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

export type AddEditTextileItemModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: Item;
  onSuccess: () => void;
};

export type Errors = Partial<Record<keyof Item, string>>;

export type InventoryItem = {
  id: string;
  inventoryId: string;
  itemId: string;
  totalStock: number;
  currentStock: number;
  itemName?: string;
  unit?: string;
  hsnCode?: number;
  basePrice?: number;
  itemCategory?: string;
  materialType?: string;
  consumedStock?: number;
  stockRatio?: number;
  currentValue?: number;
};

export type Inventory = {
  _id: string;
  collection: string;
  lotNumber: string;
  itemsCount: number;
  totalStock: number;
  dateReceived: string;
  totalValue: number;
  inventoryItems: InventoryItem[];
};

export type Party = {
  userId?: string;
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

export type InvoicePartyInfo = {
  id: string;
  businessName: string;
  gstin: string;
  contactPerson: string;
  phone: string;
  email: string;
  registeredAddress: string;
  state: string;
};

export type Invoice = {
  id: number;
  invoiceNumber: string;
  buyerId: string;
  sellerId: string;
  invoiceDate: string;
  items: InvoiceItem[];
  subtotal: number;
  gstType: GstType | string;
  taxMode?: TaxMode | string;
  sgst: number;
  cgst: number;
  igst: number;
  total: number;
  status: InvoiceStatus | string;
  dueDate: string;
  buyerInfo?: UserProfile;
};

export type InvoiceItem = {
  id: string;
  invoiceId: string;
  itemName: string;
  itemId: string;
  hsnCode: number | string;
  quantity: number | string;
  unit: string;
  basePrice: number | string;
  gstPercentage: number;
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

export type CreateInvoiceLineItemPayload = {
  itemId: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  basePrice: number;
  discount: number;
  taxableAmount: number;
};

export type CreateManufacturerInvoicePayload = {
  invoiceNumber?: string;
  sellerId: string;
  buyerId: string;
  invoiceDate: string;
  financialYear: string;
  notes?: string;
  status: "DRAFT" | "SENT";
  gstType: GstType;
  taxMode?: TaxMode;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  totalTaxAmount: number;
  subtotal: number;
  roundOff: number;
  total: number;
  items: InvoiceItem[];
};

export type ValidationErrors = {
  wholesalerId?: string;
  invoiceDate?: string;
  financialYear?: string;
  notes?: string;
  items?: string;
  itemErrors: Record<
    string,
    Partial<Record<keyof Omit<InvoiceItem, "id">, string>>
  >;
};

export type InvoiceSubmitAction = "DRAFT" | "SENT";

export type InvoiceCreateState = {
  invoiceNumber: string;
  wholesalerId: string;
  invoiceDate: string;
  financialYear: string;
  notes: string;
  gstType: GstType;
  taxMode: TaxMode;
};

export type FinancialYear = {
  id: string;
  label: string;
  range: string;
  startYear: number;
  endYear: number;
};

export type UserProfile = {
  businessName: string;
  contactPerson: string;
  phone: string;
  gstin: string;
  registeredAddress: string;
  state: string;
  gstType: GstType;
  gstTaxMode: TaxMode;
  financialYears: FinancialYear[];
  activeFinancialYearId: string;
  email?: string;
};

export type CreateInventoryPayload = {
  userId: string;
  collection: string;
  lotNumber: string;
  dateReceived: string;
  itemsCount: number;
  totalStock: number;
  totalValue: number;
  inventoryItems: Array<{
    itemId: string;
    totalStock: number;
    currentStock: number;
  }>;
};
