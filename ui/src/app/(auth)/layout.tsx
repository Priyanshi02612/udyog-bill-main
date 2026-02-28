"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthContextType } from "../../utils/types";
import { Sidebar } from "../../components/manufacturer/sidebar";
import { Header } from "../../components/manufacturer/header";
import { UserRole } from "../../utils/constants";
import { AuthContext } from "../../context/auth.context";
import ConfirmModal from "@/src/components/ui/modal";
import { MdLogout, MdPersonOff } from "react-icons/md";
import { auth } from "../../lib/firebase/config";
import { signOut } from "firebase/auth";
import { UsersService } from "../../lib/api/users";
import toast from "react-hot-toast";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authLoading } = useContext(AuthContext) as AuthContextType;
  const userRole = user?.role as UserRole | undefined;

  const [showLogOutModal, setShowLogOutModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/");
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

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
    setShowLogOutModal(false);
  };

  const handleDeactivate = async () => {
    if (!user?.firebaseUid) {
      toast.error("Unable to deactivate account. Please login again.");
      return;
    }

    try {
      await UsersService.deactivateUserByFirebaseId(user.firebaseUid as string);
      toast.success("Account deactivated successfully");
      await signOut(auth);
      router.push("/");
      setShowDeactivateModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to deactivate account.");
      setShowDeactivateModal(false);
    }
  };

  return (
    <div className="bg-primary-soft text-slate-900 antialiased">
      <div className="flex h-screen overflow-hidden">
        {userRole && (
          <Sidebar
            role={userRole}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            handleLogoutModal={() => setShowLogOutModal(true)}
            handleDeactivateModal={() => setShowDeactivateModal(true)}
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
      <ConfirmModal
        open={showLogOutModal}
        onCancel={() => setShowLogOutModal(false)}
        title="Confirm Logout"
        description="Are you sure you want to log out of your account?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        icon={<MdLogout className="w-8 h-8 text-danger" />}
      />
      <ConfirmModal
        open={showDeactivateModal}
        onCancel={() => setShowDeactivateModal(false)}
        title="Deactivate Account"
        description="Your account will be deactivated and you will be logged out immediately."
        confirmText="Deactivate"
        cancelText="Cancel"
        onConfirm={handleDeactivate}
        icon={<MdPersonOff className="w-8 h-8 text-danger" />}
      />
    </div>
  );
}
