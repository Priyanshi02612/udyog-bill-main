import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  MANUFACTURER = 'manufacturer',
  WHOLESALER = 'wholesaler',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  firebaseUid!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true, enum: UserRole })
  role!: UserRole;

  @Prop({ default: false })
  isOnboarded!: boolean;

  @Prop({ default: 'free' })
  subscriptionPlan!: 'free' | 'monthly' | 'yearly';

  @Prop()
  otp?: string;

  @Prop()
  otpExpiresAt?: Date;

  @Prop({ type: [String] })
  wholesalerIds!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
