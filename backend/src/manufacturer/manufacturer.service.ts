import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../db/schema/user.schema';
import {
  InvitationStatus,
  ManufacturerWholesalerInvitation,
} from '../db/schema/manufacturer-wholesaler-invitation.schema';
import { UserBusinessDetails } from '../db/schema/user-business-details.schema';
import { Invoice } from '../db/schema/invoice.schema';
import { InvoiceItem } from '../db/schema/invoice-item.schema';
import { Inventory } from '../db/schema/inventory.schema';
import { InventoryItem } from '../db/schema/inventory-item.schema';
import { Item } from '../db/schema/item.schema';
import { AddPartyDto } from './dto/add-party.dto';
import { AcceptPartyInvitationDto } from './dto/accept-party-invitation.dto';
import { RemovePartyDto } from './dto/remove-party.dto';
import { InvoiceStatus, InvoiceSubmitStatus } from '../common/enums';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserBusinessDetails.name)
    private readonly userBusinessDetailsModel: Model<UserBusinessDetails>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<Invoice>,
    @InjectModel(InvoiceItem.name)
    private readonly invoiceItemModel: Model<InvoiceItem>,
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<Inventory>,
    @InjectModel(InventoryItem.name)
    private readonly inventoryItemModel: Model<InventoryItem>,
    @InjectModel(Item.name)
    private readonly itemModel: Model<Item>,
    @InjectModel(ManufacturerWholesalerInvitation.name)
    private readonly invitationModel: Model<ManufacturerWholesalerInvitation>,
    private readonly mailerService: MailerService,
  ) {}

  private readonly dashboardDaysToShow = 7;

  private getDayStart(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private getDayKey(date: Date) {
    const start = this.getDayStart(date);
    return `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`;
  }

  private formatDayLabel(date: Date) {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  }

  async getDashboard(manufacturerUserId: string) {
    if (!manufacturerUserId) {
      throw new BadRequestException('manufacturerUserId is required');
    }

    const manufacturer = await this.userModel.findById(manufacturerUserId);
    if (!manufacturer) {
      throw new NotFoundException('Manufacturer not found');
    }

    const invoices = await this.invoiceModel
      .find({ sellerId: manufacturerUserId })
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const buyerIds = [
      ...new Set(invoices.map((invoice) => String(invoice.buyerId))),
    ];

    const buyers = buyerIds.length
      ? await this.userBusinessDetailsModel
          .find({ userId: { $in: buyerIds } }, { userId: 1, businessName: 1 })
          .lean()
      : [];

    const buyerNameById = new Map(
      buyers.map((buyer) => [String(buyer.userId), buyer.businessName]),
    );

    const totalInvoices = invoices.length;
    const pendingPayments = invoices
      .filter((invoice) => invoice.status === InvoiceSubmitStatus.SENT)
      .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

    const monthlyRevenue = invoices
      .filter(
        (invoice) =>
          invoice.status === InvoiceSubmitStatus.SENT &&
          new Date(invoice.invoiceDate) >= monthStart,
      )
      .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

    const overdueCount = invoices.filter(
      (invoice) =>
        invoice.status === InvoiceSubmitStatus.SENT &&
        new Date(invoice.invoiceDueDate) < now,
    ).length;

    const recentInvoices = invoices.slice(0, 4).map((invoice) => {
      const isOverdue =
        invoice.status === InvoiceSubmitStatus.SENT &&
        new Date(invoice.invoiceDueDate) < now;

      return {
        id: String(invoice._id),
        invoiceNumber: invoice.invoiceNumber,
        buyerName:
          buyerNameById.get(String(invoice.buyerId)) ?? String(invoice.buyerId),
        invoiceDate: invoice.invoiceDate,
        total: Number(invoice.total || 0),
        status: isOverdue ? InvoiceStatus.OVERDUE : invoice.status,
      };
    });

    const sentCount = invoices.filter(
      (invoice) => invoice.status === InvoiceSubmitStatus.SENT,
    ).length;

    const draftCount = invoices.filter(
      (invoice) => invoice.status === InvoiceSubmitStatus.DRAFT,
    ).length;

    const inventoryLots = await this.inventoryModel
      .find({ userId: manufacturerUserId })
      .sort({ createdAt: -1 })
      .lean();

    const inventoryIds = inventoryLots.map((lot) => String(lot._id));
    const inventoryItems = inventoryIds.length
      ? await this.inventoryItemModel
          .find({ inventoryId: { $in: inventoryIds } })
          .lean()
      : [];

    const itemIds = [
      ...new Set(inventoryItems.map((item) => String(item.itemId))),
    ];
    const masterItems = itemIds.length
      ? await this.itemModel
          .find({ _id: { $in: itemIds } }, { name: 1, unit: 1, basePrice: 1 })
          .lean()
      : [];

    const masterItemById = new Map(
      masterItems.map((item) => [String(item._id), item]),
    );

    const inventorySummarySeed = {
      totalReceivedStock: 0,
      currentStock: 0,
      consumedStock: 0,
      inventoryValue: 0,
      outOfStockCount: 0,
      lowStockCount: 0,
    };

    const lowStockItems: Array<{
      id: string;
      itemId: string;
      name: string;
      unit: string;
      totalStock: number;
      currentStock: number;
    }> = [];

    const inventorySummary = inventoryItems.reduce((acc, inventoryItemDoc) => {
      const totalStock = Number(inventoryItemDoc.totalStock || 0);
      const currentStock = Number(inventoryItemDoc.currentStock || 0);
      const consumedStock = Math.max(0, totalStock - currentStock);
      const stockRatio = totalStock > 0 ? currentStock / totalStock : 0;
      const masterItem = masterItemById.get(String(inventoryItemDoc.itemId));
      const itemName = masterItem?.name ?? 'Unnamed item';
      const unit = masterItem?.unit ?? 'units';
      const basePrice = Number(masterItem?.basePrice || 0);

      acc.totalReceivedStock += totalStock;
      acc.currentStock += currentStock;
      acc.consumedStock += consumedStock;
      acc.inventoryValue += currentStock * basePrice;

      if (currentStock === 0) {
        acc.outOfStockCount += 1;
      }

      if (totalStock > 0 && currentStock > 0 && stockRatio <= 0.2) {
        acc.lowStockCount += 1;
        lowStockItems.push({
          id: String(inventoryItemDoc._id),
          itemId: String(inventoryItemDoc.itemId),
          name: itemName,
          unit,
          totalStock,
          currentStock,
        });
      }

      return acc;
    }, inventorySummarySeed);

    const today = this.getDayStart(now);
    const dayDates = Array.from(
      { length: this.dashboardDaysToShow },
      (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (this.dashboardDaysToShow - 1 - index));
        return date;
      },
    );

    const inwardMap = new Map<string, number>();
    const outwardMap = new Map<string, number>();
    dayDates.forEach((date) => {
      const key = this.getDayKey(date);
      inwardMap.set(key, 0);
      outwardMap.set(key, 0);
    });

    inventoryLots.forEach((lot) => {
      const lotDate = new Date(lot.dateReceived);
      if (Number.isNaN(lotDate.getTime())) {
        return;
      }

      const key = this.getDayKey(lotDate);
      if (!inwardMap.has(key)) {
        return;
      }

      inwardMap.set(
        key,
        (inwardMap.get(key) || 0) + Number(lot.totalStock || 0),
      );
    });

    const validInvoiceIds = invoices
      .filter((invoice) => invoice.status !== InvoiceSubmitStatus.DRAFT)
      .map((invoice) => String(invoice._id));

    const invoiceItems = validInvoiceIds.length
      ? await this.invoiceItemModel
          .find(
            { invoiceId: { $in: validInvoiceIds } },
            { invoiceId: 1, quantity: 1 },
          )
          .lean()
      : [];

    const outwardQuantityByInvoiceId = new Map<string, number>();
    invoiceItems.forEach((invoiceItem) => {
      const invoiceId = String(invoiceItem.invoiceId);
      outwardQuantityByInvoiceId.set(
        invoiceId,
        (outwardQuantityByInvoiceId.get(invoiceId) || 0) +
          Number(invoiceItem.quantity || 0),
      );
    });

    invoices
      .filter((invoice) => invoice.status !== InvoiceSubmitStatus.DRAFT)
      .forEach((invoice) => {
        const invoiceDate = new Date(invoice.invoiceDate);
        if (Number.isNaN(invoiceDate.getTime())) {
          return;
        }

        const key = this.getDayKey(invoiceDate);
        if (!outwardMap.has(key)) {
          return;
        }

        const quantity =
          outwardQuantityByInvoiceId.get(String(invoice._id)) || 0;
        outwardMap.set(key, (outwardMap.get(key) || 0) + quantity);
      });

    const dailyStockData = dayDates.map((date) => {
      const key = this.getDayKey(date);
      return {
        label: this.formatDayLabel(date),
        inward: inwardMap.get(key) || 0,
        outward: outwardMap.get(key) || 0,
      };
    });

    return {
      kpis: {
        totalInvoices,
        pendingPayments,
        monthlyRevenue,
      },
      invoiceSummary: {
        totalInvoices,
        pendingPayments,
        monthlyRevenue,
        overdueCount,
      },
      inventorySummary,
      lowStockItems: lowStockItems.slice(0, 12),
      dailyStockData,
      recentInvoices,
      insights: [
        {
          type: 'success',
          title: 'Invoice Throughput',
          description: `${sentCount} invoices have been sent to buyers.`,
        },
        {
          type: overdueCount > 0 ? 'warning' : 'success',
          title: overdueCount > 0 ? 'Overdue Payments' : 'Collections Health',
          description:
            overdueCount > 0
              ? `${overdueCount} sent invoices are overdue. Follow up with buyers.`
              : 'No overdue invoices right now.',
        },
        {
          type: draftCount > 0 ? 'info' : 'success',
          title: 'Pending Drafts',
          description:
            draftCount > 0
              ? `${draftCount} invoices are still in draft and not sent.`
              : 'All invoices are already sent.',
        },
      ],
    };
  }

  async getWholesalers(manufacturerUserId: string) {
    if (!manufacturerUserId) {
      throw new BadRequestException('manufacturerUserId is required');
    }

    const manufacturer = await this.userModel
      .findById(manufacturerUserId)
      .lean();

    if (!manufacturer) {
      throw new NotFoundException('Manufacturer not found');
    }

    const confirmedIds = manufacturer.wholesalerIds?.map(String) ?? [];

    const pendingInvitations = await this.invitationModel
      .find({
        manufacturerId: manufacturerUserId,
        status: InvitationStatus.PENDING,
      })
      .lean();

    const pendingEmails = pendingInvitations.map((i) => i.partyEmail);

    const pendingUsers = await this.userModel
      .find({ email: { $in: pendingEmails } })
      .lean();

    const pendingIds = pendingUsers.map((u) => String(u._id));

    const allUserIds = [...new Set([...confirmedIds, ...pendingIds])];

    if (!allUserIds.length) return [];

    const [users, businessDetails, invoices] = await Promise.all([
      this.userModel.find({ _id: { $in: allUserIds } }).lean(),
      this.userBusinessDetailsModel
        .find({ userId: { $in: allUserIds } })
        .lean(),
      this.invoiceModel
        .find({ sellerId: manufacturerUserId, buyerId: { $in: allUserIds } })
        .lean(),
    ]);

    const businessMap = new Map(
      businessDetails.map((d) => [String(d.userId), d]),
    );

    const invoiceMap = new Map<string, typeof invoices>();

    for (const invoice of invoices) {
      const buyerId = String(invoice.buyerId);
      if (!invoiceMap.has(buyerId)) invoiceMap.set(buyerId, []);
      invoiceMap.get(buyerId)!.push(invoice);
    }

    const now = new Date();

    return users.map((user) => {
      const userId = String(user._id);
      const details = businessMap.get(userId);
      const userInvoices = invoiceMap.get(userId) ?? [];

      const sentInvoices = userInvoices.filter(
        (i) => i.status === InvoiceSubmitStatus.SENT,
      );

      const overdueInvoices = sentInvoices.filter(
        (i) => i.invoiceDueDate && new Date(i.invoiceDueDate) < now,
      );

      const outstanding = sentInvoices.reduce(
        (sum, i) => sum + Number(i.total ?? 0),
        0,
      );

      return {
        userId,
        email: user.email,
        businessName: details?.businessName ?? null,
        contactPerson: details?.contactPerson ?? null,
        gstin: details?.gstin ?? null,
        phone: details?.phone ?? null,
        outstanding,
        overdueInvoices: overdueInvoices.length,
        invoices: userInvoices.slice(0, 4),
        isPending: pendingIds.includes(userId),
      };
    });
  }

  async addParty(dto: AddPartyDto) {
    const manufacturer = await this.userModel.findById(dto.manufacturerUserId);

    if (!manufacturer) {
      throw new NotFoundException('Manufacturer not found');
    }

    const partyEmail = dto.partyEmail.trim().toLowerCase();

    if (manufacturer.email === partyEmail) {
      throw new BadRequestException(
        'Manufacturer cannot send invitation to their own email address',
      );
    }

    const existsAcceptedParty = await this.invitationModel.findOne({
      manufacturerId: manufacturer.id,
      partyEmail,
      status: InvitationStatus.ACCEPTED,
    });

    if (existsAcceptedParty) {
      throw new BadRequestException(
        'Party with this email has already accepted your invitation.',
      );
    }

    const activeInvitation = await this.invitationModel.findOne({
      manufacturerId: manufacturer.id,
      partyEmail,
      status: InvitationStatus.PENDING,
      expiresAt: { $gt: new Date() },
    });

    if (activeInvitation) {
      throw new BadRequestException('Invitation already sent to this party');
    }

    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.invitationModel.create({
      manufacturerId: manufacturer.id,
      partyEmail,
      token,
      expiresAt,
      status: InvitationStatus.PENDING,
    });

    const acceptUrl = `${process.env.FRONTEND_URL ?? ''}/accept-party-invitation?token=${token}`;

    await this.mailerService.sendMail({
      to: partyEmail,
      subject: 'Invitation to connect as wholesaler',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a; line-height: 1.5;">
          <div style="background: #8b5a2b; color: #ffffff; padding: 20px 24px; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0; font-size: 22px;">UdyogBill Invitation</h2>
          </div>

          <div style="border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 12px 12px; padding: 24px; background: #ffffff;">
            <p style="margin-top: 0;">Hello,</p>
            <p>You have been invited to join a manufacturer on <strong>UdyogBill</strong> as a wholesaler partner.</p>
            <p style="margin-bottom: 20px;">Click the button below to accept this invitation.</p>

            <a
              href="${acceptUrl}"
              style="display: inline-block; background: #8b5a2b; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 600;"
            >
              Accept Invitation
            </a>

            <p style="margin: 20px 0 8px; color: #475569;">This invitation will expire in 7 days.</p>
            <p style="margin: 0; color: #64748b; font-size: 13px;">If the button does not work, open this link in your browser:</p>
            <p style="margin: 8px 0 0; word-break: break-all;">
              <a href="${acceptUrl}" style="color: #8b5a2b;">${acceptUrl}</a>
            </p>
          </div>
        </div>
      `,
    });

    return {
      message: 'Invitation sent successfully',
      partyEmail,
    };
  }

  async acceptInvitation(dto: AcceptPartyInvitationDto) {
    const invitation = await this.invitationModel.findOne({
      token: dto.token,
      status: InvitationStatus.PENDING,
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    const wholesaler = await this.userModel.findById(dto.wholesalerUserId);

    if (!wholesaler) {
      throw new NotFoundException('Wholesaler not found');
    }

    if (wholesaler.email.toLowerCase() !== invitation.partyEmail) {
      throw new BadRequestException(
        'Only invited email can accept this invitation',
      );
    }

    const manufacturer = await this.userModel.findById(
      invitation.manufacturerId,
    );
    if (!manufacturer) {
      throw new NotFoundException('Manufacturer not found');
    }

    await this.userModel.findByIdAndUpdate(manufacturer.id, {
      $addToSet: { wholesalerIds: wholesaler.id },
    });

    invitation.status = InvitationStatus.ACCEPTED;
    invitation.partyUserId = wholesaler.id;
    invitation.acceptedAt = new Date();
    await invitation.save();

    return {
      message: 'Invitation accepted successfully',
      manufacturerId: manufacturer.id,
      wholesalerId: wholesaler.id,
    };
  }

  async removeParty(dto: RemovePartyDto) {
    if (!dto.manufacturerUserId || !dto.wholesalerUserId) {
      throw new BadRequestException(
        'manufacturerUserId and wholesalerUserId are required',
      );
    }

    const manufacturer = await this.userModel.findById(dto.manufacturerUserId);
    if (!manufacturer) {
      throw new NotFoundException('Manufacturer not found');
    }

    const wholesalerIds = manufacturer.wholesalerIds?.map((id) =>
      id.toString(),
    );

    if (!wholesalerIds?.includes(dto.wholesalerUserId)) {
      throw new NotFoundException(
        'Wholesaler is not connected to manufacturer',
      );
    }

    const wholesaler = await this.userModel.findById(dto.wholesalerUserId);

    await Promise.all([
      this.userModel.findByIdAndUpdate(manufacturer.id, {
        $pull: { wholesalerIds: dto.wholesalerUserId },
      }),
      this.invitationModel.updateMany(
        {
          manufacturerId: manufacturer.id,
          $or: [
            { partyUserId: dto.wholesalerUserId },
            ...(wholesaler?.email
              ? [{ partyEmail: wholesaler.email.toLowerCase() }]
              : []),
          ],
        },
        {
          $set: {
            status: InvitationStatus.DISCONNECTED,
            disconnectedAt: new Date(),
          },
        },
      ),
    ]);

    return {
      message: 'Wholesaler removed successfully',
      manufacturerId: manufacturer.id,
      wholesalerId: dto.wholesalerUserId,
    };
  }
}
