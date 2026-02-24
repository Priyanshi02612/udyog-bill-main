import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Inventory } from '../db/schema/inventory.schema';
import { InventoryItem } from '../db/schema/inventory-item.schema';
import { Invoice } from '../db/schema/invoice.schema';
import { InvoiceItem } from '../db/schema/invoice-item.schema';
import { InvoiceItemAllocation } from '../db/schema/invoice-item-allocation.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

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

        const requestedMap = new Map<string, number>();

        for (const item of createInvoiceDto.items) {
          const requestedQty = Number(item.quantity);
          if (!item.itemId || requestedQty <= 0) {
            throw new BadRequestException('Invalid invoice item');
          }
          requestedMap.set(
            item.itemId,
            (requestedMap.get(item.itemId) ?? 0) + requestedQty,
          );
        }

        const inventories = await this.inventoryModel
          .find({ userId: createInvoiceDto.sellerId })
          .sort({ dateReceived: 1, createdAt: 1 })
          .session(session)
          .lean();

        const inventoryIds = inventories.map((i) => i._id.toString());
        const itemIds = [...requestedMap.keys()];

        const stockAggregation = await this.inventoryItemModel
          .aggregate<{
            _id: string;
            available: number;
          }>([
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
          stockAggregation.map((s) => [s._id, s.available]),
        );

        const errors = itemIds
          .map((itemId) => {
            const requested = requestedMap.get(itemId) ?? 0;
            const available = availableMap.get(itemId) ?? 0;

            if (available >= requested) return null;

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

        const invoiceItems = await this.invoiceItemModel.insertMany(
          createInvoiceDto.items.map((item) => ({
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
            if (remainingQuantity <= 0) break;

            const takeQuantity = Math.min(
              stock.currentStock,
              remainingQuantity,
            );

            if (takeQuantity <= 0) continue;

            await this.inventoryItemModel.updateOne(
              { _id: stock._id, currentStock: { $gte: takeQuantity } },
              { $inc: { currentStock: -takeQuantity } },
              { session },
            );

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

        await session.commitTransaction();

        return {
          ...invoice.toObject(),
          allocationsCount: allocationRows.length,
        };
      });
    } finally {
      await session.endSession();
    }
  }
}
