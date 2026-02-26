"use client";

import { useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext } from "../context/auth.context";
import { UserRole } from "../utils/constants";
import { AuthContextType } from "../utils/types";

type UsePublicRouteRedirectOptions = {
  allowNotOnboarded?: boolean;
  onboardingPath?: string;
  suppressLoadingOnOnboardingRoute?: boolean;
};

export const usePublicRouteRedirect = ({
  allowNotOnboarded = false,
  onboardingPath = "/sign-up",
  suppressLoadingOnOnboardingRoute = false,
}: UsePublicRouteRedirectOptions = {}) => {
  const { user, authLoading } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();
  const pathname = usePathname();
  const isOnboardingRoute = pathname.startsWith(onboardingPath);

  useEffect(() => {
    if (authLoading || !user) return;

    if (!user.isOnboarded) {
      if (!allowNotOnboarded && !isOnboardingRoute) {
        router.replace(onboardingPath);
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
  }, [
    allowNotOnboarded,
    authLoading,
    isOnboardingRoute,
    onboardingPath,
    router,
    user,
  ]);

  const skipLoadingOnAllowedOnboardingRoute =
    suppressLoadingOnOnboardingRoute && allowNotOnboarded && isOnboardingRoute;

  const shouldShowLoading =
    (authLoading && !skipLoadingOnAllowedOnboardingRoute) ||
    (!!user &&
      (Boolean(user.isOnboarded) || (!allowNotOnboarded && !isOnboardingRoute)));

  return {
    user,
    authLoading,
    shouldShowLoading,
  };
};
