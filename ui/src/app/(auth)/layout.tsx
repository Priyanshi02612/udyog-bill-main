"use client";

import { useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthContext } from "../../context/auth.context";
import { AuthContextType } from "../../utils/types";
import { Sidebar } from "../../components/admin/sidebar";
import { Header } from "../../components/admin/header";
import { UserRole } from "../../utils/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { onBoardingData, loading } = useContext(
    AuthContext,
  ) as AuthContextType;

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (!loading) {
      if (!onBoardingData) {
        router.replace("/login");
        return;
      }

      if (
        pathname.startsWith("/manufacturer") &&
        userRole !== UserRole.MANUFACTURER
      ) {
        router.replace(`/${userRole}/dashboard`);
      }

      if (
        pathname.startsWith("/wholesaler") &&
        userRole !== UserRole.WHOLESALER
      ) {
        router.replace(`/${userRole}`);
      }

      if (pathname.startsWith("/retailer") && userRole !== UserRole.RETAILER) {
        router.replace(`/${userRole}`);
      }
    }
  }, [loading, onBoardingData, pathname, router, userRole]);

  return (
    <div className="bg-background-light text-slate-900 antialiased">
      <div className="flex h-screen overflow-hidden">
        <Sidebar role={userRole as UserRole} />

        <main
          className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark"
          style={{ scrollbarWidth: "none" }}
        >
          <Header user={onBoardingData} />

          {loading || !onBoardingData ? (
            <div className="flex items-center justify-center gap-2 h-[calc(100vh-64px)]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
            </div>
          ) : (
            <>{children}</>
          )}

          <div className="p-5 text-center text-slate-500 text-sm">
            <p>© 2026 UdyogBill Financial. All rights reserved.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
