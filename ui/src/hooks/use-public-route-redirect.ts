"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/auth.context";
import { UserRole } from "../utils/constants";
import { AuthContextType } from "../utils/types";

type UsePublicRouteRedirectOptions = {
  allowNotOnboarded?: boolean;
};

export const usePublicRouteRedirect = ({
  allowNotOnboarded = false,
}: UsePublicRouteRedirectOptions = {}) => {
  const { user, authLoading } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !user) return;

    if (!user.isOnboarded) {
      if (!allowNotOnboarded) {
        router.replace("/sign-up");
      }
      return;
    }

    if (user.role === UserRole.MANUFACTURER) {
      router.replace("/manufacturer/dashboard");
      return;
    }

    if (user.role === UserRole.WHOLESALER) {
      router.replace("/wholesaler/dashboard");
    }
  }, [allowNotOnboarded, authLoading, router, user]);

  const shouldShowLoading =
    authLoading ||
    (!!user && (!allowNotOnboarded || Boolean(user.isOnboarded)));

  return {
    user,
    authLoading,
    shouldShowLoading,
  };
};
