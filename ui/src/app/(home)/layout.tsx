"use client";

import { useContext, useEffect } from "react";
import { AuthContext } from "@/src/context/auth.context";
import { AuthContextType } from "@/src/utils/types";
import { useRouter } from "next/navigation";
import { UserRole } from "@/src/utils/constants";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authLoading } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !user) return;

    if (user && user.isOnboarded && !authLoading) {
      if (user.role === UserRole.MANUFACTURER) {
        router.push("/manufacturer/dashboard");
        return;
      }
      if (user.role === UserRole.WHOLESALER) {
        router.push("/wholesaler/dashboard");
        return;
      }
    } else {
      router.push("/login");
    }
  }, [authLoading, router, user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="bg-background-light textile-pattern hero-gradient min-h-screen flex flex-col">
      {children}
    </div>
  );
}
