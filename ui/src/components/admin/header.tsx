"use client";

import { OnboardingData } from "../../utils/types";
import Link from "next/link";
import Avatar from "react-avatar";
import { MdNotifications } from "react-icons/md";

export const Header = ({ user }: { user: OnboardingData }) => {
  return (
    <div className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-end sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Link href="/manufacturer/dashboard" className="relative">
          <MdNotifications className="w-8 h-8 text-slate-400" />
          <span className="absolute top-0 right-0 size-3 bg-primary rounded-full border-2 border-white"></span>
        </Link>

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <div className="flex gap-2 items-center">
          <div className="size-8 rounded-full bg-slate-200 overflow-hidden">
            <Avatar name={user.name} color="#8b5a2b" size="32" round />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-bold">{user.name}</span>
            <span className="text-xs text-slate-500 uppercase">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
