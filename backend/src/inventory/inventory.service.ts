import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryItem } from '../db/schema/inventory-item.schema';
import { Inventory } from '../db/schema/inventory.schema';
import { Item } from '../db/schema/item.schema';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { isEqual } from 'lodash';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<Inventory>,
    @InjectModel(InventoryItem.name)
    private readonly inventoryItemModel: Model<InventoryItem>,
    @InjectModel(Item.name)
    private readonly itemModel: Model<Item>,
  ) {}

  async createInventoryLot(createInventoryDto: CreateInventoryDto) {
    const { userId, itemsCount, dateReceived, inventoryItems } =
      createInventoryDto;

    await this.validateDuplicateInventoryLot(
      userId,
      itemsCount,
      inventoryItems,
    );

    const inventory = await this.inventoryModel.create({
      ...createInventoryDto,
      dateReceived: new Date(dateReceived),
    });

    const inventoryId = String(inventory._id);
    const inventoryItemPayload = inventoryItems.map((lineItem) => ({
      ...lineItem,
      inventoryId,
      currentStock: lineItem.currentStock ?? lineItem.totalStock,
    }));

    const createdInventoryItems = await this.inventoryItemModel.insertMany(
      inventoryItemPayload,
      {
        ordered: true,
      },
    );

    return { ...inventory.toObject(), inventoryItems: createdInventoryItems };
  }

  async updateInventoryLot(
    inventoryId: string,
    updateInventoryDto: UpdateInventoryDto,
  ) {
    const inventory = await this.inventoryModel.findById(inventoryId);

    if (!inventory) {
      throw new NotFoundException('Inventory lot not found');
    }

    const { userId, itemsCount, dateReceived, inventoryItems } =
      updateInventoryDto;

    await this.validateDuplicateInventoryLot(
      userId,
      itemsCount,
      inventoryItems,
      inventoryId,
    );

    const existingInventoryItems = await this.inventoryItemModel
      .find({ inventoryId })
      .lean();
    const existingItemMap = new Map(
      existingInventoryItems.map((item) => [String(item.itemId), item]),
    );

    const incomingItemIds = new Set(
      inventoryItems.map((item) => String(item.itemId)),
    );

    for (const lineItem of inventoryItems) {
      const itemId = String(lineItem.itemId);
      const totalStock = Number(lineItem.totalStock);
      const existingItem = existingItemMap.get(itemId);

      if (existingItem) {
        await this.inventoryItemModel.updateOne(
          { inventoryId, itemId },
          {
            totalStock,
            currentStock:
              lineItem.currentStock !== undefined
                ? Number(lineItem.currentStock)
                : Math.min(Number(existingItem.currentStock), totalStock),
          },
        );
      } else {
        await this.inventoryItemModel.create({
          ...lineItem,
          currentStock: lineItem.currentStock ?? totalStock,
        });
      }
    }

    await this.inventoryItemModel.deleteMany({
      inventoryId,
      itemId: { $nin: Array.from(incomingItemIds) },
    });

    inventory.set({
      ...updateInventoryDto,
      dateReceived: new Date(dateReceived),
    });
    await inventory.save();

    const updatedInventoryItems = await this.inventoryItemModel
      .find({ inventoryId })
      .lean();

    return { ...inventory.toObject(), inventoryItems: updatedInventoryItems };
  }

  private async validateDuplicateInventoryLot(
    userId: string,
    itemsCount: number,
    inventoryItems: { itemId: string; totalStock: number }[],
    excludeInventoryId?: string,
  ) {
    const itemsToCompare = inventoryItems
      .map((item) => ({
        itemId: String(item.itemId),
        totalStock: Number(item.totalStock),
      }))
      .sort((a, b) => a.itemId.localeCompare(b.itemId));

    const query: { userId: string; itemsCount: number; _id?: { $ne: string } } =
      {
        userId,
        itemsCount,
      };

    if (excludeInventoryId) {
      query._id = { $ne: excludeInventoryId };
    }

    const existingLots = await this.inventoryModel.find(query).lean();

    for (const lot of existingLots) {
      const existingInventoryItems = await this.inventoryItemModel
        .find({ inventoryId: String(lot._id) })
        .lean();

      const existingLotItems = existingInventoryItems
        .map((item) => ({
          itemId: String(item.itemId),
          totalStock: Number(item.totalStock),
        }))
        .sort((a, b) => a.itemId.localeCompare(b.itemId));

      if (isEqual(itemsToCompare, existingLotItems)) {
        throw new BadRequestException(
          'Duplicate inventory lot: Same items with same quantities already exist.',
        );
      }
    }
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

  async getInventoryDetails(inventoryId: string) {
    const inventory = await this.inventoryModel.findById(inventoryId).lean();

    if (!inventory) {
      throw new NotFoundException('Inventory lot not found');
    }

    const inventoryItems = await this.inventoryItemModel
      .find({ inventoryId })
      .sort({ createdAt: -1 })
      .lean();

    const itemIds = inventoryItems.map((item) => item.itemId);

    if (!itemIds.length) {
      return { ...inventory, inventoryItems: [] };
    }

    const masterItems = await this.itemModel
      .find(
        { _id: { $in: itemIds } },
        {
          name: 1,
          unit: 1,
          hsnCode: 1,
          basePrice: 1,
          category: 1,
          materialType: 1,
        },
      )
      .lean();

    const mappedInventoryItems = inventoryItems.map((invItem) => {
      const masterItem = masterItems.find(
        (m) => String(m._id) === String(invItem.itemId),
      );

      const consumedStock = invItem.totalStock - invItem.currentStock;
      const stockRatio =
        invItem.totalStock > 0 ? invItem.currentStock / invItem.totalStock : 0;

      return {
        ...invItem,
        itemName: masterItem?.name,
        unit: masterItem?.unit,
        hsnCode: masterItem?.hsnCode,
        basePrice: masterItem?.basePrice,
        itemCategory: masterItem?.category,
        materialType: masterItem?.materialType,
        consumedStock,
        stockRatio,
        currentValue: invItem.currentStock * (masterItem?.basePrice || 0),
      };
    });

    return {
      ...inventory,
      inventoryItems: mappedInventoryItems,
    };
  }
}
