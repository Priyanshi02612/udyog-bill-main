"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MdAdd, MdTexture } from "react-icons/md";
import { GiRolledCloth } from "react-icons/gi";
import { RiShapesFill } from "react-icons/ri";
import Link from "next/link";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import Pagination from "../../../../components/pagination";
import AddEditTextileItemModal from "../../../../components/admin/modal/add-item-modal";
import { initialItems } from "../../../../utils/data";
import { AuthContextType, Item, ItemCategory } from "../../../../utils/types";
import { getErrorMessage } from "../../../../utils/helpers";
import { ItemsService } from "../../../../lib/api/items";
import toast from "react-hot-toast";
import { AuthContext } from "../../../../context/auth.context";

const filters = [
  {
    label: "FABRIC",
    value: "Fabric",
    icon: <GiRolledCloth className="w-4 h-4" />,
  },
  {
    label: "THREAD",
    value: "Thread",
    icon: <MdTexture className="w-4 h-4" />,
  },
  {
    label: "MATERIAL",
    value: "Material",
    icon: <RiShapesFill className="w-4 h-4" />,
  },
];

export default function ManufacturerInventoryPage() {
  const { user, authLoading } = useContext(AuthContext) as AuthContextType;
  const [items, setItems] = useState<Item[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [activeItemCategory, setActiveItemCategory] = useState<
    ItemCategory | "All"
  >("All");
  const [open, setOpen] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 7;

  const handleAddItem = () => {
    setOpen(true);
  };

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await ItemsService.getUsersInventory(user._id);
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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const categoryMatch =
        activeItemCategory === "All" || item.category === activeItemCategory;

      return categoryMatch;
    });
  }, [items, activeItemCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return filteredItems.slice(start, end);
  }, [filteredItems, safePage, pageSize]);

  if (authLoading || isLoading) {
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
          <h1 className="text-3xl font-black">Items Inventory</h1>
          <p className="text-primary text-xs md:text-base">
            Manage and track your textile stocks
          </p>
        </div>

        <Button
          size="sm"
          leadingIcon={<MdAdd className="w-6 h-6" />}
          onClick={handleAddItem}
          className="self-end w-[50%] md:w-max"
        >
          Add New Item
        </Button>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap items-center text-xs md:text-base">
        <button
          onClick={() => setActiveItemCategory("All")}
          className={`inline-flex items-center rounded-full px-4 py-2 text-sm ${
            activeItemCategory === "All"
              ? "bg-primary text-white"
              : "bg-white text-primary"
          }`}
        >
          All Items
        </button>

        {filters.map((filter) => (
          <button
            key={filter.label}
            onClick={() => setActiveItemCategory(filter.value as ItemCategory)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
              activeItemCategory === filter.value
                ? "bg-primary text-white"
                : "bg-white text-primary"
            }`}
          >
            {filter.icon}
            <span className="font-medium">{filter.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-132.5 md:min-h-125 xl:min-h-118.5">
        <div
          className="overflow-hidden overflow-x-scroll xl:overflow-auto rounded-xl border border-gray-300 bg-white"
          style={{ scrollbarWidth: "thin" }}
        >
          <table className="w-full text-left text-xs xl:text-base">
            <thead className="bg-gray-100 text-primary">
              <tr>
                {[
                  "Item Name",
                  "Item Category",
                  "HSN",
                  "Price",
                  "GST",
                  "Status",
                ].map((h) => (
                  <th key={h} className="px-6 py-4 text-sm font-bold uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    No items found
                  </td>
                </tr>
              )}

              {paginatedItems.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 border-t border-gray-200"
                >
                  <td className="px-6 py-4 xl:min-w-79 max-w-30 truncate">
                    <Link href={`/manufacturer/items/${item._id}`}>
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{item.category}</td>
                  <td className="px-6 py-4">{item.hsnCode}</td>
                  <td className="px-6 py-4">
                    ₹{item.basePrice} /{item.unit}
                  </td>
                  <td className="px-6 py-4">{item.gstPercentage}%</td>
                  <td className="px-6 py-4">
                    <Badge
                      label={item.isActive ? "Active" : "inactive"}
                      variant={item.isActive ? "success" : "danger"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        totalItems={filteredItems.length}
        currentPage={safePage}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      <AddEditTextileItemModal
        open={open}
        mode="add"
        onClose={() => setOpen(false)}
        onSuccess={fetchItems}
      />
    </div>
  );
}
