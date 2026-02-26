import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GstType, InvoiceSubmitStatus, TaxMode } from '../../common/enums';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true, collection: 'invoices' })
export class Invoice {
  @Prop({ required: true, trim: true, index: true })
  invoiceNumber!: string;

  @Prop({ required: true, trim: true, index: true })
  sellerId!: string;

  @Prop({ required: true, trim: true, index: true })
  buyerId!: string;

  @Prop({ required: true })
  invoiceDate!: Date;

  @Prop({ required: true })
  invoiceDueDate!: Date;

  @Prop({ required: true, trim: true })
  financialYear!: string;

  @Prop({ required: true, enum: InvoiceSubmitStatus, index: true })
  status!: InvoiceSubmitStatus;

  @Prop({ required: true, enum: GstType })
  gstType!: GstType;

  @Prop({ enum: TaxMode })
  taxMode?: TaxMode;

  @Prop({ required: true, min: 0 })
  cgstRate!: number;

  @Prop({ required: true, min: 0 })
  sgstRate!: number;

  @Prop({ required: true, min: 0 })
  igstRate!: number;

  @Prop({ required: true, min: 0 })
  totalTaxAmount!: number;

  @Prop({ required: true, min: 0 })
  subtotal!: number;

  @Prop({ required: true })
  roundOff!: number;

  @Prop({ required: true, min: 0 })
  total!: number;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
