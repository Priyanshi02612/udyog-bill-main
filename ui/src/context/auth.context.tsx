"use client";

import { createContext, useState } from "react";
import { AuthContextType, OnboardingData } from "../utils/types";

export const AuthContext = createContext<AuthContextType | null>(
  null,
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [onBoardingStep, setOnBoardingStep] = useState<number>(1);
  const [onBoardingData, setOnBoardingData] = useState<OnboardingData>({ email: "", password: "" });

  const handleOnBoardingData = (newData: Partial<OnboardingData>) => {
    setOnBoardingData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider value={{ onBoardingStep, setOnBoardingStep, onBoardingData, handleOnBoardingData }}>
      {children}
    </AuthContext.Provider>
  );
}
