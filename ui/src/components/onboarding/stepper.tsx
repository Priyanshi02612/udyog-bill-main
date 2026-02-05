"use client";

import { AuthContext } from "../../context/auth.context";
import { AuthContextType } from "../../utils/types";
import { useContext } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  User,
} from "firebase/auth";
import toast from "react-hot-toast";
import { auth } from "../../lib/firebase/config";
import { AuthService } from "../../lib/api/auth";

const STEPS = [
  {
    title: "Business Type Selection",
    cta: "Continue to Details",
  },
  {
    title: "Role Selection",
    cta: "Continue to Verification",
  },
  {
    title: "Verify OTP",
    cta: "Finish Setup",
  },
];

export default function Stepper() {
  const {
    onBoardingStep,
    setOnBoardingStep,
    onBoardingData,
    validateForm,
    user,
    otp,
  } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();

  const totalSteps = STEPS.length;
  const currentStepIndex = onBoardingStep - 1;
  const progressPercent = ((onBoardingStep - 1) / (totalSteps - 1)) * 100;

  const registerUser = async () => {
    try {
      if (onBoardingData.firebaseUid) {
        await updatePassword(user as User, onBoardingData.password);
        const response = await AuthService.createUSer(onBoardingData);
        if (response.data) {
          localStorage.setItem("UB_USER", JSON.stringify(response.data));
          await AuthService.sendOTP(response.data.email);
        }
        return;
      }

      const userData = await createUserWithEmailAndPassword(
        auth,
        onBoardingData.email,
        onBoardingData.password,
      );

      if (userData) {
        const response = await AuthService.createUSer({
          ...onBoardingData,
          firebaseUid: userData.user.uid,
        });

        if (response.data) {
          localStorage.setItem("UB_USER", JSON.stringify(response.data));
          await AuthService.sendOTP(response.data.email);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserVerification = async () => {
    try {
      const userData = localStorage.getItem("UB_USER");
      const data = JSON.parse(userData || "");

      const response = await AuthService.verifyOtp(data.email, otp.join(""));
      if (response.data.user) {
        toast.success(response.data.message);
        router.push("/login");
        await signOut(auth);
        localStorage.removeItem("UB_USER");
        setOnBoardingStep(1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleBack = () => {
    if (onBoardingStep > 1) {
      setOnBoardingStep(onBoardingStep - 1);
    }
  };

  const handleNext = async () => {
    if (onBoardingStep === 1) {
      if (!onBoardingData.role) {
        toast.error("Select a role to continue.");
        return;
      }
      setOnBoardingStep(onBoardingStep + 1);
      return;
    }

    if (onBoardingStep === 2) {
      if (!validateForm()) return;

      await registerUser();
      setOnBoardingStep(onBoardingStep + 1);
      return;
    }

    if (onBoardingStep === 3) {
      await handleUserVerification();
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div
        className={`w-full flex items-center ${onBoardingStep === 1 ? "justify-end" : "justify-between"}`}
      >
        {onBoardingStep !== 1 && (
          <Button size="sm" className="w-max md:w-50" onClick={handleBack}>
            Back
          </Button>
        )}

        <Button size="sm" className="w-max md:w-50" onClick={handleNext}>
          {STEPS[currentStepIndex].cta}
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
