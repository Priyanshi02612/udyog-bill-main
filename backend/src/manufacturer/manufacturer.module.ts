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
import { Invoice, InvoiceSchema } from '../db/schema/invoice.schema';
import { InvoiceItem, InvoiceItemSchema } from '../db/schema/invoice-item.schema';
import { Inventory, InventorySchema } from '../db/schema/inventory.schema';
import {
  InventoryItem,
  InventoryItemSchema,
} from '../db/schema/inventory-item.schema';
import { Item, ItemSchema } from '../db/schema/item.schema';
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
      {
        name: Invoice.name,
        schema: InvoiceSchema,
      },
      {
        name: InvoiceItem.name,
        schema: InvoiceItemSchema,
      },
      {
        name: Inventory.name,
        schema: InventorySchema,
      },
      {
        name: InventoryItem.name,
        schema: InventoryItemSchema,
      },
      {
        name: Item.name,
        schema: ItemSchema,
      },
    ]),
  ],
  controllers: [ManufacturerController],
  providers: [ManufacturerService],
})
export class ManufacturerModule {}
