"use client";

import Image from "next/image";
import logo from "../assets/logo.png";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase/config";
import Link from "next/link";
import { useContext } from "react";
import { OnboardingContextType } from "../utils/types";
import { OnboardingContext } from "../context/onboarding.context";

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { resetOnBoardingState } = useContext(
    OnboardingContext,
  ) as OnboardingContextType;

  const handleLogin = async () => {
    await signOut(auth);
    resetOnBoardingState();
    router.push("/login");
  };

  const handleSignUp = async () => {
    await signOut(auth);
    resetOnBoardingState();
    router.push("/sign-up");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1">
          <Image
            src={logo}
            alt="logo"
            width={50}
            height={50}
            className="h-10 w-auto"
          />
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            UdyogBill
          </h2>
        </Link>

        {pathname === "/sign-up" ? (
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="hidden md:block text-slate-500">
              Already have an account?
            </span>
            <Button variant="primary" size="sm" onClick={handleLogin}>
              Login
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button size="sm" variant="link" onClick={handleLogin}>
              Login
            </Button>
            <Button size="sm" onClick={handleSignUp}>
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
