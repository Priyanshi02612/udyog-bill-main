import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryItemDocument = InventoryItem & Document;

@Schema({
  timestamps: true,
  collection: 'inventory_items',
  suppressReservedKeysWarning: true,
})
export class InventoryItem {
  @Prop({ required: true, trim: true, index: true })
  inventoryId!: string;

  @Prop({ required: true, trim: true, index: true })
  itemId!: string;

  @Prop({ required: true, min: 0 })
  totalStock!: number;

  @Prop({ required: true, min: 0 })
  currentStock!: number;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);
