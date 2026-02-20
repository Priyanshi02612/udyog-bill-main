"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MdArrowBack,
  MdInventory2,
  MdOutlineCheckCircle,
  MdWarningAmber,
} from "react-icons/md";
import { BsBoxSeamFill } from "react-icons/bs";

import { AuthContext } from "../../../../../context/auth.context";
import { KpiCard } from "../../../../../components/admin/kpi-card";
import {
  AuthContextType,
  Inventory,
  InventoryItem,
} from "../../../../../utils/types";
import {
  formatCurrency,
  formatDate,
  getErrorMessage,
} from "../../../../../utils/helpers";
import { InventoryService } from "../../../../../lib/api/inventory";
import toast from "react-hot-toast";

export default function InventoryLotDetailsPage() {
  const { authLoading } = useContext(AuthContext) as AuthContextType;
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [inventoryLot, setInventoryLot] = useState<Inventory>();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchInventoryDetails = async () => {
      try {
        setIsLoading(true);

        const response = await InventoryService.getInventoryDetails(id);
        setInventoryLot(response);
        setInventoryItems(response.inventoryItems);
      } catch (error) {
        toast.error(
          getErrorMessage(error) || "Error while fetching lot details",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventoryDetails();
  }, [id]);

  const metrics = useMemo(() => {
    const totalReceivedStock = inventoryItems.reduce(
      (sum, row) => sum + row.totalStock,
      0,
    );
    const currentStock = inventoryItems.reduce(
      (sum, row) => sum + row.currentStock,
      0,
    );
    const consumedStock = totalReceivedStock - currentStock;
    const totalCurrentValue = inventoryItems.reduce(
      (sum, row) => sum + (row.currentValue ?? 0),
      0,
    );
    const lowStockItems = inventoryItems.filter(
      (row) => row.totalStock > 0 && row.currentStock / row.totalStock <= 0.2,
    ).length;
    const outOfStockItems = inventoryItems.filter(
      (row) => row.currentStock === 0,
    ).length;

    return {
      totalReceivedStock,
      currentStock,
      consumedStock,
      totalCurrentValue,
      lowStockItems,
      outOfStockItems,
    };
  }, [inventoryItems]);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  function renderButtonBack() {
    return (
      <button
        type="button"
        className="text-primary hover:text-primary/80"
        onClick={() => router.push("/manufacturer/inventory")}
      >
        <MdArrowBack className="h-5 w-5" />
      </button>
    );
  }

  if (!inventoryLot) {
    return (
      <div className="min-h-[calc(100vh-124px)] p-8">
        <div className="flex items-start gap-3 mt-4 rounded-2xl border border-slate-200 bg-white p-8">
          {renderButtonBack()}

          <div className="">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Lot not found
            </h2>
            <p className="mt-2 text-slate-500">
              The requested lot does not exist in current inventory data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-0 min-h-[calc(100vh-124px)] relative">
      <div className="flex items-start gap-3">
        {renderButtonBack()}

        <div className="mb-8 flex flex-col gap-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {inventoryLot.lotNumber}
          </h2>
          <p className="text-primary text-xs md:text-base">
            {inventoryLot.collection} | Received on{" "}
            {formatDate(inventoryLot.dateReceived)}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <KpiCard
          icon={<BsBoxSeamFill className="w-6 h-6 text-primary" />}
          label="Items in Lot"
          value={inventoryLot.itemsCount}
          color="primary"
        />
        <KpiCard
          icon={<MdInventory2 className="w-6 h-6 text-blue-500" />}
          label="Received Stock"
          value={metrics.totalReceivedStock}
          color="blue"
        />
        <KpiCard
          icon={<MdInventory2 className="w-6 h-6 text-emerald-500" />}
          label="Current Stock"
          value={metrics.currentStock}
          color="emerald"
        />
        <KpiCard
          icon={<MdInventory2 className="w-6 h-6 text-amber-500" />}
          label="Consumed Stock"
          value={metrics.consumedStock}
          color="amber"
        />
        <KpiCard
          icon={<MdWarningAmber className="w-6 h-6 text-amber-500" />}
          label="Low Stock Items"
          value={metrics.lowStockItems}
          color="amber"
        />
        <KpiCard
          icon={<MdOutlineCheckCircle className="w-6 h-6 text-primary" />}
          label="Current Value"
          value={formatCurrency(metrics.totalCurrentValue)}
          color="primary"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-245 w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-4">Item</th>
              <th className="px-6 py-4">HSN / Unit</th>
              <th className="px-6 py-4">Received</th>
              <th className="px-6 py-4">Current</th>
              <th className="px-6 py-4">Consumed</th>
              <th className="px-6 py-4">Stock Health</th>
              <th className="px-6 py-4">Current Value</th>
            </tr>
          </thead>
          <tbody>
            {inventoryItems.map((inventoryItem, index) => {
              const healthPercent = Math.max(
                0,
                Math.min(
                  Math.round((inventoryItem.stockRatio ?? 0) * 100),
                  100,
                ),
              );
              const lowStock =
                inventoryItem.totalStock > 0 &&
                (inventoryItem.stockRatio ?? 0) <= 0.2;
              const outOfStock = inventoryItem.currentStock === 0;

              return (
                <tr key={index} className="border-b border-slate-200">
                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-900">
                      {inventoryItem.itemName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {inventoryItem.itemCategory}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-slate-600">
                    <p>HSN: {inventoryItem.hsnCode}</p>
                    <p className="text-xs text-slate-500">
                      {inventoryItem.unit}
                    </p>
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-900">
                    {inventoryItem.totalStock}
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-900">
                    {inventoryItem.currentStock}
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-900">
                    {inventoryItem.consumedStock}
                  </td>
                  <td className="px-6 py-5">
                    <div className="mb-2 h-2.5 w-full rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          outOfStock
                            ? "bg-rose-500"
                            : lowStock
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        }`}
                        style={{ width: `${healthPercent}%` }}
                      />
                    </div>
                    <p
                      className={`text-xs font-semibold ${
                        outOfStock
                          ? "text-rose-600"
                          : lowStock
                            ? "text-amber-600"
                            : "text-emerald-600"
                      }`}
                    >
                      {outOfStock
                        ? "Out of stock"
                        : lowStock
                          ? "Low stock"
                          : "Healthy stock"}{" "}
                      ({healthPercent}%)
                    </p>
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-900">
                    {formatCurrency(inventoryItem.currentValue ?? 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {metrics.outOfStockItems > 0 ? (
        <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {metrics.outOfStockItems} item(s) in this lot are currently out of
          stock.
        </div>
      ) : null}
    </div>
  );
}
