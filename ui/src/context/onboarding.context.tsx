"use client";

import { createContext, useState } from "react";
import { OnBoardingContextType, OnboardingData } from "../utils/types";

export const OnboardingContext = createContext<OnBoardingContextType | null>(
  null,
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<OnboardingData>({});

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <OnboardingContext.Provider value={{ step, setStep, data, updateData }}>
      {children}
    </OnboardingContext.Provider>
  );
}
