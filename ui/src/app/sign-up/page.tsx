"use client";

import BasicInfo from "../../components/onboarding/basic-info";
import RoleSelection from "../../components/onboarding/role-selection";
import VerifyOTP from "../../components/onboarding/verify-otp";
import {
  ContextType,
  OnboardingContext,
} from "../../context/onboarding.context";
import { useContext } from "react";

export default function SignUpPage() {
  const { step } = useContext(OnboardingContext) as ContextType;

  if (step === 1) return <RoleSelection />;
  if (step === 2) return <BasicInfo />;
  return <VerifyOTP />;
}
