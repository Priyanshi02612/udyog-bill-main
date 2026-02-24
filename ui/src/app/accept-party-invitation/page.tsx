"use client";

import { useContext, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/auth.context";
import { ManufacturerService } from "../../lib/api/manufacturer";
import { AuthContextType } from "../../utils/types";
import { getErrorMessage } from "../../utils/helpers";
import { UserRole } from "../../utils/constants";
import { Button } from "../../components/ui/button";

const AcceptPartyInvitationPage = () => {
  const { user, authLoading } = useContext(AuthContext) as AuthContextType;
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const loginRedirectUrl = useMemo(() => {
    if (!token) return "/login";
    const redirectPath = `/accept-party-invitation?token=${encodeURIComponent(token)}`;
    return `/login?redirect=${encodeURIComponent(redirectPath)}`;
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!token) {
      toast.error("Invalid invitation link");
      return;
    }

    if (!user) {
      toast.error("Please login as wholesaler");
      router.push(loginRedirectUrl);
      return;
    }

    try {
      setLoading(true);

      await ManufacturerService.acceptInvitation({
        token,
        wholesalerUserId: user._id as string,
      });

      toast.success("Invitation accepted successfully");
      router.replace("/wholesaler");
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Invalid invitation
          </h1>
          <p className="text-slate-600 mt-2">Invitation token is missing.</p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">Login required</h1>
          <p className="text-slate-600 mt-2">
            Please login with invited wholesaler account to accept invitation.
          </p>

          <Button
            className="mt-5 w-full"
            onClick={() => router.push(loginRedirectUrl)}
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (user.role !== UserRole.WHOLESALER) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Wrong account type
          </h1>
          <p className="text-slate-600 mt-2">
            Invitation can only be accepted by a wholesaler account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">Accept invitation</h1>
        <p className="text-slate-600 mt-2">
          Click below to accept and connect with manufacturer.
        </p>

        <Button
          className="mt-5 w-full"
          onClick={handleAcceptInvitation}
          loading={loading}
        >
          Accept Invitation
        </Button>
      </div>
    </div>
  );
};

export default AcceptPartyInvitationPage;
