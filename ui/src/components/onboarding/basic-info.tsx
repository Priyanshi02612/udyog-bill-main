"use client";

import { useContext, useEffect } from "react";
import { Dropdown } from "../ui/dropdown";
import { Input } from "../ui/input";
import OnboardingPageWrapper from "./page-wrapper";
import { AuthContext } from "../../context/auth.context";
import { AuthContextType, OnboardingContextType } from "../../utils/types";
import { OnboardingContext } from "@/src/context/onboarding.context";

const states = [
  { label: "Select your state", value: "" },
  { label: "Maharashtra", value: "maharashtra" },
  { label: "Gujarat", value: "gujarat" },
  { label: "Tamil Nadu", value: "tamilnadu" },
  { label: "Karnataka", value: "karnataka" },
  { label: "Delhi", value: "delhi" },
];

const BasicInfo = () => {
  const { onBoardingData, handleOnBoardingData } = useContext(
    OnboardingContext,
  ) as OnboardingContextType;
  const { user } = useContext(AuthContext) as AuthContextType;

  useEffect(() => {
    if (user) {
      handleOnBoardingData(user);
    }
  },[]);

  const handleChangeForm = (
    key: keyof typeof onBoardingData,
    value: string,
  ) => {
    handleOnBoardingData({ [key]: value });
  };

  return (
    <OnboardingPageWrapper
      title="Basic Information"
      subtitle="Provide your personal and business details to get started with UdyogBill."
    >
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col gap-4 w-full mb-2">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="Your full name"
              value={onBoardingData.name}
              onChange={(e) => handleChangeForm("name", e.target.value)}
            />
            <Input
              label="Email"
              placeholder="you@company.com"
              value={onBoardingData.email}
              disabled={!!user?.email}
              onChange={(e) => handleChangeForm("email", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              value={onBoardingData.password}
              onChange={(e) => handleChangeForm("password", e.target.value)}
            />

            <Input
              label="Phone"
              type="text"
              maxLength={10}
              placeholder="9087654567"
              value={onBoardingData.phone}
              onChange={(e) => handleChangeForm("phone", e.target.value)}
            />
          </div>

          <div className="pt-2 border-t border-slate-200" />

          <div className="space-y-4">
            <Input
              label="Legal Business Name"
              placeholder="e.g. Paramount Textiles Pvt Ltd"
              value={onBoardingData.businessName}
              onChange={(e) => handleChangeForm("businessName", e.target.value)}
            />

            <Input
              label="GSTIN"
              placeholder="22AAAAA0000A1Z5"
              value={onBoardingData.gstin}
              onChange={(e) => handleChangeForm("gstin", e.target.value)}
            />

            <Input
              label="Business Address"
              placeholder="Full registered office address"
              value={onBoardingData.address}
              onChange={(e) => handleChangeForm("address", e.target.value)}
            />

            <Dropdown
              label="State / Region"
              options={states}
              value={onBoardingData.state}
              onChange={(e) => handleChangeForm("state", e.target.value)}
            />
          </div>
        </div>
      </div>
    </OnboardingPageWrapper>
  );
};

export default BasicInfo;
