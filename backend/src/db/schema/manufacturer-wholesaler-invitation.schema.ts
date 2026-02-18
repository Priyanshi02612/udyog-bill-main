import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ManufacturerWholesalerInvitationDocument =
  ManufacturerWholesalerInvitation & Document;

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DISCONNECTED = 'disconnected',
}

@Schema({ timestamps: true })
export class ManufacturerWholesalerInvitation {
  @Prop({ required: true, index: true })
  manufacturerId!: string;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  partyEmail!: string;

  @Prop({ required: true, unique: true, index: true })
  token!: string;

  @Prop({
    required: true,
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status!: InvitationStatus;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop()
  acceptedAt?: Date;

  @Prop()
  disconnectedAt?: Date;

  @Prop()
  partyUserId?: string;
}

export const ManufacturerWholesalerInvitationSchema =
  SchemaFactory.createForClass(ManufacturerWholesalerInvitation);
