import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as types from '../../common/types';

export type ItemDocument = Item & Document;

@Schema({
  timestamps: true,
  collection: 'items',
  suppressReservedKeysWarning: true,
})
export class Item {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  imageUrl?: string;

  @Prop({ required: true, trim: true })
  category!: types.ItemCategory;

  @Prop({ trim: true, default: '' })
  description!: string;

  @Prop({ required: true, min: 0 })
  basePrice!: number;

  @Prop({ required: true, trim: true })
  unit!: string;

  @Prop({ required: true, min: 0, max: 100 })
  gstPercentage!: number;

  @Prop({ required: true, min: 0 })
  hsnCode!: number;

  @Prop({ trim: true })
  color?: string;

  @Prop({ trim: true })
  materialType?: string;

  @Prop({ trim: true })
  designPattern?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ trim: true, index: true })
  ownerId?: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
