export type Role = "manufacturer" | "wholesaler" | "retailer";

export type AuthContextType = {
  onBoardingStep: number;
  setOnBoardingStep: (step: number) => void;
  onBoardingData: OnboardingData;
  handleOnBoardingData: (data: Partial<OnboardingData>) => void;
};

export type OnboardingData = {
  name?: string;
  email: string;
  password: string;
  phone?: string;

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
