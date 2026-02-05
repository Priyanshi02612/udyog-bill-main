"use client";

import { useContext, useRef } from "react";
import OnboardingPageWrapper from "./page-wrapper";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { MdOutlineSupportAgent } from "react-icons/md";
import { AuthService } from "../../lib/api/auth";
import { AuthContext } from "../../context/auth.context";
import { AuthContextType } from "../../utils/types";

const VerifyOTP = () => {
  const { otp, setOtp } = useContext(AuthContext) as AuthContextType;
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digitRegex = /^\d$/;

  const handleChange = (value: string, index: number) => {
    if (value.length > 1) {
      const pasteValues = value.split("").slice(0, 6);
      const newOtp = [...otp];
      pasteValues.forEach((v, i) => {
        if (digitRegex.test(v)) newOtp[i] = v;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pasteValues.length - 1, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (digitRegex.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      const userData = localStorage.getItem("UB_USER");
      const data = JSON.parse(userData || "");
      await AuthService.sendOTP(data.email);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <OnboardingPageWrapper
      title="Verify Your Identity"
      subtitle="We've sent a 6-digit verification code to your email."
    >
      <div className="w-full mb-8">
        <div className="flex justify-between gap-2 sm:gap-4 mb-8">
          {otp.map((value, index) => (
            <Input
              key={index}
              className="text-center text-2xl font-bold rounded-xl"
              maxLength={6}
              placeholder="•"
              type="text"
              ref={(el: HTMLInputElement | null) => {
                inputRefs.current[index] = el;
              }}
              value={value}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>
        <div className="flex flex-col items-center gap-3">
          <Button variant="link" onClick={handleResendOTP}>
            Resend OTP
          </Button>
          <Button
            variant="link-secondary"
            size="sm"
            leadingIcon={<MdOutlineSupportAgent />}
          >
            Contact Support
          </Button>
        </div>
      </div>
    </OnboardingPageWrapper>
  );
};

export default VerifyOTP;
