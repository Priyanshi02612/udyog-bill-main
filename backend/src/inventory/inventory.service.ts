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
