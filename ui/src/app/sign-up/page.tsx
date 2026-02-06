"use client";

import { OnboardingContextType } from "../../utils/types";
import BasicInfo from "../../components/onboarding/basic-info";
import RoleSelection from "../../components/onboarding/role-selection";
import VerifyOTP from "../../components/onboarding/verify-otp";
import { OnboardingContext } from "../../context/onboarding.context";
import { useContext } from "react";

export default function SignUpPage() {
  const { onBoardingStep } = useContext(
    OnboardingContext,
  ) as OnboardingContextType;

  if (onBoardingStep === 1) return <RoleSelection />;
  if (onBoardingStep === 2) return <BasicInfo />;
  return <VerifyOTP />;
}
