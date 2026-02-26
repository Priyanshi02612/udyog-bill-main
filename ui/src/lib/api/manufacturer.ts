import axios from "axios";
import { API_URL } from "./auth";
import { ManufacturerDashboard } from "../../utils/types";

export class ManufacturerService {
  static async getDashboard(
    manufacturerUserId: string,
  ): Promise<ManufacturerDashboard> {
    try {
      const response = await axios.get(
        `${API_URL}/manufacturer/dashboard/${manufacturerUserId}`,
      );

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Error while fetching manufacturer dashboard:", error);
      throw error;
    }
  }

  static async getWholesalers(manufacturerUserId: string) {
    try {
      const response = await axios.get(
        `${API_URL}/manufacturer/wholesalers/${manufacturerUserId}`,
      );

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error while fetching wholesalers:", error);
      throw error;
    }
  }

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

  static async removeParty(payload: {
    manufacturerUserId: string;
    wholesalerUserId: string;
  }) {
    try {
      const response = await axios.delete(`${API_URL}/manufacturer/remove-party`, {
        data: payload,
      });

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error while removing party:", error);
      throw error;
    }
  }
}
