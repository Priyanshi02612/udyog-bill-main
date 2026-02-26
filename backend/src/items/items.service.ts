import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from '../db/schema/item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { InventoryItem } from '../db/schema/inventory-item.schema';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name)
    private readonly itemModel: Model<Item>,
    @InjectModel(InventoryItem.name)
    private readonly inventoryItemModel: Model<InventoryItem>,
  ) {}

  async create(createItemDto: CreateItemDto) {
    const duplicateFilter = {
      ownerId: createItemDto.ownerId,
      basePrice: createItemDto.basePrice,
      gstPercentage: createItemDto.gstPercentage,
    };

    const existingItem = await this.itemModel.findOne(duplicateFilter).lean();
    if (existingItem) {
      throw new BadRequestException(
        'An item with the same base price and GST percentage already exists',
      );
    }

    const item = await this.itemModel.create({
      ...createItemDto,
      description: createItemDto.description ?? '',
      isActive: createItemDto.isActive ?? true,
    });

    return item.toObject();
  }

  async findAll(ownerId?: string) {
    const filter = ownerId ? { ownerId } : {};
    const items = await this.itemModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();
    return items;
  }

  async findOne(id: string) {
    const item = await this.itemModel.findById(id).lean();

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    const inventoryItems = await this.inventoryItemModel.find({
      itemId: String(item._id),
    });

    return {
      ...item,
      currentStock: inventoryItems.reduce(
        (sum, item) => sum + item.currentStock,
        0,
      ),
    };
  }

  async update(id: string, updateItemDto: UpdateItemDto) {
    const item = await this.itemModel
      .findByIdAndUpdate(id, { $set: updateItemDto }, { new: true })
      .lean();

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async remove(id: string) {
    const item = await this.itemModel.findByIdAndDelete(id).lean();

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return { message: 'Item deleted successfully' };
  }
}
