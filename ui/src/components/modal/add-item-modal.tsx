"use client";

import React, { useContext, useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import toast from "react-hot-toast";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dropdown } from "../ui/dropdown";
import { ColorPickerField } from "../ui/color-picker";
import { ImageUploader } from "../ui/image-uploader";
import {
  Errors,
  AddEditTextileItemModalProps,
  Item,
  AuthContextType,
} from "../../utils/types";
import { getErrorMessage } from "../../utils/helpers";
import { DEFAULT_FORM, itemCategoryOptions } from "../../utils/constants";
import { AuthContext } from "../../context/auth.context";
import { ItemsService } from "../../lib/api/items";

export default function AddEditTextileItemModal({
  open,
  onClose,
  mode,
  initialData,
  onSuccess,
}: AddEditTextileItemModalProps) {
  const [itemDetails, setItemDetails] = useState<Item>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useContext(AuthContext) as AuthContextType;

  useEffect(() => {
    const initializeForm = () => {
      if (mode === "edit" && initialData) {
        setItemDetails({
          ...initialData,
          imagePreview: initialData.imageUrl || "",
        });
      } else {
        setItemDetails(DEFAULT_FORM);
      }
    };

    initializeForm();
  }, [mode, initialData]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    setItemDetails((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validate = (): boolean => {
    const errors: Errors = {};

    if (!itemDetails.name.trim()) errors.name = "Item name is required";
    if (!itemDetails.category) errors.category = "Category is required";
    if (!itemDetails.unit.trim()) errors.unit = "Unit is required";

    if (!itemDetails.basePrice || Number(itemDetails.basePrice) < 0)
      errors.basePrice = "Base price must be 0 or more";

    if (
      !itemDetails.gstPercentage ||
      Number(itemDetails.gstPercentage) < 0 ||
      Number(itemDetails.gstPercentage) > 100
    )
      errors.gstPercentage = "GST must be between 0-100";

    if (!itemDetails.hsnCode) errors.hsnCode = "HSN code is required";

    const firstError = Object.values(errors)[0];
    if (firstError) {
      toast.error(firstError);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      const uploadedImageUrl = itemDetails.image
        ? await ItemsService.uploadToCloudinary(itemDetails.image)
        : itemDetails.imageUrl;

      const payload = {
        ...itemDetails,
        imageUrl: uploadedImageUrl || "",
        basePrice: Number(itemDetails.basePrice),
        gstPercentage: Number(itemDetails.gstPercentage),
        hsnCode: Number(itemDetails.hsnCode),
        ownerId: (user?._id as string) || itemDetails.ownerId,
      };

      delete payload.image;
      delete payload.imagePreview;

      if (mode === "add") {
        await ItemsService.createMasterItem(payload);
        toast.success("Item created successfully");
      } else {
        if (!itemDetails._id) {
          toast.error("Item id is missing");
          return;
        }
        await ItemsService.updateMasterItem(itemDetails._id, payload);
        toast.success("Item updated successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        getErrorMessage(error) || "An error occurred while saving the item",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl"
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">
              {mode === "add" ? "Add Textile Item" : "Edit Textile Item"}
            </h2>
            <p className="text-sm text-slate-500">
              {mode === "add"
                ? "Create a new textile item"
                : "Update textile item details"}
            </p>
          </div>

          <Button
            onClick={onClose}
            variant="icon"
            leadingIcon={
              <MdClose className="w-7 h-7 text-primary hover:text-white" />
            }
            className="bg-white"
          ></Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 pt-0">
          <div className="rounded-xl border border-slate-200">
            <div className="border-b border-slate-200 px-5 py-3">
              <h3 className="font-semibold text-slate-900">
                Basic Information
              </h3>
            </div>

            <div className="p-5">
              <ImageUploader
                preview={itemDetails.imagePreview}
                onChange={(file, preview) =>
                  setItemDetails((prev) => ({
                    ...prev,
                    image: file,
                    imagePreview: preview,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
              <div>
                <Input
                  name="name"
                  label="Item Name"
                  placeholder="Item Name"
                  value={itemDetails.name}
                  onChange={handleChange}
                />
              </div>

              <Dropdown
                options={itemCategoryOptions}
                label="Item Category"
                value={itemDetails.category}
                onChange={(e) =>
                  setItemDetails((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              />
            </div>

            <div className="p-5 pt-0 flex flex-col gap-2">
              <label className="text-[#0d161b] text-sm font-semibold leading-normal">
                Description
              </label>

              <textarea
                name="description"
                value={itemDetails.description}
                onChange={handleChange}
                placeholder="Description"
                rows={3}
                className="w-full rounded-lg bg-slate-50 text-[#0d161b] border border-[#cfdde7] placeholder:text-[#4c799a]/60 p-3 text-sm focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200">
            <div className="border-b border-slate-200 px-5 py-3">
              <h3 className="font-semibold text-slate-900">
                Technical Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
              <Input
                name="materialType"
                label="Material Type"
                placeholder="Material Type"
                value={itemDetails.materialType}
                onChange={handleChange}
              />

              <ColorPickerField
                label="Color"
                value={itemDetails.color}
                onChange={(color) =>
                  setItemDetails((prev) => ({ ...prev, color }))
                }
              />

              <Input
                name="designPattern"
                label="Design Pattern"
                placeholder="Design Pattern"
                value={itemDetails.designPattern}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200">
            <div className="border-b border-slate-200 px-5 py-3">
              <h3 className="font-semibold text-slate-900">
                Units & Compliance
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
              <Input
                name="unit"
                label="Unit"
                placeholder="Unit"
                value={itemDetails.unit}
                onChange={handleChange}
              />
              <Input
                name="gstPercentage"
                label="GST %"
                placeholder="GST %"
                type="number"
                value={itemDetails.gstPercentage}
                onChange={handleChange}
              />

              <Input
                name="hsnCode"
                label="HSN Code"
                placeholder="HSN Code"
                type="number"
                value={itemDetails.hsnCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200">
            <div className="border-b border-slate-200 px-5 py-3">
              <h3 className="font-semibold text-slate-900">Pricing & Status</h3>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-6 p-5">
              <div className="flex-1">
                <Input
                  name="basePrice"
                  label="Base Price"
                  placeholder="Base Price"
                  type="number"
                  value={itemDetails.basePrice}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Is Active</p>
                  <p className="text-xs text-slate-500">Available for orders</p>
                </div>

                <label className="inline-flex relative items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    className="sr-only peer"
                    checked={itemDetails.isActive}
                    onChange={handleChange}
                  />
                  <div
                    className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full
                    peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white
                    after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                  ></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              {mode === "add" ? "Save Item" : "Update Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
