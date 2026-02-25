import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';
import { Inventory } from '../db/schema/inventory.schema';
import { InventoryItem } from '../db/schema/inventory-item.schema';
import { Invoice } from '../db/schema/invoice.schema';
import { InvoiceItem } from '../db/schema/invoice-item.schema';
import { InvoiceItemAllocation } from '../db/schema/invoice-item-allocation.schema';
import { UserBusinessDetails } from '../db/schema/user-business-details.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Item } from 'src/db/schema/item.schema';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<Invoice>,
    @InjectModel(InvoiceItem.name)
    private readonly invoiceItemModel: Model<InvoiceItem>,
    @InjectModel(InvoiceItemAllocation.name)
    private readonly invoiceItemAllocationModel: Model<InvoiceItemAllocation>,
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<Inventory>,
    @InjectModel(InventoryItem.name)
    private readonly inventoryItemModel: Model<InventoryItem>,
    @InjectModel(UserBusinessDetails.name)
    private readonly userBusinessDetailsModel: Model<UserBusinessDetails>,
    @InjectModel(Item.name)
    private readonly itemModel: Model<Item>,
  ) {}

  async createInvoice(createInvoiceDto: CreateInvoiceDto) {
    const session = await this.connection.startSession();

    try {
      return await session.withTransaction(async () => {
        const [invoice] = await this.invoiceModel.create(
          [
            {
              ...createInvoiceDto,
              invoiceDate: new Date(createInvoiceDto.invoiceDate),
            },
          ],
          { session },
        );

        const invoiceId = String(invoice._id);
        const allocationsCount = await this.allocateInvoiceItems(
          invoiceId,
          createInvoiceDto,
          session,
        );

        return {
          ...invoice.toObject(),
          allocationsCount,
        };
      });
    } finally {
      await session.endSession();
    }
  }

  async getManufacturerInvoices(userId: string) {
    const invoices = await this.invoiceModel
      .find({ sellerId: userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!invoices.length) {
      return [];
    }

    const invoiceIds = invoices.map((invoice) => String(invoice._id));
    const invoiceItems = await this.invoiceItemModel
      .find({ invoiceId: { $in: invoiceIds } })
      .lean();

    const itemsByInvoiceId = new Map<string, typeof invoiceItems>();
    for (const item of invoiceItems) {
      if (!itemsByInvoiceId.has(item.invoiceId)) {
        itemsByInvoiceId.set(item.invoiceId, []);
      }
      itemsByInvoiceId.get(item.invoiceId)!.push(item);
    }

    return invoices.map((invoice) => ({
      ...invoice,
      items: itemsByInvoiceId.get(String(invoice._id)) ?? [],
    }));
  }

  async getInvoiceDetails(invoiceId: string) {
    const [invoice, invoiceItems] = await Promise.all([
      this.invoiceModel.findById(invoiceId).lean(),
      this.invoiceItemModel.find({ invoiceId }).lean(),
    ]);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const [buyerInfo, masterItems] = await Promise.all([
      this.userBusinessDetailsModel
        .findOne(
          { userId: invoice.buyerId },
          {
            businessName: 1,
            registeredAddress: 1,
            state: 1,
            phone: 1,
            gstin: 1,
            userId: 1,
          },
        )
        .lean(),
      this.itemModel
        .find(
          { _id: { $in: invoiceItems.map((item) => item.itemId) } },
          {
            name: 1,
            basePrice: 1,
            hsnCode: 1,
            unit: 1,
          },
        )
        .lean(),
    ]);

    const items = invoiceItems.map((item) => {
      const masterItem =
        masterItems.find((mItem) => String(mItem._id) === item.itemId) || {};

      return {
        ...item,
        ...masterItem,
      };
    });

    return {
      ...invoice,
      buyerInfo,
      items,
    };
  }

  async updateInvoice(invoiceId: string, dto: CreateInvoiceDto) {
    const session = await this.connection.startSession();
    try {
      return await session.withTransaction(async () => {
        const existingInvoice = await this.invoiceModel
          .findById(invoiceId)
          .session(session)
          .lean();

        if (!existingInvoice) {
          throw new NotFoundException('Invoice not found');
        }

        const existingItems = await this.invoiceItemModel
          .find({ invoiceId })
          .session(session)
          .lean();

        const existingInvoiceItemIds = existingItems.map((item) =>
          String(item._id),
        );

        if (existingInvoiceItemIds.length) {
          const previousAllocations = await this.invoiceItemAllocationModel
            .find({ invoiceItemId: { $in: existingInvoiceItemIds } })
            .session(session)
            .lean();

          for (const allocation of previousAllocations) {
            await this.inventoryItemModel.updateOne(
              { _id: allocation.inventoryItemId },
              { $inc: { currentStock: allocation.allocatedQuantity } },
              { session },
            );
          }
        }

        await this.invoiceItemAllocationModel.deleteMany(
          { invoiceId },
          { session },
        );
        await this.invoiceItemModel.deleteMany({ invoiceId }, { session });

        await this.invoiceModel.updateOne(
          { _id: invoiceId },
          {
            ...dto,
            invoiceDate: new Date(dto.invoiceDate),
          },
          { session },
        );

        const allocationsCount = await this.allocateInvoiceItems(
          invoiceId,
          dto,
          session,
        );

        const updatedInvoice = await this.invoiceModel
          .findById(invoiceId)
          .session(session)
          .lean();

        return {
          ...updatedInvoice,
          allocationsCount,
        };
      });
    } finally {
      await session.endSession();
    }
  }

  private buildRequestedMap(items: CreateInvoiceDto['items']) {
    const requestedMap = new Map<string, number>();

    for (const item of items) {
      const requestedQty = Number(item.quantity);
      if (!item.itemId || requestedQty <= 0) {
        throw new BadRequestException('Invalid invoice item');
      }

      requestedMap.set(
        item.itemId,
        (requestedMap.get(item.itemId) ?? 0) + requestedQty,
      );
    }

    return requestedMap;
  }

  private async getInventoryIdsForSeller(
    sellerId: string,
    session: ClientSession,
  ) {
    const inventories = await this.inventoryModel
      .find({ userId: sellerId })
      .sort({ dateReceived: 1, createdAt: 1 })
      .session(session)
      .lean();

    return inventories.map((inventory) => String(inventory._id));
  }

  private async validateStockAvailability(
    inventoryIds: string[],
    requestedMap: Map<string, number>,
    session: ClientSession,
  ) {
    const itemIds = [...requestedMap.keys()];

    const stockAggregation = await this.inventoryItemModel
      .aggregate<{ _id: string; available: number }>([
        {
          $match: {
            inventoryId: { $in: inventoryIds },
            itemId: { $in: itemIds },
            currentStock: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: '$itemId',
            available: { $sum: '$currentStock' },
          },
        },
      ])
      .session(session);

    const availableMap = new Map(
      stockAggregation.map((stock) => [stock._id, stock.available]),
    );

    const errors = itemIds
      .map((itemId) => {
        const requested = requestedMap.get(itemId) ?? 0;
        const available = availableMap.get(itemId) ?? 0;

        if (available >= requested) {
          return null;
        }

        return {
          code: 'INSUFFICIENT_STOCK',
          itemId,
          requestedQuantity: requested,
          availableQuantity: available,
        };
      })
      .filter(Boolean);

    if (errors.length) {
      throw new BadRequestException({
        message: 'Insufficient stock',
        errorFields: errors,
      });
    }

    return itemIds;
  }

  private async allocateInvoiceItems(
    invoiceId: string,
    dto: CreateInvoiceDto,
    session: ClientSession,
  ) {
    const requestedMap = this.buildRequestedMap(dto.items);
    const inventoryIds = await this.getInventoryIdsForSeller(
      dto.sellerId,
      session,
    );
    const itemIds = await this.validateStockAvailability(
      inventoryIds,
      requestedMap,
      session,
    );

    const invoiceItems = await this.invoiceItemModel.insertMany(
      dto.items.map((item) => ({
        invoiceId,
        itemId: item.itemId,
        quantity: Number(item.quantity),
        gstPercentage: Number(item.gstPercentage),
        taxableAmount: Number(item.taxableAmount),
      })),
      { session },
    );

    const allocationRows: Array<{
      invoiceId: string;
      invoiceItemId: string;
      inventoryId: string;
      inventoryItemId: string;
      itemId: string;
      allocatedQuantity: number;
    }> = [];

    const inventoryItems = await this.inventoryItemModel
      .find({
        inventoryId: { $in: inventoryIds },
        itemId: { $in: itemIds },
        currentStock: { $gt: 0 },
      })
      .sort({ createdAt: 1 })
      .session(session);

    const inventoryItemMap = new Map<string, typeof inventoryItems>();

    for (const invItem of inventoryItems) {
      if (!inventoryItemMap.has(invItem.itemId)) {
        inventoryItemMap.set(invItem.itemId, []);
      }
      inventoryItemMap.get(invItem.itemId)!.push(invItem);
    }

    for (const invoiceItem of invoiceItems) {
      let remainingQuantity = invoiceItem.quantity;
      const stockList = inventoryItemMap.get(invoiceItem.itemId) ?? [];

      for (const stock of stockList) {
        if (remainingQuantity <= 0) {
          break;
        }

        const takeQuantity = Math.min(stock.currentStock, remainingQuantity);

        if (takeQuantity <= 0) {
          continue;
        }

        const updateResult = await this.inventoryItemModel.updateOne(
          { _id: stock._id, currentStock: { $gte: takeQuantity } },
          { $inc: { currentStock: -takeQuantity } },
          { session },
        );

        if (!updateResult.modifiedCount) {
          throw new BadRequestException('Stock conflict occurred');
        }

        allocationRows.push({
          invoiceId,
          invoiceItemId: String(invoiceItem._id),
          inventoryId: stock.inventoryId,
          inventoryItemId: String(stock._id),
          itemId: stock.itemId,
          allocatedQuantity: takeQuantity,
        });

        remainingQuantity -= takeQuantity;
      }

      if (remainingQuantity > 0) {
        throw new BadRequestException(
          `Stock allocation failed for item ${invoiceItem.itemId}`,
        );
      }
    }

    if (allocationRows.length) {
      await this.invoiceItemAllocationModel.insertMany(allocationRows, {
        session,
      });
    }

    return allocationRows.length;
  }
}
