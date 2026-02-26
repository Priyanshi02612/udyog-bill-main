"use client";

import { CTASection } from "../components/cta-section";
import { FeatureSection } from "../components/feature-section";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { HeroSection } from "../components/hero-section";
import { usePublicRouteRedirect } from "../hooks/use-public-route-redirect";

export default function HomeLayout() {
  const { shouldShowLoading } = usePublicRouteRedirect();

  if (shouldShowLoading) {
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
