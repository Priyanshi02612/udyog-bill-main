import axios from "axios";

import { API_URL } from "./auth";

export class AiService {
  static async generateInvoiceDraft(rawText: string, manufacturerId: string) {
    try {
      const response = await axios.post(`${API_URL}/ai/invoice-draft`, {
        rawText,
        manufacturerId,
      });

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Error while generating invoice draft:", error);
      throw error;
    }
  }
}
