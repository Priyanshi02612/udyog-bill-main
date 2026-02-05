import axios from "axios";
import { API_URL } from "./auth";

export class UsersService {
  static async getUserByFirebaseId(firebaseUid: string | undefined) {
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
}
