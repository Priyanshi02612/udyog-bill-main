"use client";

import Image from "next/image";
import logo from "../assets/logo.png";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Image src={logo} alt="logo" width={50} height={50} />
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            UdyogBill
          </h2>
        </div>

        {pathname === "/sign-up" ? (
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="hidden md:block text-slate-500">
              Already have an account?
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="link"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
            <Button size="sm" onClick={() => router.push("/sign-up")}>
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
