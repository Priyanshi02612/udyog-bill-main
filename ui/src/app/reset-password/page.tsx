"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import toast from "react-hot-toast";
import { MdArrowBack, MdRemoveRedEye } from "react-icons/md";

import { AuthShell } from "../../components/auth/auth-shell";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { auth } from "../../lib/firebase/config";

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isVerifyingCode, setIsVerifyingCode] = useState(true);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const oobCode = useMemo(
    () => searchParams.get("oobCode") ?? "",
    [searchParams],
  );

  useEffect(() => {
    const verifyResetCode = async () => {
      if (!oobCode) {
        setIsCodeValid(false);
        setIsVerifyingCode(false);
        return;
      }

      try {
        const resolvedEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(resolvedEmail);
        setIsCodeValid(true);
      } catch {
        setIsCodeValid(false);
      } finally {
        setIsVerifyingCode(false);
      }
    };

    void verifyResetCode();
  }, [oobCode]);

  const handleResetPassword = async () => {
    if (!oobCode) {
      toast.error("Invalid reset link.");
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Please fill both password fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password updated successfully. Please sign in.");
      router.replace("/login");
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/expired-action-code":
            toast.error("Reset link has expired. Request a new one.");
            break;
          case "auth/invalid-action-code":
            toast.error("Invalid reset link. Request a new one.");
            break;
          case "auth/weak-password":
            toast.error("Please choose a stronger password.");
            break;
          default:
            toast.error("Unable to reset password. Please try again.");
        }
      } else {
        toast.error("Unable to reset password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Set New Password"
      rightTitle="Secure Password Update"
      rightDescription="Create a new password to restore account access and continue managing operations without interruption."
    >
      {isVerifyingCode ? (
        <p className="text-sm text-slate-500 text-center">
          Verifying reset link...
        </p>
      ) : !isCodeValid ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-500 text-center">
            This reset link is invalid or expired.
          </p>
          <Button
            size="sm"
            className="w-full"
            onClick={() => router.push("/forgot-password")}
          >
            Request New Link
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Input label="Email Address" type="email" value={email} readOnly />

          <Input
            label="New Password"
            required
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            trailingIcon={<MdRemoveRedEye className="w-4 h-4" />}
            onTrailingIconClick={() => setShowPassword((value) => !value)}
          />
          <Input
            label="Confirm New Password"
            required
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            trailingIcon={<MdRemoveRedEye className="w-4 h-4" />}
            onTrailingIconClick={() =>
              setShowConfirmPassword((value) => !value)
            }
          />
          <Button
            size="sm"
            className="w-full"
            onClick={handleResetPassword}
            loading={isSubmitting}
          >
            Update Password
          </Button>
        </div>
      )}

      <Button
        size="sm"
        variant="link-secondary"
        className="w-full mt-3"
        onClick={() => router.push("/login")}
        leadingIcon={<MdArrowBack className="w-4 h-4" />}
      >
        Back to Login
      </Button>
    </AuthShell>
  );
};

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
  </div>
);

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
