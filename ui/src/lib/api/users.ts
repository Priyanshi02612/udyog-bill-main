import axios from "axios";
import { API_URL } from "./auth";

export class UsersService {
  static async getUserByFirebaseId(firebaseUid: string | undefined) {
    if (!firebaseUid) {
      return null;
    }

    try {
      const response = await axios.get(`${API_URL}/users/${firebaseUid}`);

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error while fetching user:", error);
      throw error;
    }
  }

  static async deactivateUserByFirebaseId(firebaseUid: string | undefined) {
    if (!firebaseUid) {
      throw new Error("Missing firebase uid");
    }

    try {
      const response = await axios.patch(
        `${API_URL}/users/${firebaseUid}/deactivate`,
      );

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error while deactivating user:", error);
      throw error;
    }
  }

  static async reactivateUserByFirebaseId(firebaseUid: string | undefined) {
    if (!firebaseUid) {
      throw new Error("Missing firebase uid");
    }

    try {
      const response = await axios.patch(
        `${API_URL}/users/${firebaseUid}/reactivate`,
      );

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error while reactivating user:", error);
      throw error;
    }
  }
}
