"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "../../assets/logo.png";
import {
  MdLogout,
  MdDashboard,
  MdGroups,
  MdInventory,
  MdReceiptLong,
  MdSettings,
  MdClose,
  MdWysiwyg,
} from "react-icons/md";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Button } from "../ui/button";
import { auth } from "../../lib/firebase/config";
import { UserRole } from "../../utils/constants";
import clsx from "clsx";

const navbarOptions = {
  [UserRole.MANUFACTURER]: [
    {
      title: "Dashboard",
      to: "/manufacturer/dashboard",
      icon: <MdDashboard className="w-6 h-6 text-primary" />,
    },
    {
      title: "Items",
      to: "/manufacturer/items",
      icon: <MdWysiwyg className="w-6 h-6 text-primary" />,
    },
    {
      title: "Inventory",
      to: "/manufacturer/inventory",
      icon: <MdInventory className="w-6 h-6 text-primary" />,
    },
    {
      title: "Wholesalers",
      to: "/manufacturer/wholesalers",
      icon: <MdGroups className="w-6 h-6 text-primary" />,
    },
    {
      title: "Invoices",
      to: "/manufacturer/invoices",
      icon: <MdReceiptLong className="w-6 h-6 text-primary" />,
    },
  ],
  [UserRole.WHOLESALER]: [
    {
      title: "Dashboard",
      to: "/wholesaler",
      icon: <MdDashboard className="w-6 h-6 text-primary" />,
    },
    {
      title: "Invoices",
      to: "/wholesaler/invoices",
      icon: <MdReceiptLong className="w-6 h-6 text-primary" />,
    },
  ],
};

export const Sidebar = ({
  role,
  isOpen,
  onClose,
}: {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const activeTab =
    navbarOptions[role].find((item) => pathname.startsWith(item.to))?.to ||
    "/manufacturer/dashboard";
  const isSettingsActive = pathname.startsWith("/manufacturer/profile");

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div
      className={clsx(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300",
        {
          "-translate-x-full lg:translate-x-0": !isOpen,
          "translate-x-0": isOpen,
        },
      )}
    >
      <div className="p-6 flex items-center justify-between">
        <Link
          href="/manufacturer/dashboard"
          className="flex items-center gap-3"
        >
          <Image
            src={logo}
            alt="logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <h1 className="text-xl font-bold text-slate-900">UdyogBill</h1>
        </Link>

        <button className="lg:hidden" onClick={onClose}>
          <MdClose className="w-6 h-6 text-primary" />
        </button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navbarOptions[role].map((navOption, index) => (
          <Link
            key={index}
            href={navOption.to}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium hover:bg-primary-soft transition
              ${activeTab === navOption.to && !isSettingsActive ? "bg-primary-soft" : ""}
            `}
          >
            {navOption.icon}
            {navOption.title}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200">
        <Link
          href="/manufacturer/profile"
          onClick={onClose}
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium hover:bg-primary-soft",
            isSettingsActive && "bg-primary-soft",
          )}
        >
          <MdSettings className="w-6 h-6 text-primary" />
          Settings
        </Link>

        <Button
          className="mt-2 w-full"
          size="sm"
          trailingIcon={<MdLogout className="w-5 h-5" />}
          onClick={handleLogout}
        >
          Log out
        </Button>
      </div>
    </div>
  );
};
