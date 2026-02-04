"use client";

import {
  MdChevronRight,
  MdFactory,
  MdInventory,
  MdStorefront,
} from "react-icons/md";
import OnboardingPageWrapper from "./page-wrapper";

const roleOptions = [
  {
    id: 1,
    title: "Manufacturer",
    description:
      "Manage production lines, looms, dye-house workflow, and bulk raw material inventory tracking",
    role: "manufacturer",
    icon: <MdFactory className="w-6 h-6 text-primary" />,
  },
  {
    id: 2,
    title: "Wholesaler",
    description:
      "Connect manufacturers with retailers, manage regional distribution hubs and large B2B orders",
    role: "wholesaler",
    icon: <MdInventory className="w-6 h-6 text-primary" />,
  },
  {
    id: 3,
    title: "Retailer",
    description:
      "Source fabrics, manage storefront inventory, and handle end-customer sales and returns.",
    role: "retailer",
    icon: <MdStorefront className="w-6 h-6 text-primary" />,
  },
];

const RoleSelection = () => {
  return (
    <OnboardingPageWrapper
      title="How will you use UdyogBill?"
      subtitle="Select the role that best describes your business."
    >
      {roleOptions.map((role, index) => {
        return (
          <div
            key={index}
            className="role-card group cursor-pointer flex items-center gap-6 p-3 bg-white border-2 border-slate-200 rounded-xl hover:shadow-md transition-all"
          >
            <div className="shrink-0 w-8 h-8 md:w-14 md:h-14 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              {role.icon}
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-slate-900 text-lg font-bold mb-1">
                {role.title}
              </h3>
              <p className="hidden md:block text-slate-500 text-sm leading-relaxed">
                {role.description}
              </p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
              <MdChevronRight className="w-6 h-6 text-primary" />
            </div>
          </div>
        );
      })}
    </OnboardingPageWrapper>
  );
};

export default RoleSelection;
