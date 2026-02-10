import { AddItemFormState } from "./types";

export enum UserRole {
  MANUFACTURER = "manufacturer",
  WHOLESALER = "wholesaler",
  RETAILER = "retailer",
}

export enum ItemCategory {
  FABRIC = "Fabric",
  MATERIAL = "Material",
  THREAD = "Thread",
}

export const itemCategoryOptions = [
  { label: "Select Item Category", value: "" },
  { label: "Fabric", value: "Fabric" },
  { label: "Material", value: "Material" },
  { label: "Thread", value: "Thread" },
];

export const DEFAULT_FORM: AddItemFormState = {
  name: "",
  imageUrl: "",
  image: null,
  imagePreview: "",
  category: "",
  description: "",
  basePrice: "",
  unit: "",
  gstPercentage: "",
  hsnCode: "",
  color: "",
  materialType: "",
  designPattern: "",
  isActive: true,
};
