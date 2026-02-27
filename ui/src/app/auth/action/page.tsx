"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { MdArrowBack } from "react-icons/md";

import loginCoverImage from "../../../assets/login-cover.png";
import logo from "../../../assets/logo.png";
import { Button } from "../../../components/ui/button";
import { auth } from "../../../lib/firebase/config";

const AuthActionContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("Verifying Link");
  const [message, setMessage] = useState(
    "Please wait while we process this link.",
  );
  const [primaryLabel, setPrimaryLabel] = useState("Go to Login");
  const [primaryPath, setPrimaryPath] = useState("/login");

  const mode = useMemo(() => searchParams.get("mode") ?? "", [searchParams]);
  const oobCode = useMemo(
    () => searchParams.get("oobCode") ?? "",
    [searchParams],
  );

  useEffect(() => {
    const processAction = async () => {
      if (!mode || !oobCode) {
        setTitle("Invalid Link");
        setMessage("This auth action link is invalid or incomplete.");
        return;
      }

      if (mode === "resetPassword") {
        router.replace(`/reset-password?${searchParams.toString()}`);
        return;
      }

      if (mode === "verifyEmail") {
        try {
          await applyActionCode(auth, oobCode);
          setTitle("Email Verified");
          setMessage("Your email has been verified successfully.");
          setPrimaryLabel("Continue to Login");
          setPrimaryPath("/login");
        } catch {
          setTitle("Verification Failed");
          setMessage("This verification link is invalid or expired.");
        }
        return;
      }

      if (mode === "recoverEmail") {
        try {
          const info = await checkActionCode(auth, oobCode);
          await applyActionCode(auth, oobCode);
          const restoredEmail = info.data.email ?? "your previous email";
          setTitle("Email Recovered");
          setMessage(
            `Email recovery complete. You can now sign in with ${restoredEmail}.`,
          );
          setPrimaryLabel("Go to Login");
          setPrimaryPath("/login");
        } catch {
          setTitle("Recovery Failed");
          setMessage("This recovery link is invalid or expired.");
        }
        return;
      }

      setTitle("Unsupported Action");
      setMessage("This link action is not supported in the current app flow.");
    };

    void processAction();
  }, [mode, oobCode, router, searchParams]);

  return (
    <div className="flex flex-1 w-full overflow-hidden min-h-screen">
      <div className="w-full lg:w-1/2 flex flex-col bg-white p-3">
        <div className="lg:hidden flex items-center justify-center gap-2">
          <div className="size-15">
            <Image src={logo} alt="logo" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">UdyogBill</h1>
        </div>

        <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-8 lg:py-12">
          <div className="max-w-110 w-full mx-auto">
            <h2 className="text-[#0d161b] text-center text-3xl font-black leading-tight tracking-tight mb-3">
              {title}
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6">{message}</p>

            <div className="flex flex-col gap-3">
              <Button
                size="md"
                className="w-full"
                onClick={() => router.push(primaryPath)}
              >
                {primaryLabel}
              </Button>

              <Button
                size="md"
                variant="outline-secondary"
                className="w-full"
                onClick={() => router.push("/login")}
                leadingIcon={<MdArrowBack className="w-4 h-4" />}
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:hidden p-8 text-center text-slate-400 text-xs mt-auto">
          © 2026 UdyogBill Financial. All rights reserved.
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-60 mix-blend-multiply"
          style={{
            backgroundImage: `url(${loginCoverImage.src})`,
          }}
        />

        <div className="relative z-10 p-12 max-w-lg text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-15 p-1 bg-white text-primary rounded-lg flex items-center justify-center">
              <Image src={logo} alt="logo" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">UdyogBill</h1>
          </div>
          <h2 className="text-5xl font-black leading-tight mb-6">
            Secure Account Actions
          </h2>
          <p className="text-xl text-white/90 font-medium">
            Auth links are processed in-app to keep your account recovery and
            verification flow consistent with UdyogBill.
          </p>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
  </div>
);

const AuthActionPage = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthActionContent />
    </Suspense>
  );
};

export default AuthActionPage;
