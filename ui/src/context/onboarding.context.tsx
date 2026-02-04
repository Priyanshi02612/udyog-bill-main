"use client";

import { createContext, useState } from "react";

type Role = "manufacturer" | "wholesaler" | "retailer";

type OnboardingData = {
  name?: string;
  email?: string;
  role?: Role;
};

export type ContextType = {
  step: number;
  setStep: (step: number) => void;
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
};

export const OnboardingContext = createContext<ContextType | null>(null);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<OnboardingData>({});

  const updateData = (newData: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...newData }));

  return (
    <OnboardingContext.Provider value={{ step, setStep, data, updateData }}>
      {children}
    </OnboardingContext.Provider>
  );
}
