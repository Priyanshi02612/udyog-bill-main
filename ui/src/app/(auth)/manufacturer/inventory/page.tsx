"use client";

import { useContext, useMemo, useState } from "react";
import {
  MdAdd,
  MdInventory2,
  MdOutlineSearch,
  MdWarningAmber,
} from "react-icons/md";

import { AuthContext } from "../../../../context/auth.context";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { KpiCard } from "../../../../components/admin/kpi-card";
import { formatCurrency, formatDate } from "../../../../utils/helpers";
import { mockInventories } from "../../../../utils/data";
import { AuthContextType } from "../../../../utils/types";
import { BsBoxSeamFill } from "react-icons/bs";
import { useRouter } from "next/navigation";

export default function InventoryPage() {
  const { authLoading } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLots = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return mockInventories.filter((lot) => {
      const matchesSearch =
        !query ||
        lot.id.toLowerCase().includes(query) ||
        lot.lotNumber.toLowerCase().includes(query) ||
        lot.collection.toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [searchQuery]);

  const kpiMetrics = useMemo(() => {
    const totalLots = mockInventories.length;
    const totalItems = mockInventories.reduce(
      (sum, lot) => sum + lot.itemsCount,
      0,
    );
    const totalStock = mockInventories.reduce(
      (sum, lot) => sum + lot.totalStock,
      0,
    );
    const totalValue = mockInventories.reduce(
      (sum, lot) => sum + lot.totalValue,
      0,
    );
    const lowStockLots = mockInventories.filter((lot) =>
      lot.inventoryItems.some(
        (inventoryItem) =>
          inventoryItem.totalStock > 0 &&
          inventoryItem.currentStock / inventoryItem.totalStock <= 0.2,
      ),
    ).length;

    return {
      totalLots,
      totalItems,
      totalStock,
      totalValue,
      lowStockLots,
    };
  }, []);

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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
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

        <KpiCard
          icon={<MdWarningAmber className="w-6 h-6 text-amber-500" />}
          label="Low Stock Lots"
          value={kpiMetrics.lowStockLots}
          color="amber"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-245 w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-4">Lot ID / Collection</th>
              <th className="px-6 py-4">Item Count</th>
              <th className="px-6 py-4">Total Stock</th>
              <th className="px-6 py-4">Valuation</th>
              <th className="px-6 py-4">Date Received</th>
            </tr>
          </thead>
          <tbody>
            {filteredLots.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center text-slate-500"
                >
                  No lots matched this view.
                </td>
              </tr>
            )}

            {filteredLots.map((lot) => (
              <tr
                key={lot.id}
                className="border-b border-slate-200 transition-colors hover:bg-slate-50 cursor-pointer"
                onClick={() => router.push(`/manufacturer/inventory/${lot.id}`)}
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
                  {formatCurrency(lot.totalValue)}
                </td>
                <td className="px-6 py-5 text-slate-600">
                  {formatDate(lot.dateReceived)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
