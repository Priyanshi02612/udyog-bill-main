import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Inventory, InventorySchema } from '../db/schema/inventory.schema';
import {
  InventoryItem,
  InventoryItemSchema,
} from '../db/schema/inventory-item.schema';
import { Invoice, InvoiceSchema } from '../db/schema/invoice.schema';
import {
  InvoiceItem,
  InvoiceItemSchema,
} from '../db/schema/invoice-item.schema';
import {
  InvoiceItemAllocation,
  InvoiceItemAllocationSchema,
} from '../db/schema/invoice-item-allocation.schema';
import {
  UserBusinessDetails,
  UserBusinessDetailsSchema,
} from '../db/schema/user-business-details.schema';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { Item, ItemSchema } from '../db/schema/item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Invoice.name,
        schema: InvoiceSchema,
      },
      {
        name: InvoiceItem.name,
        schema: InvoiceItemSchema,
      },
      {
        name: InvoiceItemAllocation.name,
        schema: InvoiceItemAllocationSchema,
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
        name: UserBusinessDetails.name,
        schema: UserBusinessDetailsSchema,
      },
      {
        name: Item.name,
        schema: ItemSchema,
      },
    ]),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
