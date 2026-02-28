"use client";

import Link from "next/link";
import { AuthContext } from "../../context/auth.context";
import { AuthContextType } from "../../utils/types";
import { useContext, useState } from "react";
import Avatar from "react-avatar";
import { MdHelpOutline, MdMenu } from "react-icons/md";
import { UserRole } from "@/src/utils/constants";
import { HelpCenterModal } from "../help/help-center-modal";

export const Header = ({ onMenuOpen }: { onMenuOpen: () => void }) => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [helpOpen, setHelpOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 lg:justify-end">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 md:px-3"
            onClick={() => setHelpOpen(true)}
          >
            <MdHelpOutline className="h-4 w-4" />
            <span className="hidden md:inline">Help</span>
          </button>

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
              <span className="text-xs text-slate-500 uppercase">
                {user.role}
              </span>
            </div>
          </Link>
        </div>

        <button className="lg:hidden" onClick={onMenuOpen}>
          <MdMenu className="w-6 h-6" />
        </button>
      </div>

      <HelpCenterModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        role={user.role as UserRole}
      />
    </>
  );
};
