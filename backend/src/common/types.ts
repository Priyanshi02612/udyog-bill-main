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
  buyerName: string;
  taxMode: TaxMode;
  items: AIGeneratedInvoiceItem[];
};
