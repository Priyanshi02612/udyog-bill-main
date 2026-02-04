"use client";

import { useContext } from "react";
import { Dropdown } from "../ui/dropdown";
import { Input } from "../ui/input";
import OnboardingPageWrapper from "./page-wrapper";
import { OnboardingContext } from "../../context/onboarding.context";
import { OnBoardingContextType } from "../../utils/types";

const states = [
  { label: "Select your state", value: "" },
  { label: "Maharashtra", value: "maharashtra" },
  { label: "Gujarat", value: "gujarat" },
  { label: "Tamil Nadu", value: "tamilnadu" },
  { label: "Karnataka", value: "karnataka" },
  { label: "Delhi", value: "delhi" },
];

const BasicInfo = () => {
  const { data, updateData } = useContext(
    OnboardingContext,
  ) as OnBoardingContextType;

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
              value={data.name}
              onChange={(e) => updateData({ name: e.target.value })}
            />
            <Input
              label="Email"
              placeholder="you@company.com"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
            />
          </div>

          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={data.password}
            onChange={(e) => updateData({ password: e.target.value })}
          />

          <div className="pt-2 border-t border-slate-200" />

          <div className="space-y-4">
            <Input
              label="Legal Business Name"
              placeholder="e.g. Paramount Textiles Pvt Ltd"
              value={data.businessName}
              onChange={(e) => updateData({ businessName: e.target.value })}
            />

            <Input
              label="GSTIN"
              placeholder="22AAAAA0000A1Z5"
              value={data.gstin}
              onChange={(e) => updateData({ gstin: e.target.value })}
            />

            <Input
              label="Business Address"
              placeholder="Full registered office address"
              value={data.address}
              onChange={(e) => updateData({ address: e.target.value })}
            />

            <Dropdown
              label="State / Region"
              options={states}
              value={data.state}
              onChange={(e) => updateData({ state: e.target.value })}
            />
          </div>
        </div>
      </div>
    </OnboardingPageWrapper>
  );
};

export default BasicInfo;
