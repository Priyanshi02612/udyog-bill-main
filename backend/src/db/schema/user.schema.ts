import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  MANUFACTURER = 'manufacturer',
  WHOLESALER = 'wholesaler',
  RETAILER = 'retailer',
}

@Schema({ timestamps: true })
export class User {
  @Prop()
  firebaseUid!: string;

  @Prop()
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ enum: UserRole })
  role!: UserRole;

  @Prop({ default: false })
  isOnboarded!: boolean;

  @Prop()
  businessName?: string;

  @Prop()
  gstin?: string;

  @Prop()
  phone?: string;

  @Prop()
  address!: string;

  @Prop()
  state!: string;

  @Prop({ default: 'free' })
  subscriptionPlan!: 'free' | 'monthly' | 'yearly';

  @Prop()
  otp?: string;

  @Prop()
  otpExpiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
