"use client";

import { InviteWholesalerModal } from "../../../../components/modal/invite-wholesaler-modal";
import PartyDrawer from "../../../../components/manufacturer/wholesaler-profile";
import Pagination from "../../../../components/pagination";
import { Button } from "../../../../components/ui/button";
import ConfirmModal from "../../../../components/ui/modal";
import { AuthContextType, UserProfile } from "../../../../utils/types";
import { formatCurrency, getErrorMessage } from "../../../../utils/helpers";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  MdAccountBalanceWallet,
  MdDelete,
  MdEventBusy,
  MdPersonAdd,
  MdVisibility,
} from "react-icons/md";
import toast from "react-hot-toast";
import { KpiCard } from "../../../../components/manufacturer/kpi-card";
import { ManufacturerService } from "../../../../lib/api/manufacturer";
import { AuthContext } from "../../../../context/auth.context";
import { Badge } from "@/src/components/ui/badge";

const PAGE_SIZE = 6;

const Wholesalers = () => {
  const [page, setPage] = useState(1);
  const [selectedParty, setSelectedParty] = useState<UserProfile | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [wholesalers, setWholesalers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { user } = useContext(AuthContext) as AuthContextType;

  useEffect(() => {
    if (!user) return;

    const fetchWholesalers = async () => {
      try {
        setLoading(true);
        const response = await ManufacturerService.getWholesalers(user._id);
        setWholesalers(response.data);
      } catch (error) {
        toast.error(getErrorMessage(error) || "Failed to fetch wholesalers");
      } finally {
        setLoading(false);
      }
    };

    fetchWholesalers();
  }, [user]);

  const stats = useMemo(() => {
    const totalOutstanding = wholesalers.reduce(
      (sum, w) => sum + (w.outstanding || 0),
      0,
    );

    const overdueCount = wholesalers.filter(
      (w) => (w.overdueInvoices || 0) > 0,
    ).length;

    return {
      totalOutstanding,
      overdueCount,
    };
  }, [wholesalers]);

  const totalPages = Math.ceil(wholesalers.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return wholesalers.slice(start, end);
  }, [safePage, wholesalers]);

  const handleRemoveParty = async () => {
    if (!user?._id || !selectedParty) return;

    const wholesalerUserId =
      selectedParty.userId ?? String(selectedParty.userId);

    try {
      await ManufacturerService.removeParty({
        manufacturerUserId: user._id,
        wholesalerUserId,
      });

      setWholesalers((prev) =>
        prev.filter((party) => {
          const partyUserId = party.userId ?? String(party.userId);
          return partyUserId !== wholesalerUserId;
        }),
      );

      toast.success("Party removed successfully");
      setDeleteModalOpen(false);
      setSelectedParty(null);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to remove party");
    }
  };

  const handleCancelInvitation = async () => {
    if (!user?._id || !selectedParty?.email) return;
    const partyEmail = selectedParty.email;

    try {
      await ManufacturerService.cancelInvitation({
        manufacturerUserId: user._id,
        partyEmail,
      });

      setWholesalers((prev) =>
        prev.filter((party) => party.email !== partyEmail),
      );

      toast.success("Invitation cancelled successfully");
      setCancelModalOpen(false);
      setSelectedParty(null);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to cancel invitation");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

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
        <KpiCard
          icon={<MdAccountBalanceWallet className="w-6 h-6 text-primary" />}
          label="Total Outstanding"
          value={formatCurrency(stats.totalOutstanding)}
          color="primary"
        />
        <KpiCard
          icon={<MdEventBusy className="w-6 h-6 text-danger" />}
          label="Overdue Payments"
          value={stats.overdueCount}
          color="red"
        />
      </div>

      <div className="min-h-105 md:min-h-125 xl:min-h-109.5">
        <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white ">
          <table className="w-full text-left text-xs xl:text-base">
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
              {paginatedItems.map((party, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-900 max-w-50 truncate">
                    <div className="flex gap-1">
                      <span>{party.businessName}</span>

                      {party.isPending && (
                        <Badge
                          label="Pending"
                          variant="warning"
                          showDot={false}
                        />
                      )}
                    </div>
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
                        party.outstanding === 0 && !party.isPending
                          ? "text-green-600"
                          : "text-slate-900"
                      }`}
                    >
                      {party.isPending
                        ? "-"
                        : formatCurrency(party.outstanding || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {party.isPending ? (
                      <button
                        type="button"
                        className="text-xs font-semibold text-danger hover:underline"
                        onClick={() => {
                          setSelectedParty(party);
                          setCancelModalOpen(true);
                        }}
                      >
                        Cancel invitation
                      </button>
                    ) : (
                      <div className="flex items-center gap-4">
                        <MdVisibility
                          className="w-5 h-5 text-slate-400 hover:text-primary cursor-pointer"
                          onClick={() => {
                            setSelectedParty(party);
                            setDrawerOpen(true);
                          }}
                        />

                        <MdDelete
                          className="w-5 h-5 text-slate-400 hover:text-danger cursor-pointer"
                          onClick={() => {
                            setSelectedParty(party);
                            setDeleteModalOpen(true);
                          }}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        totalItems={wholesalers.length}
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

      <InviteWholesalerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmModal
        open={deleteModalOpen}
        title="Remove Party"
        description="Are you sure you want to remove this party? This action cannot be undone."
        confirmText="Yes, Remove"
        icon={<MdDelete className="h-8 w-8 text-danger" />}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedParty(null);
        }}
        onConfirm={handleRemoveParty}
      />

      <ConfirmModal
        open={cancelModalOpen}
        title="Cancel Invitation"
        description="Do you want to cancel this pending invitation?"
        confirmText="Yes, Cancel"
        icon={<MdDelete className="h-8 w-8 text-danger" />}
        onCancel={() => {
          setCancelModalOpen(false);
          setSelectedParty(null);
        }}
        onConfirm={handleCancelInvitation}
      />
    </div>
  );
};

export default Wholesalers;
