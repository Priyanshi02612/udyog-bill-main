"use client";

import { createContext, useState } from "react";
import toast from "react-hot-toast";
import { OnboardingContextType, OnboardingData } from "../utils/types";
import { EMAIL_REGEX, GSTIN_REGEX, PHONE_REGEX } from "../utils/constants";

const labels: Record<keyof OnboardingData, string> = {
  contactPerson: "Contact person",
  email: "Email",
  password: "Password",
  phone: "Phone number",
  businessName: "Business name",
  gstin: "GSTIN",
  registeredAddress: "Registered address",
  state: "State",
};

const initialOnBoardingData: OnboardingData = {
  contactPerson: "",
  email: "",
  password: "",
  phone: "",
  businessName: "",
  gstin: "",
  registeredAddress: "",
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

    if (!EMAIL_REGEX.test(onBoardingData.email)) {
      toast.error("Enter a valid email");
      return false;
    }

    if (onBoardingData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }

    if (!PHONE_REGEX.test(onBoardingData.phone || "")) {
      toast.error("Enter a valid 10-digit phone number");
      return false;
    }

    if (!GSTIN_REGEX.test((onBoardingData.gstin || "").toUpperCase())) {
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
