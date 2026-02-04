"use client";

import { Dropdown } from "../ui/dropdown";
import { Input } from "../ui/input";
import OnboardingPageWrapper from "./page-wrapper";

const states = [
  { label: "Select your state", value: "" },
  { label: "Maharashtra", value: "maharashtra" },
  { label: "Gujarat", value: "gujarat" },
  { label: "Tamil Nadu", value: "tamilnadu" },
  { label: "Karnataka", value: "karnataka" },
  { label: "Delhi", value: "delhi" },
];

const BasicInfo = () => {
  return (
    <OnboardingPageWrapper
      title="Basic Information"
      subtitle="Provide your personal and business details to get started with UdyogBill."
    >
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col gap-4 w-full mb-2">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" placeholder="Your full name" />
            <Input label="Email" placeholder="you@company.com" />
          </div>

          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
          />

          <div className="pt-2 border-t border-slate-200" />

          <div className="space-y-4">
            <Input
              label="Legal Business Name"
              placeholder="e.g. Paramount Textiles Pvt Ltd"
            />

            <Input label="GSTIN" placeholder="22AAAAA0000A1Z5" />

            <Input
              label="Business Address"
              placeholder="Full registered office address"
            />

            <Dropdown label="State / Region" options={states} />
          </div>
        </form>
      </div>
    </OnboardingPageWrapper>
  );
};

export default BasicInfo;
