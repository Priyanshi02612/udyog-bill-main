"use client";

import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { OnboardingContextType, OnboardingData } from "../utils/types";

const labels: Record<keyof OnboardingData, string> = {
  name: "Full name",
  email: "Email",
  password: "Password",
  phone: "Phone number",
  businessName: "Business name",
  gstin: "GSTIN",
  address: "Business address",
  state: "State",
};

const initialOnBoardingData: OnboardingData = {
  name: "",
  email: "",
  password: "",
  phone: "",
  businessName: "",
  gstin: "",
  address: "",
  state: "",
};

export const OnboardingContext = createContext<OnboardingContextType | null>(
  null,
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [onBoardingStep, setOnBoardingStep] = useState(1);
  const [onBoardingData, setOnBoardingData] = useState<OnboardingData>(
    initialOnBoardingData,
  );
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);

  const resetOnBoardingState = () => {
    setOnBoardingStep(1);
    setOnBoardingData(initialOnBoardingData);
    setOtp(["", "", "", "", "", ""]);
  };

  const handleOnBoardingData = (data: Partial<OnboardingData>) => {
    setOnBoardingData((prev) => ({ ...prev, ...data }));
  };

  const validateForm = () => {
    const fields = Object.keys(labels) as (keyof OnboardingData)[];

    if (fields.every((key) => !onBoardingData[key])) {
      toast.error("Please fill the form to continue");
      return false;
    }

    for (const key of fields) {
      if (!onBoardingData[key]) {
        toast.error(`${labels[key]} is required`);
        return false;
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(onBoardingData.email)) {
      toast.error("Enter a valid email");
      return false;
    }

    if (onBoardingData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }

    if (!/^\d{10}$/.test(onBoardingData.phone || "")) {
      toast.error("Enter a valid 10-digit phone number");
      return false;
    }

    if (
      !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/.test(
        (onBoardingData.gstin || "").toUpperCase(),
      )
    ) {
      toast.error("Invalid GSTIN format");
      return false;
    }

    return true;
  };

  return (
    <OnboardingContext.Provider
      value={{
        onBoardingStep,
        setOnBoardingStep,
        onBoardingData,
        handleOnBoardingData,
        validateForm,
        otp,
        setOtp,
        resetOnBoardingState,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
