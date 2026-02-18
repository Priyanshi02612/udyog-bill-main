"use client";

import React, { useContext, useState } from "react";
import { MdClose, MdEmail, MdPersonAdd, MdSend } from "react-icons/md";
import { toast } from "react-hot-toast";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { EMAIL_REGEX } from "../../../utils/constants";
import { AuthContextType } from "../../../utils/types";
import { getErrorMessage } from "../../../utils/helpers";
import { AuthContext } from "../../../context/auth.context";
import { ManufacturerService } from "../../../lib/api/manufacturer";

type InviteWholesalerModalProps = {
  open: boolean;
  onClose: () => void;
};

export const InviteWholesalerModal = ({
  open,
  onClose,
}: InviteWholesalerModalProps) => {
  const { user } = useContext(AuthContext) as AuthContextType;

  const [email, setEmail] = useState<string>("");

  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const validate = () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!EMAIL_REGEX.test(email)) {
      toast.error("Enter a valid email");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("User session not found. Please login again.");
      return;
    }

    if (!validate()) return;

    try {
      setLoading(true);

      await ManufacturerService.addParty({
        manufacturerUserId: user._id as string,
        partyEmail: email.trim().toLowerCase(),
      });

      toast.success("Invitation sent successfully");
      setEmail("");
      onClose();
    } catch (error) {
      toast.error(
        getErrorMessage(error) || "An error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <MdPersonAdd className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Add Wholesaler
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Invite a wholesaler to collaborate on your inventory.
              </p>
            </div>
          </div>

          <Button
            variant="icon"
            size="sm"
            className="rounded-md bg-white hover:bg-white"
            leadingIcon={<MdClose className="w-7 h-7 text-primary" />}
            onClick={() => {
              onClose();
              setEmail("");
            }}
          />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <Input
            label="Email Address"
            placeholder="contact@wholesaler.com"
            leadingIcon={<MdEmail />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="pt-4 flex flex-col gap-3">
            <Button
              type="submit"
              size="sm"
              trailingIcon={!loading && <MdSend className="w-5 h-5" />}
              loading={loading}
            >
              Invite Wholesaler
            </Button>

            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => {
                onClose();
                setEmail("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
