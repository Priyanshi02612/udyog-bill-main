"use client";

import { ReactNode } from "react";
import { MdClose } from "react-icons/md";
import { Button } from "./button";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: ReactNode;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  icon,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex-1 flex items-center justify-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">{icon || null}</div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          </div>

          <MdClose
            className="h-6 w-6 text-slate-500 hover:text-slate-900 cursor-pointer"
            onClick={onCancel}
          />
        </div>

        <div className="px-5 py-4 text-center">
          <p className="text-sm text-slate-600">{description}</p>
        </div>

        <div className="flex justify-end gap-3 px-5 py-4">
          <Button size="sm" variant="outline-secondary" onClick={onCancel}>
            {cancelText}
          </Button>

          <Button size="sm" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
