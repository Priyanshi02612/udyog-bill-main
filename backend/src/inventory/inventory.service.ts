import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryItem } from '../db/schema/inventory-item.schema';
import { Inventory } from '../db/schema/inventory.schema';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { isEqual } from 'lodash';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<Inventory>,
    @InjectModel(InventoryItem.name)
    private readonly inventoryItemModel: Model<InventoryItem>,
  ) {}

  async createInventoryLot(createInventoryDto: CreateInventoryDto) {
    const itemsToBeCreated = createInventoryDto.inventoryItems
      .map((item) => ({
        itemId: String(item.itemId),
        totalStock: Number(item.totalStock),
      }))
      .sort((a, b) => a.itemId.localeCompare(b.itemId));

    const existingLots = await this.inventoryModel
      .find({
        userId: createInventoryDto.userId,
        itemsCount: createInventoryDto.itemsCount,
      })
      .lean();

    for (const lot of existingLots) {
      const existingInventoryItems = await this.inventoryItemModel
        .find({
          inventoryId: String(lot._id),
        })
        .lean();

      const existingLotItems = existingInventoryItems
        .map((item) => ({
          itemId: String(item.itemId),
          totalStock: Number(item.totalStock),
        }))
        .sort((a, b) => a.itemId.localeCompare(b.itemId));

      const isDuplicateItemsExists = isEqual(
        itemsToBeCreated,
        existingLotItems,
      );

      if (isDuplicateItemsExists) {
        throw new BadRequestException(
          'Duplicate inventory lot: Same items with same quantities already exist.',
        );
      }
    }

    const inventory = await this.inventoryModel.create({
      ...createInventoryDto,
      dateReceived: new Date(createInventoryDto.dateReceived),
    });

    const inventoryId = String(inventory._id);
    const inventoryItemPayload = createInventoryDto.inventoryItems.map(
      (lineItem) => ({
        inventoryId,
        itemId: lineItem.itemId,
        totalStock: lineItem.totalStock,
        currentStock: lineItem.currentStock ?? lineItem.totalStock,
      }),
    );

    const createdInventoryItems = await this.inventoryItemModel.insertMany(
      inventoryItemPayload,
      {
        ordered: true,
      },
    );

    return { ...inventory.toObject(), inventoryItems: createdInventoryItems };
  }

  async getUsersInventoryLots(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const inventory = await this.inventoryModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalInventory = await this.inventoryModel.countDocuments({ userId });

    return {
      inventory,
      totalInventory,
    };
  }
}
