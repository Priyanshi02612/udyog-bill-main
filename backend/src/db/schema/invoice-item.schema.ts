import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InvoiceItemDocument = InvoiceItem & Document;

@Schema({
  timestamps: true,
  collection: 'invoice_items',
  suppressReservedKeysWarning: true,
})
export class InvoiceItem {
  @Prop({ required: true, trim: true, index: true })
  invoiceId!: string;

  @Prop({ required: true, trim: true, index: true })
  itemId!: string;

  @Prop({ required: true, min: 0 })
  quantity!: number;

  @Prop({ required: true, min: 0, max: 100 })
  gstPercentage!: number;

  @Prop({ required: true, min: 0 })
  taxableAmount!: number;
}

export const InvoiceItemSchema = SchemaFactory.createForClass(InvoiceItem);
