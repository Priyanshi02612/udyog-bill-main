"use client";

import { UserRole } from "@/src/utils/constants";

type HelpCenterModalProps = {
  open: boolean;
  onClose: () => void;
  role: UserRole;
};

const quickStepsByRole: Record<UserRole, string[]> = {
  [UserRole.MANUFACTURER]: [
    "Complete business profile details in Profile Settings.",
    "Add master items in Items Inventory.",
    "Register inventory lots from Inventory Management.",
    "Create and send your first invoice.",
    "Track payment status from Invoice Register.",
  ],
  [UserRole.WHOLESALER]: [
    "Complete your business profile details in Profile Settings.",
    "Review incoming invoices in Invoice Register.",
    "Use filters to find pending and overdue invoices quickly.",
    "Mark sent invoices as paid once payment is settled.",
    "Download invoice PDFs for bookkeeping and reconciliation.",
  ],
};

export function HelpCenterModal({ open, onClose, role }: HelpCenterModalProps) {
  if (!open) return null;
  const steps = quickStepsByRole[role];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <h3 className="text-lg font-black text-slate-900">Help Center</h3>
          <p className="mt-1 text-sm text-slate-500">
            Quick guide to start using UdyogBill efficiently.
          </p>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Quick Start
            </h4>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              {steps.map((step, index) => (
                <li key={step}>
                  {index + 1}. {step}
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="flex items-center justify-end border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
