/* eslint-disable @typescript-eslint/no-explicit-any */

export type Role = "manufacturer" | "wholesaler" | "retailer";

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
