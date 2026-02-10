"use client";

import { Fragment, useState } from "react";
import { MdCall, MdClose, MdEdit, MdEmail, MdVerified } from "react-icons/md";
import { Button } from "../ui/button";
import Avatar from "react-avatar";
import { Party } from "@/src/utils/types";
import { formatCurrency } from "@/src/utils/helpers";
import { AddPartyModal } from "./modal/add-party-modal";

interface PartyDrawerProps {
  open: boolean;
  onClose: () => void;
  party: Party | null;
}

const PartyDrawer = ({ open, onClose, party }: PartyDrawerProps) => {
  const [openEditModal, setOpenEditModal] = useState(false);

  if (!open || !party) return null;

  return (
    <Fragment>
      <div
        onClick={onClose}
        className={`
          fixed inset-0 bg-black/30 z-40
          transition-opacity duration-300 ease-in-out
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      />

      <div
        className="animate-slideIn fixed z-50 bg-white shadow-2xl
          inset-x-0 bottom-0 h-[90vh]
          sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full
          w-full sm:w-md md:w-lg
          border-t sm:border-t-0 sm:border-l border-slate-200"
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex justify-start items-center mb-2">
            <Button
              variant="icon"
              size="sm"
              className="rounded-md bg-white hover:bg-white"
              leadingIcon={<MdClose className="w-7 h-7 text-primary" />}
              onClick={onClose}
            />
          </div>

          <div className="flex flex-col items-center text-center gap-2">
            <Avatar
              name="Radhe Krishna Silks"
              size="100"
              color="#8b5a2b1a"
              fgColor="#8b5a2b"
              className="rounded-lg flex items-center justify-center text-3xl font-black"
            />

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {party.businessName}
            </h3>

            <p className="mt-2 px-3 py-1 bg-blue-100 rounded-full text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1.5">
              <MdVerified className="w-5 h-5" />
              GST: {party.gstin}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Key Contact
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-sm font-bold text-slate-900">
                {party.contactPerson}
              </p>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <MdCall className="w-5 h-5" />
                {`+91 ${party.phone}`}
              </p>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <MdEmail className="w-5 h-5" />
                {party.email}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Recent Invoices
              </h4>
              <a
                className="text-xs font-bold text-primary hover:underline"
                href="#"
              >
                View All
              </a>
            </div>
            <div className="space-y-3">
              {party.invoices && party.invoices.length > 0 ? (
                party.invoices.map((invoice, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 cursor-pointer rounded-xl border border-slate-100 bg-white hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-danger" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {invoice.invoiceDate} •{" "}
                          <span className="text-danger font-bold uppercase">
                            Overdue
                          </span>
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-sm font-semibold text-slate-600">
                    No invoices found
                  </p>
                  <p className="text-xs text-slate-400 mt-1 text-center">
                    Invoices for this party will appear here once created
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-self-end">
            <Button
              size="sm"
              leadingIcon={<MdEdit />}
              onClick={() => setOpenEditModal(true)}
            >
              Edit Party
            </Button>
          </div>
        </div>
      </div>

      <AddPartyModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        initialData={party}
      />
    </Fragment>
  );
};

export default PartyDrawer;
