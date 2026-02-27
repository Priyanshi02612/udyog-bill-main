import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { GstType, TaxMode } from '../../common/enums';

export type UserBusinessDetailsDocument = UserBusinessDetails & Document;

class FinancialYearSnapshot {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  label!: string;

  @Prop({ required: true })
  range!: string;

  @Prop({ required: true })
  startYear!: number;

  @Prop({ required: true })
  endYear!: number;
}

@Schema({
  timestamps: true,
  collection: 'user_business_details',
  suppressReservedKeysWarning: true,
})
export class UserBusinessDetails {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  contactPerson!: string;

  @Prop({ required: true, trim: true })
  businessName!: string;

  @Prop({ required: true, trim: true, uppercase: true })
  gstin!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ required: true, trim: true })
  registeredAddress!: string;

  @Prop({ required: true, trim: true })
  state!: string;

  @Prop({ required: true, enum: GstType })
  gstType!: GstType;

  @Prop({ required: true, enum: TaxMode })
  gstTaxMode!: TaxMode;

  @Prop({ type: [FinancialYearSnapshot], default: [] })
  financialYears!: FinancialYearSnapshot[];

  @Prop({ required: true })
  activeFinancialYearId!: string;
}

export const UserBusinessDetailsSchema =
  SchemaFactory.createForClass(UserBusinessDetails);
