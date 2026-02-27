import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryDocument = Inventory & Document;

@Schema({
  timestamps: true,
  collection: 'inventories',
  suppressReservedKeysWarning: true,
})
export class Inventory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  collection!: string;

  @Prop({ required: true, trim: true, index: true })
  lotNumber!: string;

  @Prop({ required: true, min: 0 })
  itemsCount!: number;

  @Prop({ required: true, min: 0 })
  totalStock!: number;

  @Prop({ required: true })
  dateReceived!: Date;

  @Prop({ required: true, min: 0 })
  totalValue!: number;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
