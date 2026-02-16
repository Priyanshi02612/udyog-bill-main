import axios from "axios";
import { SignupPayload } from "../../utils/types";

export const API_URL = process.env.BASE_URL || "http://localhost:8080";

export class AuthService {
  static async createUser(createUsersData: SignupPayload) {
    try {
      const response = await axios.post(
        `${API_URL}/auth/signup`,
        createUsersData,
      );

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error while creating user:", error);
      throw error;
    }
  }

  static async sendOTP(userEmail: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/send-otp`, {
        email: userEmail,
      });

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error while sending otp:", error);
      throw error;
    }
  }

  static async verifyOtp(email: string, otp: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp,
      });

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Error while verification:", error);
      throw error;
    }
  }
}
