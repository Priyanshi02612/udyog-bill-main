"use client";

import {
  ContextType,
  OnboardingContext,
} from "../../context/onboarding.context";
import { useContext } from "react";
import { Button } from "../ui/button";

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
  const { step, setStep } = useContext(OnboardingContext) as ContextType;

  const totalSteps = STEPS.length;
  const currentStepIndex = step - 1;
  const progressPercent = ((step - 1) / (totalSteps - 1)) * 100;

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div
        className={`w-full flex items-center ${step === 1 ? "justify-end" : "justify-between"}`}
      >
        {step !== 1 && (
          <Button size="sm" className="w-max md:w-50" onClick={handleBack}>
            Back
          </Button>
        )}

        <Button
          size="sm"
          className="w-max md:w-50"
          onClick={handleNext}
          disabled={step === totalSteps}
        >
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
            Step {step} of {totalSteps}
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
