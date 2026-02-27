"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  User,
} from "firebase/auth";
import toast from "react-hot-toast";

import { AuthContext } from "../../context/auth.context";
import { OnboardingContext } from "../../context/onboarding.context";
import { auth } from "../../lib/firebase/config";
import { AuthService } from "../../lib/api/auth";
import { Button } from "../ui/button";
import {
  AuthContextType,
  OnboardingContextType,
  OnboardingData,
  SignupPayload,
} from "../../utils/types";
import { UserRole } from "../../utils/constants";

const STEPS = [
  { title: "Role Selection", cta: "Continue to Details" },
  { title: "Basic Information", cta: "Continue to Verification" },
  { title: "Verify OTP", cta: "Finish Setup" },
];

const isOnboardingValid = (onBoardingData: OnboardingData) => {
  const {
    contactPerson,
    email,
    password,
    phone,
    businessName,
    gstin,
    registeredAddress,
    state,
    role,
  } = onBoardingData;

  return (
    contactPerson &&
    email &&
    password &&
    phone &&
    businessName &&
    gstin &&
    registeredAddress &&
    state &&
    role
  );
};

const buildSignupPayload = (
  firebaseUid: string,
  onBoardingData: OnboardingData,
): SignupPayload => {
  const {
    email,
    contactPerson,
    phone,
    businessName,
    gstin,
    registeredAddress,
    state,
    role,
  } = onBoardingData;

  return {
    firebaseUid,
    email,
    contactPerson: contactPerson || "",
    phone: phone || "",
    businessName: businessName || "",
    gstin: gstin || "",
    registeredAddress: registeredAddress || "",
    state: state || "",
    role: role || UserRole.MANUFACTURER,
  };
};

export default function Stepper() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useContext(AuthContext) as AuthContextType;
  const {
    onBoardingStep,
    setOnBoardingStep,
    onBoardingData,
    validateForm,
    otp,
  } = useContext(OnboardingContext) as OnboardingContextType;

  const totalSteps = STEPS.length;
  const currentStepIndex = onBoardingStep - 1;
  const progressPercent = ((onBoardingStep - 1) / (totalSteps - 1)) * 100;

  const registerUser = async (): Promise<boolean> => {
    try {
      if (!isOnboardingValid(onBoardingData)) {
        toast.error("Please complete all required onboarding fields.");
        return false;
      }

      let firebaseUid = onBoardingData.firebaseUid;

      if (firebaseUid && user) {
        await updatePassword(user as User, onBoardingData.password);
      } else {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          onBoardingData.email,
          onBoardingData.password,
        );
        firebaseUid = userCred.user.uid;
      }

      const payload = buildSignupPayload(firebaseUid!, onBoardingData);
      const response = await AuthService.createUser(payload);

      if (!response.data) return false;

      localStorage.setItem("UB_USER", JSON.stringify(response.data));
      await AuthService.sendOTP(response.data.email);

      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  const handleVerification = async () => {
    try {
      const stored = localStorage.getItem("UB_USER");
      if (!stored) return;

      const data = JSON.parse(stored);
      const response = await AuthService.verifyOtp(data.email, otp.join(""));

      if (response.data?.user) {
        toast.success(response.data.message);
        await signOut(auth);
        localStorage.removeItem("UB_USER");
        setOnBoardingStep(1);
        router.push("/login");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
    }
  };

  const handleNext = async () => {
    if (isSubmitting) return;

    switch (onBoardingStep) {
      case 1:
        if (!onBoardingData.role) {
          toast.error("Select a role to continue.");
          return;
        }
        break;

      case 2:
        if (!validateForm()) return;
        setIsSubmitting(true);
        const success = await registerUser();
        setIsSubmitting(false);
        if (!success) return;
        break;

      case 3:
        await handleVerification();
        return;
    }

    setOnBoardingStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (isSubmitting) return;
    if (onBoardingStep > 1) {
      setOnBoardingStep((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div
        className={`w-full flex items-center ${onBoardingStep === 1 ? "justify-end" : "justify-between"}`}
      >
        {onBoardingStep !== 1 && (
          <Button
            size="sm"
            className="w-max md:w-50"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
        )}

        <Button
          size="sm"
          className="w-max md:w-50"
          onClick={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : STEPS[currentStepIndex].cta}
        </Button>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Onboarding Progress
            </p>
            <p className="text-slate-900 text-base font-medium">
              {STEPS[currentStepIndex].title}
            </p>
          </div>

          <p className="text-primary text-sm font-bold">
            Step {onBoardingStep} of {totalSteps}
          </p>
        </div>

        <div className="w-full h-2 rounded bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
