import axios from "axios";
import { API_URL } from "./auth";
import { CreateManufacturerInvoicePayload } from "../../utils/types";

export class InvoiceService {
  static async createInvoice(data: CreateManufacturerInvoicePayload) {
    try {
      const response = await axios.post(`${API_URL}/invoice`, data);

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error while creating invoice:", error);
      throw error;
    }
  }
}
