"use client";

import { AddPartyModal } from "../../../../components/admin/modal/add-party-modal";
import PartyDrawer from "../../../../components/admin/wholesaler-profile";
import Pagination from "../../../../components/pagination";
import { Button } from "../../../../components/ui/button";
import ConfirmModal from "../../../../components/ui/modal";
import { MOCK_WHOLESALERS } from "../../../../utils/data";
import { Party } from "../../../../utils/types";
import { formatCurrency } from "../../../../utils/helpers";
import { ReactNode, useMemo, useState } from "react";
import {
  MdAccountBalanceWallet,
  MdDelete,
  MdEventBusy,
  MdPersonAdd,
  MdStorefront,
  MdVisibility,
} from "react-icons/md";
import toast from "react-hot-toast";

const PAGE_SIZE = 5;

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  color: string;
}) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex gap-3 items-center">
    <span
      className={`size-10 flex items-center justify-center rounded-lg
          ${color === "primary" ? "bg-primary/10" : color === "blue" ? "bg-blue-100" : "bg-red-100"}
        `}
    >
      {icon}
    </span>
    <div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  </div>
);

const Wholesalers = () => {
  const [page, setPage] = useState(1);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const stats = useMemo(() => {
    const totalOutstanding = MOCK_WHOLESALERS.reduce(
      (sum, w) => sum + w.outstanding,
      0,
    );

    const overdueCount = MOCK_WHOLESALERS.filter(
      (w) => w.overdueInvoices > 0,
    ).length;

    return {
      totalOutstanding,
      activeParties: MOCK_WHOLESALERS.length,
      overdueCount,
    };
  }, []);

  const totalPages = Math.ceil(MOCK_WHOLESALERS.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return MOCK_WHOLESALERS.slice(start, end);
  }, [safePage]);

  const handleRemoveParty = () => {
    console.log("DELETED PARTY:", selectedParty);
    toast.success("Party removed successfully");

    setDeleteModalOpen(false);
  };

  return (
    <div className="p-8 pb-0 min-h-[calc(100vh-124px)] relative">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Wholesale Partners
          </h2>
          <p className="text-primary text-xs md:text-base">
            Centralized records of all wholesale partners.
          </p>
        </div>

        <Button
          size="sm"
          leadingIcon={<MdPersonAdd className="w-6 h-6" />}
          className="self-end w-[50%] md:w-max"
          onClick={() => setModalOpen(true)}
        >
          Add New Party
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<MdAccountBalanceWallet className="w-6 h-6 text-primary" />}
          label="Total Outstanding"
          value={formatCurrency(stats.totalOutstanding)}
          color="primary"
        />
        <StatCard
          icon={<MdStorefront className="w-6 h-6 text-blue-600" />}
          label="Active Parties"
          value={stats.activeParties}
          color="blue"
        />
        <StatCard
          icon={<MdEventBusy className="w-6 h-6 text-danger" />}
          label="Overdue Payments"
          value={stats.overdueCount}
          color="red"
        />
      </div>

      <div className="min-h-105 md:min-h-125 xl:min-h-109.5">
        <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white ">
          <table className="w-full text-left text-xs md:text-base">
            <thead className="bg-gray-100 text-primary">
              <tr className="font-bold uppercase">
                <th className="px-6 py-4">Business Name</th>
                <th className="px-6 py-4">GSTIN</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Total Outstanding</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {paginatedItems.map((party) => (
                <tr
                  key={party.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-slate-900 max-w-50 truncate">
                    {party.businessName}
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-28.75 truncate">
                    {party.gstin}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {party.contactPerson}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-medium ${
                        party.outstanding === 0
                          ? "text-green-600"
                          : "text-slate-900"
                      }`}
                    >
                      {formatCurrency(party.outstanding)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <MdVisibility
                        className="w-5 h-5 text-slate-400 hover:text-primary"
                        onClick={() => {
                          setSelectedParty(party);
                          setDrawerOpen(true);
                        }}
                      />

                      <MdDelete
                        className="w-5 h-5 text-slate-400 hover:text-danger"
                        onClick={() => {
                          setSelectedParty(party);
                          setDeleteModalOpen(true);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        totalItems={MOCK_WHOLESALERS.length}
        currentPage={safePage}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <PartyDrawer
        open={drawerOpen}
        party={selectedParty}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedParty(null);
        }}
      />

      <AddPartyModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <ConfirmModal
        open={deleteModalOpen}
        title="Remove Party"
        description="Are you sure you want to remove this party? This action cannot be undone."
        confirmText="Yes, Remove"
        icon={<MdDelete className="h-6 w-6 text-danger" />}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleRemoveParty}
      />
    </div>
  );
};

export default Wholesalers;
