import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Inventory, InventorySchema } from '../db/schema/inventory.schema';
import {
  InventoryItem,
  InventoryItemSchema,
} from '../db/schema/inventory-item.schema';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Inventory.name,
        schema: InventorySchema,
      },
      {
        name: InventoryItem.name,
        schema: InventoryItemSchema,
      },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
