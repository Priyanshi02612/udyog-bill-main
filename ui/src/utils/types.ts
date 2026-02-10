/* eslint-disable @typescript-eslint/no-explicit-any */

export type Role = "manufacturer" | "wholesaler" | "retailer";

export type ItemCategory = "FABRIC" | "MATERIAL" | "THREAD";

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
