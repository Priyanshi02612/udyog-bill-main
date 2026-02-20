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
}
