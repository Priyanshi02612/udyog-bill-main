"use client";

import React, { useEffect, useState } from "react";
import { MdCall, MdClose, MdEmail, MdPersonAdd, MdStore } from "react-icons/md";
import { toast } from "react-hot-toast";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { EMAIL_REGEX, PHONE_REGEX } from "../../../utils/constants";

export type PartyForm = {
  businessName: string;
  email: string;
  phone: string;
};

type AddPartyModalProps = {
  open: boolean;
  onClose: () => void;
  initialData?: PartyForm | null;
};

export const AddPartyModal = ({
  open,
  onClose,
  initialData = null,
}: AddPartyModalProps) => {
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState<PartyForm>({
    businessName: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initialData ?? {
          businessName: "",
          email: "",
          phone: "",
        },
      );
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleChange = (key: keyof PartyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (!form.businessName || !form.email || !form.phone) {
      toast.error("Please fill all required fields");
      return false;
    }

    if (!EMAIL_REGEX.test(form.email)) {
      toast.error("Enter a valid email");
      return false;
    }

    if (!PHONE_REGEX.test(form.phone)) {
      toast.error("Enter a valid 10-digit phone number");
      return false;
    }

    return true;
  };

  const submitParty = async () => {
    console.log(isEdit ? "UPDATE" : "CREATE", form);
    return new Promise((resolve) => setTimeout(resolve, 1500));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await submitParty();

      toast.success(
        isEdit
          ? "Wholesaler updated successfully"
          : "Wholesaler added successfully",
      );
      onClose();
    } catch {
      toast.error(
        isEdit ? "Failed to update wholesaler" : "Failed to add wholesaler",
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
                {isEdit ? "Edit Wholesaler" : "Add New Wholesaler"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isEdit
                  ? "Update wholesaler details"
                  : "Add a new partner to your textile network"}
              </p>
            </div>
          </div>

          <Button
            variant="icon"
            size="sm"
            className="rounded-md bg-white hover:bg-white"
            leadingIcon={<MdClose className="w-7 h-7 text-primary" />}
            onClick={onClose}
          />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <Input
            label="Wholesaler Name"
            placeholder="e.g. Vardhman Textiles Ltd"
            leadingIcon={<MdStore />}
            value={form.businessName}
            onChange={(e) => handleChange("businessName", e.target.value)}
          />

          <Input
            label="Email Address"
            placeholder="contact@wholesaler.com"
            leadingIcon={<MdEmail />}
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <Input
            label="Phone Number"
            placeholder="9876543210"
            leadingIcon={<MdCall />}
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />

          <div className="pt-4 flex flex-col gap-3">
            <Button
              type="submit"
              size="sm"
              leadingIcon={!loading && <MdPersonAdd className="w-5 h-5" />}
              loading={loading}
            >
              {isEdit ? "Update Wholesaler" : "Add Wholesaler"}
            </Button>

            <Button type="button" variant="link" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
