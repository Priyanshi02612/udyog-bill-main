"use client";

import Link from "next/link";
import { AuthContext } from "../../context/auth.context";
import { AuthContextType } from "../../utils/types";
import { useContext } from "react";
import Avatar from "react-avatar";
import { MdMenu } from "react-icons/md";
import { UserRole } from "@/src/utils/constants";

export const Header = ({ onMenuOpen }: { onMenuOpen: () => void }) => {
  const { user } = useContext(AuthContext) as AuthContextType;

  if (!user) return null;

  return (
    <div className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between lg:justify-end sticky top-0 z-10">
      <Link
        href={
          user.role === UserRole.MANUFACTURER
            ? "/manufacturer/profile"
            : "/wholesaler/profile"
        }
        className="flex gap-2 items-center"
      >
        <div className="size-8 rounded-full bg-slate-200 overflow-hidden">
          <Avatar name={user.businessName} color="#8b5a2b" size="32" round />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-bold">{user.businessName}</span>
          <span className="text-xs text-slate-500 uppercase">{user.role}</span>
        </div>
      </Link>

      <button className="lg:hidden" onClick={onMenuOpen}>
        <MdMenu className="w-6 h-6" />
      </button>
    </div>
  );
};
