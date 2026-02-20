import axios from "axios";
import { API_URL } from "./auth";
import { Item } from "../../utils/types";

export class ItemsService {
  static async getUsersMasterItems(ownerId: string | undefined) {
    if (!ownerId) {
      return [];
    }

    try {
      const response = await axios.get(`${API_URL}/items?ownerId=${ownerId}`);

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error while fetching inventory:", error);
      throw error;
    }
  }

  static async getMasterItemById(itemId: string | undefined) {
    if (!itemId) {
      return [];
    }

    try {
      const response = await axios.get(`${API_URL}/items/${itemId}`);

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error while fetching item:", error);
      throw error;
    }
  }

  static async createMasterItem(data: Item) {
    try {
      const response = await axios.post(`${API_URL}/items`, data);

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error while creating item:", error);
      throw error;
    }
  }

  static async updateMasterItem(itemId: string, data: Item) {
    try {
      const response = await axios.patch(`${API_URL}/items/${itemId}`, data);

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error while updating item:", error);
      throw error;
    }
  }

  static async uploadToCloudinary(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary config missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
    );

    return response.data?.secure_url as string;
  }

  static async deleteMasterItem(itemId: string) {
    try {
      const response = await axios.delete(`${API_URL}/items/${itemId}`);

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error while deleting item:", error);
      throw error;
    }
  }
}
