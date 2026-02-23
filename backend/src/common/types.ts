import { GstType, TaxMode } from './enums';

export type ItemCategory = 'FABRIC' | 'MATERIAL' | 'THREAD';

export interface AIGeneratedInvoiceItem {
  itemName: string;
  hsnCode: number;
  quantity: number;
  unit: string;
  basePrice: number;
  gstPercentage: number;
  taxableAmount: number;
}

export type AIGeneratedInvoice = {
  gstType: GstType;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  buyerName: string;
  taxMode: TaxMode;
  totalGstAmount: number;
  taxableSubtotal: number;
  totalAmountDue: number;
  items: AIGeneratedInvoiceItem[];
};
