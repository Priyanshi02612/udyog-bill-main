import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from '../db/schema/item.schema';
import { User, UserSchema } from '../db/schema/user.schema';
import {
  UserBusinessDetails,
  UserBusinessDetailsSchema,
} from '../db/schema/user-business-details.schema';
import { Invoice, InvoiceSchema } from '../db/schema/invoice.schema';
import {
  ManufacturerWholesalerInvitation,
  ManufacturerWholesalerInvitationSchema,
} from '../db/schema/manufacturer-wholesaler-invitation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: User.name, schema: UserSchema },
      { name: UserBusinessDetails.name, schema: UserBusinessDetailsSchema },
      {
        name: ManufacturerWholesalerInvitation.name,
        schema: ManufacturerWholesalerInvitationSchema,
      },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
