"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  MdAdd,
  MdDeleteOutline,
  MdInfo,
  MdOutlineCheckCircle,
  MdOutlineInventory2,
} from "react-icons/md";

import { Dropdown } from "../../../../../components/ui/dropdown";
import { Input } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";
import { AuthContext } from "../../../../../context/auth.context";
import { mockInventories } from "../../../../../utils/data";
import {
  formatCurrency,
  getNextDocumentNumber,
  getErrorMessage,
  parseNumericInput,
} from "../../../../../utils/helpers";
import { AuthContextType, Item } from "../../../../../utils/types";
import { GENERAL_PREFIX, LOT_PREFIX } from "../../../../../utils/constants";
import { ItemsService } from "../../../../../lib/api/items";

type LotItemRow = {
  id: string;
  itemId: string;
  quantity: string;
  basePrice: string;
};

const rowInputClass =
  "h-10 w-full border-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400";

const createEmptyRow = (): LotItemRow => ({
  id: crypto.randomUUID(),
  itemId: "",
  quantity: "",
  basePrice: "",
});

export default function CreateInventoryLotPage() {
  const { user, authLoading } = useContext(AuthContext) as AuthContextType;

  const [lotNumber, setLotNumber] = useState("");
  const [dateReceived, setDateReceived] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [inventoryItemRows, setInventoryItemRows] = useState<LotItemRow[]>([
    createEmptyRow(),
  ]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await ItemsService.getUsersMasterItems(user._id);
      setItems((response.data as Item[]) || []);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to load inventory items");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    const currentLotNumbers = mockInventories.map((lot) => lot.lotNumber);
    const nextLotNumber = getNextDocumentNumber(currentLotNumbers, LOT_PREFIX);

    setLotNumber((prev) => (prev === nextLotNumber ? prev : nextLotNumber));
  }, []);

  const inventoryCatalog = useMemo(() => {
    return items
      .filter(
        (item) =>
          item._id &&
          (selectedCollection
            ? item.materialType === selectedCollection
            : true),
      )
      .map((item) => ({
        id: item._id ?? "",
        name: item.name,
        sku: `${item.category?.slice(0, 3) ?? GENERAL_PREFIX}-${item.hsnCode}`,
        fabricType: item.materialType ?? item.category,
        defaultCost: item.basePrice ?? 0,
      }));
  }, [selectedCollection, items]);

  const itemOptions = useMemo(
    () => [
      { label: "Select Item", value: "" },
      ...inventoryCatalog.map((item) => ({ label: item.name, value: item.id })),
    ],
    [inventoryCatalog],
  );

  const collectionOptions = useMemo(() => {
    const uniqueCollections = Array.from(
      new Set(
        items
          .map((item) => item.materialType?.trim())
          .filter((materialType): materialType is string => !!materialType),
      ),
    );

    return [
      { label: "Select Collection", value: "" },
      ...uniqueCollections.map((collection) => ({
        label: collection,
        value: collection,
      })),
    ];
  }, [items]);

  const summary = useMemo(() => {
    const filledRows = inventoryItemRows.filter((row) => row.itemId);

    const uniqueItems = new Set(filledRows.map((row) => row.itemId)).size;

    const totalQuantity = filledRows.reduce(
      (sum, row) => sum + parseNumericInput(row.quantity),
      0,
    );

    const totalValue = filledRows.reduce(
      (sum, row) =>
        sum +
        parseNumericInput(row.quantity) * parseNumericInput(row.basePrice),
      0,
    );

    const averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

    return {
      uniqueItems,
      totalQuantity,
      averageCost,
      totalValue,
    };
  }, [inventoryItemRows]);

  const updateRow = (id: string, key: keyof LotItemRow, value: string) => {
    setInventoryItemRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) {
          return row;
        }

        const updatedRow = { ...row, [key]: value };

        if (key === "itemId") {
          const selectedItem = inventoryCatalog.find(
            (item) => item.id === value,
          );

          if (selectedItem && !row.basePrice) {
            updatedRow.basePrice = String(selectedItem.defaultCost);
          }
        }

        return updatedRow;
      }),
    );
  };

  const removeRow = (id: string) => {
    setInventoryItemRows((prev) => {
      if (prev.length <= 1) {
        return prev;
      }

      return prev.filter((row) => row.id !== id);
    });
  };

  const addRow = () => {
    setInventoryItemRows((prev) => [...prev, createEmptyRow()]);
  };

  const confirmLot = () => {
    if (!dateReceived) {
      toast.error("Please select date of arrival");
      return;
    }

    if (!summary.uniqueItems || !summary.totalQuantity) {
      toast.error("Add at least one valid line item");
      return;
    }

    const inventoryItems = inventoryItemRows.map((item) => {
      return {
        itemId: item.itemId,
        totalStock: Number(item.quantity),
        currentStock: Number(item.quantity),
      };
    });

    const payload = {
      lotNumber,
      collection: selectedCollection,
      dateReceived,
      itemsCount: summary.uniqueItems,
      totalStock: summary.totalQuantity,
      totalValue: summary.totalValue,
      inventoryItems,
    };

    console.log(payload);

    setDateReceived("");
    setSelectedCollection("");
    setInventoryItemRows([createEmptyRow()]);

    toast.success("Inventory lot confirmed");
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-0 min-h-[calc(100vh-124px)] relative">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Create New Inventory Lot
        </h2>
        <p className="text-primary text-xs md:text-base">
          Register a new incoming shipment of raw materials or finished fabrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6 pb-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
              <div className="rounded-full bg-primary/10 p-1 text-primary">
                <MdInfo className="h-4 w-4" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                Lot Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label className="text-[#0d161b] text-sm font-semibold">
                  Lot Number
                </label>

                <div className="w-full rounded-lg border p-1.75 text-sm bg-slate-50 text-[#0d161b] border-[#cfdde7]">
                  {lotNumber}
                </div>
              </div>

              <Dropdown
                label="Select Collection"
                options={collectionOptions}
                value={selectedCollection}
                onChange={(event) => setSelectedCollection(event.target.value)}
              />

              <Input
                label="Date of Arrival"
                type="date"
                value={dateReceived}
                onChange={(event) => setDateReceived(event.target.value)}
                className="cursor-pointer"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
              <div className="rounded-full bg-primary/10 p-1 text-primary">
                <MdOutlineInventory2 className="h-4 w-4" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Line Items</h2>
            </div>

            <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
              <table className="min-w-225 w-full border-collapse">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Fabric Type</th>
                    <th className="px-6 py-4">Qty</th>
                    <th className="px-6 py-4">Base Price</th>
                    <th className="w-16 px-4 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {inventoryItemRows.map((row) => {
                    const selectedItem = inventoryCatalog.find(
                      (item) => item.id === row.itemId,
                    );

                    return (
                      <tr key={row.id} className="border-t border-slate-200">
                        <td className="px-6 py-2">
                          <Dropdown
                            options={itemOptions}
                            value={row.itemId}
                            onChange={(event) =>
                              updateRow(row.id, "itemId", event.target.value)
                            }
                            className="min-w-72.5"
                          />
                        </td>
                        <td className="px-6 py-2 text-sm font-medium text-slate-500">
                          {selectedItem?.sku || "SKU"}
                        </td>
                        <td className="px-6 py-2 text-sm text-slate-500">
                          {selectedItem?.fabricType || "Fabric"}
                        </td>
                        <td className="px-6 py-2">
                          <input
                            value={row.quantity}
                            onChange={(event) =>
                              updateRow(
                                row.id,
                                "quantity",
                                event.target.value.replace(/[^0-9.]/g, ""),
                              )
                            }
                            placeholder="0"
                            className={rowInputClass}
                          />
                        </td>
                        <td className="px-6 py-2">
                          <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                            <span className="pl-3 text-sm text-slate-400">
                              ₹
                            </span>
                            <input
                              value={row.basePrice}
                              onChange={(event) =>
                                updateRow(
                                  row.id,
                                  "basePrice",
                                  event.target.value.replace(/[^0-9.]/g, ""),
                                )
                              }
                              placeholder="0.00"
                              className={rowInputClass}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            className="text-slate-400 transition-colors hover:text-rose-500"
                            onClick={() => removeRow(row.id)}
                          >
                            <MdDeleteOutline className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-6">
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80"
              >
                <MdAdd className="h-5 w-5" />
                Add New Row
              </button>
            </div>
          </div>
        </div>

        <div className="h-max space-y-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-3xl font-bold text-slate-900">Lot Summary</h2>
          </div>

          <div className="space-y-4 px-6 py-6">
            <div className="flex items-center justify-between">
              <p className="text-slate-600">Unique Items</p>
              <p className="font-bold text-slate-900">
                {summary.uniqueItems} Items
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-slate-600">Total Quantity</p>
              <p className="font-bold text-slate-900">
                {summary.totalQuantity}
              </p>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <p className="text-slate-600">Avg Cost</p>
              <p className="font-bold text-slate-900">
                ₹{summary.averageCost.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-slate-500">Estimated Total Value</p>
              <p className="text-xl font-black tracking-tight text-primary">
                {formatCurrency(summary.totalValue)}
              </p>
            </div>

            <Button
              size="sm"
              onClick={confirmLot}
              className="w-full"
              leadingIcon={<MdOutlineCheckCircle className="h-5 w-5" />}
            >
              Save Lot
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
