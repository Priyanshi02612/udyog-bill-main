import axios from "axios";
import { API_URL } from "./auth";
import { CreateInventoryPayload } from "../../utils/types";

export class InventoryService {
  static async createInventory(data: CreateInventoryPayload) {
    try {
      const response = await axios.post(`${API_URL}/inventory`, data);

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error while creating inventory lot:", error);
      throw error;
    }
  }

  static async updateInventory(
    inventoryId: string,
    data: CreateInventoryPayload,
  ) {
    try {
      const response = await axios.put(
        `${API_URL}/inventory/${inventoryId}`,
        data,
      );

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error while updating inventory lot:", error);
      throw error;
    }
  }

  static async getUsersInventory(userId: string, page: number, limit: number) {
    try {
      const response = await axios.get(
        `${API_URL}/inventory/${userId}?page=${page}&limit=${limit}`,
      );

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Error while fetching inventory lots:", error);
      throw error;
    }
  }

  static async getInventoryDetails(inventoryId: string) {
    try {
      const response = await axios.get(
        `${API_URL}/inventory/details/${inventoryId}`,
      );

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Error while fetching inventory details:", error);
      throw error;
    }
  }

  static async deleteInventory(inventoryId: string) {
    try {
      const response = await axios.delete(
        `${API_URL}/inventory/${inventoryId}`,
      );

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Error while deleting inventory lot:", error);
      throw error;
    }
  }
}
