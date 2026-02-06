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
} from "react-icons/md";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Button } from "../ui/button";
import { auth } from "../../lib/firebase/config";
import { UserRole } from "../../utils/constants";

const navbarOptions = {
  [UserRole.MANUFACTURER]: [
    {
      title: "Dashboard",
      to: "/manufacturer/dashboard",
      icon: <MdDashboard className="w-6 h-6 text-primary" />,
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
  [UserRole.RETAILER]: [
    {
      title: "Dashboard",
      to: "/retailer",
      icon: <MdDashboard className="w-6 h-6 text-primary" />,
    },
  ],
};

export const Sidebar = ({ role }: { role: UserRole }) => {
  const router = useRouter();

  return (
    <div className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col">
      <Link href="/manufacturer/dashboard" className="p-6 flex items-center gap-3">
        <Image
          src={logo}
          alt="logo"
          width={50}
          height={50}
          className="h-10 w-auto"
        />
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          UdyogBill
        </h1>
      </Link>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navbarOptions[role].map((navOption, index) => (
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium hover:bg-primary-soft transition duration-300"
            href={navOption.to}
            key={index}
          >
            {navOption.icon}
            {navOption.title}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200">
        <Link
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium hover:bg-primary-soft transition duration-300"
          href="/manufacturer/dashboard"
        >
          <MdSettings className="w-6 h-6 text-primary" />
          Settings
        </Link>

        <Button
          className="mt-2 w-full"
          size="sm"
          trailingIcon={<MdLogout className="w-5 h-5" />}
          onClick={async () => {
            await signOut(auth);
            router.push("/");
          }}
        >
          Log out
        </Button>
      </div>
    </div>
  );
};
