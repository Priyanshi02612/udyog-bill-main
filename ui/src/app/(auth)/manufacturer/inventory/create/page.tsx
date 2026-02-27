"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  MdAdd,
  MdArrowBack,
  MdDeleteOutline,
  MdInfo,
  MdOutlineCheckCircle,
  MdOutlineInventory2,
} from "react-icons/md";

import { Dropdown } from "../../../../../components/ui/dropdown";
import { Input } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";
import { AuthContext } from "../../../../../context/auth.context";
import {
  formatCurrency,
  getNextDocumentNumber,
  getErrorMessage,
  parseNumericInput,
} from "../../../../../utils/helpers";
import {
  AuthContextType,
  Inventory,
  InventoryItem,
  Item,
} from "../../../../../utils/types";
import { GENERAL_PREFIX, LOT_PREFIX } from "../../../../../utils/constants";
import { ItemsService } from "../../../../../lib/api/items";
import { InventoryService } from "../../../../../lib/api/inventory";

type LotItemRow = {
  id: string;
  itemId: string;
  quantity: string;
  basePrice: number;
  currentStock?: number;
};

const rowInputClass =
  "h-10 w-full border-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400";

const createEmptyRow = (): LotItemRow => ({
  id: crypto.randomUUID(),
  itemId: "",
  quantity: "",
  basePrice: 0,
});

export default function InventoryLotFormPage() {
  const { user, authLoading } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();
  const searchParams = useSearchParams();

  const inventoryId = searchParams.get("id") || "";
  const isEditMode = Boolean(inventoryId);

  const [lotNumber, setLotNumber] = useState("");
  const [dateReceived, setDateReceived] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [inventoryItemRows, setInventoryItemRows] = useState<LotItemRow[]>([
    createEmptyRow(),
  ]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?._id) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const [itemsResponse, inventoryResponse] = await Promise.all([
        ItemsService.getUsersMasterItems(user._id),
        InventoryService.getUsersInventory(user._id, 1, 50),
      ]);

      setItems((itemsResponse.data as Item[]) || []);

      if (isEditMode) {
        const inventoryLot =
          await InventoryService.getInventoryDetails(inventoryId);

        setLotNumber(inventoryLot.lotNumber || "");
        setSelectedCollection(inventoryLot.collection || "");
        setDateReceived(
          inventoryLot.dateReceived
            ? new Date(inventoryLot.dateReceived).toISOString().split("T")[0]
            : "",
        );

        const items =
          inventoryLot.inventoryItems?.map((lineItem: InventoryItem) => ({
            id: crypto.randomUUID(),
            itemId: lineItem.itemId,
            quantity: String(lineItem.totalStock),
            basePrice: String(lineItem.basePrice ?? 0),
            currentStock: lineItem.currentStock,
          })) || [];

        setInventoryItemRows(items.length ? items : [createEmptyRow()]);
        return;
      }

      const currentLotNumbers = inventoryResponse.inventory.map(
        (lot: Inventory) => lot.lotNumber,
      );
      const nextLotNumber = getNextDocumentNumber(
        currentLotNumbers,
        LOT_PREFIX,
      );

      setLotNumber((prev) => (prev === nextLotNumber ? prev : nextLotNumber));
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to load inventory items");
    } finally {
      setIsLoading(false);
    }
  }, [user, isEditMode, inventoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      (sum, row) => sum + parseNumericInput(row.quantity) * row.basePrice,
      0,
    );

    return {
      uniqueItems,
      totalQuantity,
      averageCost: totalQuantity > 0 ? totalValue / totalQuantity : 0,
      totalValue,
    };
  }, [inventoryItemRows]);

  const updateRow = (id: string, key: keyof LotItemRow, value: string) => {
    setInventoryItemRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) {
          return row;
        }

        const nextRow = { ...row, [key]: value };

        if (key === "itemId") {
          const selectedItem = inventoryCatalog.find(
            (item) => item.id === value,
          );
          if (selectedItem && !row.basePrice) {
            nextRow.basePrice = selectedItem.defaultCost;
          }
        }

        return nextRow;
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

  const confirmLot = async () => {
    if (!user?._id) {
      toast.error("User not found");
      return;
    }

    if (!selectedCollection) {
      toast.error("Please select collection");
      return;
    }

    if (!dateReceived) {
      toast.error("Please select date of arrival");
      return;
    }

    const validInventoryItems = inventoryItemRows.filter(
      (row) => row.itemId && parseNumericInput(row.quantity) > 0,
    );

    if (!validInventoryItems.length) {
      toast.error("Add at least one valid line item");
      return;
    }

    if (
      new Set(validInventoryItems.map((row) => row.itemId)).size !==
      validInventoryItems.length
    ) {
      toast.error("Same item cannot be added multiple times");
      return;
    }

    const payload = {
      userId: user._id,
      lotNumber,
      collection: selectedCollection,
      dateReceived,
      itemsCount: validInventoryItems.length,
      totalStock: validInventoryItems.reduce(
        (sum, row) => sum + parseNumericInput(row.quantity),
        0,
      ),
      totalValue: validInventoryItems.reduce(
        (sum, row) => sum + parseNumericInput(row.quantity) * row.basePrice,
        0,
      ),
      inventoryItems: validInventoryItems.map((item) => ({
        itemId: item.itemId,
        totalStock: parseNumericInput(item.quantity),
        currentStock: isEditMode
          ? Math.min(
              item.currentStock ?? parseNumericInput(item.quantity),
              parseNumericInput(item.quantity),
            )
          : parseNumericInput(item.quantity),
      })),
    };

    try {
      setIsSaving(true);

      if (isEditMode) {
        await InventoryService.updateInventory(inventoryId, payload);
        toast.success("Inventory lot updated");
        router.replace(`/manufacturer/inventory/${inventoryId}`);
      } else {
        await InventoryService.createInventory(payload);
        toast.success("Inventory lot confirmed");
        router.replace("/manufacturer/inventory");
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error) ||
          `Failed to ${isEditMode ? "update" : "create"} inventory lot`,
      );
    } finally {
      setIsSaving(false);
    }
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
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="text-primary hover:text-primary/80"
          onClick={() => router.push("/manufacturer/inventory")}
        >
          <MdArrowBack className="h-5 w-5" />
        </button>

        <div className="mb-8 flex flex-col gap-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isEditMode ? "Update Inventory Lot" : "Create New Inventory Lot"}
          </h2>
          <p className="text-primary text-xs md:text-base">
            {isEditMode
              ? "Update lot details and line items."
              : "Register a new incoming shipment of raw materials or finished fabrics."}
          </p>
        </div>
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
                required
                options={collectionOptions}
                value={selectedCollection}
                onChange={(event) => setSelectedCollection(event.target.value)}
              />

              <Input
                label="Date of Arrival"
                required
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
                    <th className="px-6 py-4">
                      Item Name <span className="text-rose-500">*</span>
                    </th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Fabric Type</th>
                    <th className="px-6 py-4">
                      Qty <span className="text-rose-500">*</span>
                    </th>
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
                        <td className="px-6 py-2 text-sm text-slate-500">
                          ₹ {selectedItem?.defaultCost || 0}
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
              loading={isSaving}
            >
              {isEditMode ? "Update Lot" : "Save Lot"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
