"use client";

import { createContext, useEffect, useState } from "react";
import { AuthContextType, OnboardingData } from "../utils/types";
import toast from "react-hot-toast";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase/config";
import { UsersService } from "../lib/api/users";

const labels: Record<string, string> = {
  name: "Full name",
  email: "Email",
  password: "Password",
  phone: "Phone number",
  businessName: "Business name",
  gstin: "GSTIN",
  address: "Business address",
  state: "State",
};

const initialOnBoardingData = {
  name: "",
  email: "",
  password: "",
  phone: "",
  businessName: "",
  gstin: "",
  address: "",
  state: "",
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [onBoardingStep, setOnBoardingStep] = useState<number>(1);
  const [onBoardingData, setOnBoardingData] = useState<OnboardingData>(
    initialOnBoardingData,
  );
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const resetOnBoardingState = () => {
    setUser(null);
    setOnBoardingData(initialOnBoardingData);
    setOnBoardingStep(1);
    setOtp(["", "", "", "", "", ""]);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        resetOnBoardingState();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await UsersService.getUserByFirebaseId(user?.uid);
        setOnBoardingData(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    fetchUserDetails();
  }, [user?.uid]);

  const handleOnBoardingData = (newData: Partial<OnboardingData>) => {
    setOnBoardingData((prev) => ({ ...prev, ...newData }));
  };

  const validateForm = () => {
    const fields = [
      "name",
      "email",
      "password",
      "phone",
      "businessName",
      "gstin",
      "address",
      "state",
    ] as const;

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
    <AuthContext.Provider
      value={{
        onBoardingStep,
        setOnBoardingStep,
        onBoardingData,
        handleOnBoardingData,
        validateForm,
        otp,
        setOtp,
        user,
        resetOnBoardingState,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
