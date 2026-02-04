"use client";

import Link from "next/link";
import { Header } from "../../components/header";
import Stepper from "../../components/onboarding/stepper";
import { OnboardingProvider } from "../../context/onboarding.context";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <div className="bg-background-light textile-pattern hero-gradient min-h-screen flex flex-col">
        <Header />

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-160 w-full flex flex-col items-center">
            <div className="">{children}</div>

            <Stepper />
          </div>
        </div>

        <div className="p-5 border-t border-t-border flex gap-10 justify-center text-sm text-slate-500">
          <Link href="/" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="/" className="hover:text-primary transition-colors">
            Cookie Policy
          </Link>
        </div>
      </div>
    </OnboardingProvider>
  );
}
