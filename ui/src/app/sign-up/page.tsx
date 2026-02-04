"use client";

import { AuthContextType } from "../../utils/types";
import BasicInfo from "../../components/onboarding/basic-info";
import RoleSelection from "../../components/onboarding/role-selection";
import VerifyOTP from "../../components/onboarding/verify-otp";
import { AuthContext } from "../../context/auth.context";
import { useContext } from "react";

export default function SignUpPage() {
  const { onBoardingStep } = useContext(AuthContext) as AuthContextType;

  if (onBoardingStep === 1) return <RoleSelection />;
  if (onBoardingStep === 2) return <BasicInfo />;
  return <VerifyOTP />;
}
