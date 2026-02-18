import axios from "axios";
import { API_URL } from "./auth";

export class ManufacturerService {
  static async addParty(payload: {
    manufacturerUserId: string;
    partyEmail: string;
  }) {
    try {
      const response = await axios.post(
        `${API_URL}/manufacturer/add-party`,
        payload,
      );

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error while adding party:", error);
      throw error;
    }
  }

  static async acceptInvitation(payload: {
    token: string;
    wholesalerUserId: string;
  }) {
    try {
      const response = await axios.post(
        `${API_URL}/manufacturer/accept-invitation`,
        payload,
      );

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error while accepting invitation:", error);
      throw error;
    }
  }
}
