"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import toast from "react-hot-toast";
import { MdArrowBack } from "react-icons/md";

import { AuthShell } from "../../components/auth/auth-shell";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { auth } from "../../lib/firebase/config";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendResetLink = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSending(true);

    try {
      await sendPasswordResetEmail(auth, normalizedEmail, {
        url: `${window.location.origin}/auth/action`,
      });

      toast.success("Reset link sent. Please check your inbox.");
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/invalid-email":
            toast.error("Please enter a valid email address");
            break;
          case "auth/too-many-requests":
            toast.error("Too many attempts. Try again in a few minutes.");
            break;
          default:
            toast.error("Unable to send reset link. Please try again.");
        }
      } else {
        toast.error("Unable to send reset link. Please try again.");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="Enter your account email and we'll send you a secure reset link."
      rightTitle="Reset Access Securely"
      rightDescription="We use Firebase-secured reset links while keeping the full password reset experience inside your UdyogBill interface."
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

        <p className="text-xs text-slate-500">
          If you do not see the email, check your Spam or Promotions folder
          (especially in Gmail).
        </p>

        <Button
          size="sm"
          className="w-full"
          onClick={handleSendResetLink}
          loading={isSending}
        >
          Send Reset Link
        </Button>

        <Button
          size="sm"
          variant="outline-secondary"
          className="w-full"
          onClick={() => router.push("/login")}
          leadingIcon={<MdArrowBack className="w-4 h-4" />}
        >
          Back to Login
        </Button>
      </div>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
