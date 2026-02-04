export type Role = "manufacturer" | "wholesaler" | "retailer";

export type OnBoardingContextType = {
  step: number;
  setStep: (step: number) => void;
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
};

export type OnboardingData = {
  name?: string;
  email?: string;
  password?: string;

  businessName?: string;
  gstin?: string;
  address?: string;
  state?: string;

  role?: Role;
};

export type OnboardingPageWrapperProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};
