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

  static async getManufacturerInvoices(userId: string) {
    try {
      const response = await axios.get(`${API_URL}/invoice/manufacturer/${userId}`);

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data.data || [];
    } catch (error) {
      console.error("Error while fetching manufacturer invoices:", error);
      throw error;
    }
  }

  static async getInvoiceDetails(invoiceId: string) {
    try {
      const response = await axios.get(`${API_URL}/invoice/${invoiceId}`);

      if (!response.status) {
        throw new Error(
          response.data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return response.data.data || null;
    } catch (error) {
      console.error("Error while fetching invoice details:", error);
      throw error;
    }
  }
}
