"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthContextType } from "../../utils/types";
import { Sidebar } from "../../components/admin/sidebar";
import { Header } from "../../components/admin/header";
import { UserRole } from "../../utils/constants";
import { AuthContext } from "../../context/auth.context";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authLoading } = useContext(AuthContext) as AuthContextType;
  const userRole = user?.role as UserRole | undefined;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (
      pathname.startsWith("/manufacturer") &&
      userRole !== UserRole.MANUFACTURER
    ) {
      router.replace(`/${userRole}/dashboard`);
      return;
    }

    if (
      pathname.startsWith("/wholesaler") &&
      userRole !== UserRole.WHOLESALER
    ) {
      router.replace(`/${userRole}/dashboard`);
      return;
    }
  }, [authLoading, userRole, pathname, router, user]);

  return (
    <div className="bg-primary-soft text-slate-900 antialiased">
      <div className="flex h-screen overflow-hidden">
        {userRole && (
          <Sidebar
            role={userRole}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark"
          style={{ scrollbarWidth: "none" }}
        >
          <Header onMenuOpen={() => setSidebarOpen(true)} />

          {authLoading || !user ? (
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
