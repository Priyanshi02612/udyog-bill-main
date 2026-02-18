"use client";

import Image from "next/image";
import AddEditTextileItemModal from "../../../../../components/admin/modal/add-item-modal";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MdArchitecture,
  MdArrowBack,
  MdDelete,
  MdDescription,
  MdEdit,
  MdPayments,
} from "react-icons/md";
import toast from "react-hot-toast";
import ConfirmModal from "../../../../../components/ui/modal";
import { ItemsService } from "../../../../../lib/api/items";
import { Item } from "../../../../../utils/types";

function SpecificationField({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string | number | undefined;
  subtitle?: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 flex-1">
      <p className="mb-1 text-sm font-medium tracking-wider text-slate-500">
        {label}
      </p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium tracking-wider text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

export default function ItemSpecificationDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<Item>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await ItemsService.getInventoryItemById(id as string);
        setItem(response.data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch item details. Please try again.");
      }
    };

    fetchItem();
  }, [id]);

  const handleDelete = () => {
    console.log("DELETE ITEM:", item?._id);

    // later: API call
    toast.success("Item deleted successfully");

    setDeleteOpen(false);
    // optional: redirect after delete
  };

  return (
    <div className="bg-background-light font-display text-slate-900 flex flex-col px-4 py-2 xl:px-40">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex-col md:flex-row flex md:items-center gap-3">
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="mt-1 text-primary hover:text-primary/80"
                onClick={() => router.back()}
              >
                <MdArrowBack className="h-6 w-6" />
              </button>
              <h1 className="text-4xl font-black tracking-tight">
                {item?.name}
              </h1>
            </div>

            <div className="flex gap-1">
              <Badge label={item?.category} variant="primary" showDot={false} />

              <div
                className={`size-2 rounded-full ${item?.isActive ? "bg-emerald-500" : "bg-red-400"}`}
                title="Active"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline-primary"
            size="sm"
            leadingIcon={<MdDelete className="w-5 h-5 text-primary" />}
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>

          <Button
            size="sm"
            leadingIcon={<MdEdit className="w-5 h-5 text-white" />}
            onClick={() => setOpen(true)}
          >
            Edit Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <MdArchitecture className="w-8 h-8 text-primary" />
              <h2 className="text-lg font-bold">Technical Specifications</h2>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              <SpecificationField
                label="Material Type"
                value={item?.materialType}
              />
              <SpecificationField
                label="Pattern"
                value={item?.designPattern || "Plain"}
              />

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Color
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="size-4 rounded-full border border-slate-200"
                    style={{ backgroundColor: item?.color }}
                  />
                  <p className="text-base font-semibold">{item?.color}</p>
                </div>
              </div>

              <SpecificationField label="Unit of Measure" value={item?.unit} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <MdPayments className="w-8 h-8 text-primary" />
              <h2 className="text-lg font-bold">Financial & Tax</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <MetricCard
                label="Base Price"
                value={`₹ ${item?.basePrice} /${item?.unit}`}
              />
              <MetricCard label="GST Rate" value={`${item?.gstPercentage}%`} />
              <MetricCard label="HSN Code" value={item?.hsnCode} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MdDescription className="w-8 h-8 text-primary" />
              <h2 className="text-lg font-bold">Description</h2>
            </div>

            <div className="text-sm leading-relaxed text-slate-600">
              <p className="mb-4">{item?.description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="bg-white border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <Image
              src={
                item?.imageUrl ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkfqPDkJIb-RIrB6SxyZlVO9fpc5hTfSy5hw&s"
              }
              alt="item-image"
              width={200}
              height={200}
              className="w-200 lg:w-125 h-75 object-cover"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 border-b border-slate-100 pb-2 text-sm font-bold uppercase tracking-widest">
              Quick Summary
            </h3>

            <div className="flex flex-row lg:flex-col 2xl:flex-row gap-5">
              <MetricCard
                label="Stock level"
                value="1240"
                subtitle="In Stock"
              />
              <MetricCard label="UOM" value={item?.unit} subtitle="Unit Type" />
            </div>
          </div>
        </div>
      </div>

      <AddEditTextileItemModal
        open={open}
        mode="edit"
        initialData={item}
        onClose={() => setOpen(false)}
      />

      <ConfirmModal
        open={deleteOpen}
        title="Delete Item"
        description={`Are you sure you want to delete "${item?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        icon={<MdDelete className="h-6 w-6 text-red-400" />}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
