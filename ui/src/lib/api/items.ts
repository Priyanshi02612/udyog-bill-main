import axios from "axios";
import { API_URL } from "./auth";

export class ItemsService {
  static async getUsersInventory(ownerId: string | undefined) {
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
}
