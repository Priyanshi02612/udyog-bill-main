import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../db/schema/user.schema';
import {
  ManufacturerWholesalerInvitation,
  ManufacturerWholesalerInvitationSchema,
} from '../db/schema/manufacturer-wholesaler-invitation.schema';
import {
  UserBusinessDetails,
  UserBusinessDetailsSchema,
} from '../db/schema/user-business-details.schema';
import { ManufacturerController } from './manufacturer.controller';
import { ManufacturerService } from './manufacturer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: ManufacturerWholesalerInvitation.name,
        schema: ManufacturerWholesalerInvitationSchema,
      },
      {
        name: UserBusinessDetails.name,
        schema: UserBusinessDetailsSchema,
      },
    ]),
  ],
  controllers: [ManufacturerController],
  providers: [ManufacturerService],
})
export class ManufacturerModule {}
