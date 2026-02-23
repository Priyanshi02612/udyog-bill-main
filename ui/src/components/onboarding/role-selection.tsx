"use client";

import { useContext, useEffect } from "react";
import { MdChevronRight, MdFactory, MdInventory } from "react-icons/md";
import OnboardingPageWrapper from "./page-wrapper";
import {
  AuthContextType,
  OnboardingContextType,
  Role,
} from "../../utils/types";
import { OnboardingContext } from "@/src/context/onboarding.context";
import { AuthContext } from "@/src/context/auth.context";

const roleOptions: {
  title: string;
  description: string;
  role: Role;
  icon: React.ReactNode;
}[] = [
  {
    title: "Manufacturer",
    description:
      "Manage production lines, looms, dye-house workflow, and bulk raw material inventory tracking",
    role: "manufacturer",
    icon: <MdFactory className="w-6 h-6 text-primary" />,
  },
  {
    title: "Wholesaler",
    description:
      "Connect manufacturers with buyers, manage regional distribution hubs and large B2B orders",
    role: "wholesaler",
    icon: <MdInventory className="w-6 h-6 text-primary" />,
  },
];

const RoleSelection = () => {
  const { onBoardingData, handleOnBoardingData } = useContext(
    OnboardingContext,
  ) as OnboardingContextType;

  const { user, authLoading } = useContext(AuthContext) as AuthContextType;

  useEffect(() => {
    if (user) {
      handleOnBoardingData({ role: user.role });
    }
  }, [user]);

  const handleSelectRole = (role: Role) => {
    handleOnBoardingData({ role });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center gap-2 h-[calc(100vh-64px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  return (
    <OnboardingPageWrapper
      title="How will you use UdyogBill?"
      subtitle="Select the role that best describes your business."
    >
      <div className="flex flex-col gap-4">
        {roleOptions.map((role) => {
          const isSelected =
            onBoardingData.role === role.role || user?.role === role.role;

          return (
            <div
              key={role.role}
              onClick={() => handleSelectRole(role.role)}
              className={`group cursor-pointer flex items-center gap-6 p-3 rounded-xl border-2 transition-all
                ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-slate-200 bg-white hover:shadow-md"
                }`}
            >
              <div
                className={`shrink-0 w-14 h-14 rounded-lg flex items-center justify-center transition-colors
                  ${
                    isSelected
                      ? "bg-primary/20"
                      : "bg-primary/10 group-hover:bg-primary/20"
                  }`}
              >
                {role.icon}
              </div>

              <div className="flex-1 text-left">
                <h3 className="text-slate-900 text-lg font-bold mb-1">
                  {role.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {role.description}
                </p>
              </div>

              <MdChevronRight
                className={`w-6 h-6 transition-opacity ${
                  isSelected
                    ? "opacity-100 text-primary"
                    : "opacity-0 group-hover:opacity-100 text-primary"
                }`}
              />
            </div>
          );
        })}
      </div>
    </OnboardingPageWrapper>
  );
};

export default RoleSelection;
