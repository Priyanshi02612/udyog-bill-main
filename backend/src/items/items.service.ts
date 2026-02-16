import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from '../db/schema/item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name)
    private readonly itemModel: Model<Item>,
  ) {}

  async create(createItemDto: CreateItemDto) {
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

    return item;
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
