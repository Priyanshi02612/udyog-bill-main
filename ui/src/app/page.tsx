"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/src/context/auth.context";
import { CTASection } from "../components/cta-section";
import { FeatureSection } from "../components/feature-section";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { HeroSection } from "../components/hero-section";
import { UserRole } from "@/src/utils/constants";
import { AuthContextType } from "@/src/utils/types";

export default function Home() {
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
        router.push("/wholesaler");
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
      <Header />

      <div className="grow">
        <HeroSection />
        <FeatureSection />
        <CTASection />
      </div>

      <Footer />
    </div>
  );
}
