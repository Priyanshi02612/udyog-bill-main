"use client";

import { useContext } from "react";
import {
  MdChevronRight,
  MdFactory,
  MdInventory,
  MdStorefront,
} from "react-icons/md";
import OnboardingPageWrapper from "./page-wrapper";
import { AuthContext } from "../../context/auth.context";
import { AuthContextType, Role } from "../../utils/types";

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
      "Connect manufacturers with retailers, manage regional distribution hubs and large B2B orders",
    role: "wholesaler",
    icon: <MdInventory className="w-6 h-6 text-primary" />,
  },
  {
    title: "Retailer",
    description:
      "Source fabrics, manage storefront inventory, and handle end-customer sales and returns.",
    role: "retailer",
    icon: <MdStorefront className="w-6 h-6 text-primary" />,
  },
];

const RoleSelection = () => {
  const { onBoardingData, handleOnBoardingData } = useContext(
    AuthContext,
  ) as AuthContextType;

  const handleSelectRole = (role: Role) => {
    handleOnBoardingData({ role });
  };

  return (
    <OnboardingPageWrapper
      title="How will you use UdyogBill?"
      subtitle="Select the role that best describes your business."
    >
      <div className="flex flex-col gap-4">
        {roleOptions.map((role) => {
          const isSelected = onBoardingData.role === role.role;

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
