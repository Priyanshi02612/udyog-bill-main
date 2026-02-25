import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InvoiceItemAllocationDocument = InvoiceItemAllocation & Document;

@Schema({ timestamps: true, collection: 'invoice_item_allocations' })
export class InvoiceItemAllocation {
  @Prop({ required: true, trim: true, index: true })
  invoiceId!: string;

  @Prop({ required: true, trim: true, index: true })
  invoiceItemId!: string;

  @Prop({ required: true, trim: true, index: true })
  inventoryId!: string;

  @Prop({ required: true, trim: true, index: true })
  inventoryItemId!: string;

  @Prop({ required: true, trim: true, index: true })
  itemId!: string;

  @Prop({ required: true, min: 0 })
  allocatedQuantity!: number;
}

export const InvoiceItemAllocationSchema = SchemaFactory.createForClass(
  InvoiceItemAllocation,
);
