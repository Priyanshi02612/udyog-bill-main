"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { AuthShell } from "../../components/auth/auth-shell";
import { auth } from "../../lib/firebase/config";
import { UsersService } from "../../lib/api/users";
import { OnboardingContext } from "../../context/onboarding.context";
import { OnboardingContextType } from "../../utils/types";
import { usePublicRouteRedirect } from "../../hooks/use-public-route-redirect";

import { MdHelp, MdRemoveRedEye } from "react-icons/md";
import { useContext, useState } from "react";
import toast from "react-hot-toast";

import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import Link from "next/link";

const LoginContent = () => {
  const { user, shouldShowLoading } = usePublicRouteRedirect();
  const { resetOnBoardingState } = useContext(
    OnboardingContext,
  ) as OnboardingContextType;
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [deactivatedUid, setDeactivatedUid] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  const isDeactivatedAccountError = (error: unknown) => {
    if (!axios.isAxiosError(error)) return false;
    const message = error.response?.data?.message;
    return (
      typeof message === "string" &&
      message.toLowerCase().includes("deactivated")
    );
  };

  const handleLogin = async () => {
    setDeactivatedUid(null);

    try {
      setLoading(true);

      const firebaseUser = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const firebaseUid = firebaseUser.user.uid;

      let userData: { isOnboarded?: boolean; role?: string };
      
      try {
        const response = await UsersService.getUserByFirebaseId(firebaseUid);
        userData = response.data as { isOnboarded?: boolean; role?: string };
      } catch (error: unknown) {
        if (isDeactivatedAccountError(error)) {
          setDeactivatedUid(firebaseUid);
          await signOut(auth);
          toast.error("Account is deactivated. Reactivate to continue.");
          return;
        }

        throw error;
      }

      if (!userData.isOnboarded) {
        router.replace("/sign-up");
        return;
      }

      const redirect = searchParams.get("redirect");
      if (redirect && redirect.startsWith("/")) {
        router.replace(redirect);
        return;
      }

      switch (userData.role) {
        case "manufacturer":
          router.replace("/manufacturer/dashboard");
          break;

        case "wholesaler":
          router.replace("/wholesaler/dashboard");
          break;

        default:
          toast.error("Invalid user role");
          await signOut(auth);
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong while logging in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateAccount = async () => {
    if (!deactivatedUid) {
      toast.error("Please sign in again to reactivate your account.");
      return;
    }

    try {
      setReactivating(true);
      await UsersService.reactivateUserByFirebaseId(deactivatedUid);
      setDeactivatedUid(null);
      toast.success("Account reactivated. Please sign in.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to reactivate account");
      }
    } finally {
      setReactivating(false);
    }
  };

  const handleSignUp = async () => {
    if (user) {
      await signOut(auth);
      resetOnBoardingState();
    }

    router.push("/sign-up");
  };

  return (
    <AuthShell
      title="Welcome back"
      rightTitle="Modernizing Finance for the Textile Industry"
      rightDescription="Streamline your invoices, track production costs, and manage your global supply chain finances in one place."
      showDesktopFooter
      leftBottomContent={
        <div className="mt-5 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <MdHelp className="w-8 h-8 text-primary" />
            <p className="text-xs text-slate-500 leading-relaxed">
              {`Need help logging in? Please contact your organization's IT administrator or reach out to `}
              <a className="text-primary font-medium hover:underline" href="#">
                support@udyogbill.in
              </a>
              .
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. david@textilecorp.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          required
          trailingIcon={<MdRemoveRedEye className="w-4 h-4" />}
          onTrailingIconClick={() => setShowPassword(!showPassword)}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Link
          href="/forgot-password"
          className="text-primary text-right text-sm font-bold hover:underline"
          onClick={() => router.push("/forgot-password")}
        >
          Forgot Password?
        </Link>

        <Button
          size="md"
          className="w-full"
          onClick={handleLogin}
          loading={loading}
        >
          Sign In to Dashboard
        </Button>

        {deactivatedUid && (
          <Button
            size="md"
            className="w-full"
            variant="outline-danger"
            onClick={handleReactivateAccount}
            loading={reactivating}
          >
            Reactivate Account
          </Button>
        )}

        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-slate-500">{`Don't have an account?`}</span>
          <Button variant="link" onClick={handleSignUp}>
            Sign Up
          </Button>
        </div>
      </div>
    </AuthShell>
  );
};

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
  </div>
);

const Login = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginContent />
    </Suspense>
  );
};

export default Login;
