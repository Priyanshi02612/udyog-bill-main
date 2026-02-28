"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { MdAdd, MdInventory2, MdOutlineSearch } from "react-icons/md";

import { AuthContext } from "../../../../context/auth.context";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { KpiCard } from "../../../../components/manufacturer/kpi-card";
import Pagination from "../../../../components/pagination";
import {
  formatCurrency,
  formatDate,
  getErrorMessage,
} from "../../../../utils/helpers";
import { AuthContextType, Inventory } from "../../../../utils/types";
import { InventoryService } from "../../../../lib/api/inventory";
import { BsBoxSeamFill } from "react-icons/bs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const PAGE_SIZE = 5;

export default function InventoryPage() {
  const { user, authLoading } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [totalLots, setTotalLots] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const totalPages = useMemo(
    () => Math.ceil(totalLots / PAGE_SIZE),
    [totalLots],
  );
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    const fetchInventoryLots = async () => {
      try {
        setIsLoading(true);
        const response = await InventoryService.getUsersInventory(
          user._id,
          page,
          PAGE_SIZE,
        );
        setInventories(response.inventory);
        setTotalLots(response.totalInventory);
      } catch (error) {
        toast.error(getErrorMessage(error) || "Error while fetching inventory");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventoryLots();
  }, [user, page]);

  const filteredLots = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return inventories.filter((lot: Inventory) => {
      const matchesSearch =
        !query ||
        lot.lotNumber.toLowerCase().includes(query) ||
        lot.collection.toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [searchQuery, inventories]);

  const kpiMetrics = useMemo(() => {
    const totalItems = inventories.reduce(
      (sum, lot) => sum + lot.itemsCount,
      0,
    );
    const totalStock = inventories.reduce(
      (sum, lot) => sum + lot.totalStock,
      0,
    );
    const totalValue = inventories.reduce(
      (sum, lot) => sum + lot.totalValue,
      0,
    );

    return {
      totalLots,
      totalItems,
      totalStock,
      totalValue,
    };
  }, [totalLots, inventories]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-0 min-h-[calc(100vh-124px)] relative">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Inventory Management
          </h2>
          <p className="text-primary text-xs md:text-base">
            List of inventory lots.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search Lot ID or collection..."
            leadingIcon={<MdOutlineSearch className="h-5 w-5" />}
          />

          <Button
            size="sm"
            leadingIcon={<MdAdd className="h-5 w-5" />}
            onClick={() => router.replace("/manufacturer/inventory/create")}
          >
            Add New Lot
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={<BsBoxSeamFill className="w-6 h-6 text-primary" />}
          label="Total Lots"
          value={kpiMetrics.totalLots}
          color="primary"
        />

        <KpiCard
          icon={<MdInventory2 className="w-6 h-6 text-emerald-500" />}
          label="Total Items"
          value={kpiMetrics.totalItems}
          color="emerald"
        />

        <KpiCard
          icon={<MdInventory2 className="w-6 h-6 text-blue-500" />}
          label="Total Stock Units"
          value={kpiMetrics.totalStock}
          color="blue"
        />

        <KpiCard
          icon={<MdInventory2 className="w-6 h-6 text-primary" />}
          label="Inventory Value"
          value={formatCurrency(kpiMetrics.totalValue)}
          color="primary"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-245 w-full text-left text-xs xl:text-base">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-4">Lot ID / Collection</th>
              <th className="px-6 py-4">Item Count</th>
              <th className="px-6 py-4">Total Stock</th>
              <th className="px-6 py-4">Current Stock</th>
              <th className="px-6 py-4">Valuation</th>
              <th className="px-6 py-4">Date Received</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center text-slate-500"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
                  </div>
                </td>
              </tr>
            ) : filteredLots.length > 0 ? (
              filteredLots.map((lot: Inventory, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-200 transition-colors hover:bg-slate-50 cursor-pointer"
                  onClick={() =>
                    router.push(`/manufacturer/inventory/${lot._id}`)
                  }
                >
                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-900">
                      {lot.lotNumber}
                    </p>
                    <p className="text-xs text-slate-500">{lot.collection}</p>
                  </td>

                  <td className="px-6 py-5 font-semibold text-slate-900">
                    {lot.itemsCount} items
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-900">
                    {lot.totalStock}
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-900">
                    {lot.currentStock}
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-900">
                    {formatCurrency(lot.totalValue)}
                  </td>
                  <td className="px-6 py-5 text-slate-600">
                    {formatDate(lot.dateReceived)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center text-slate-500"
                >
                  No lots matched this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={totalLots}
        currentPage={safePage}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
