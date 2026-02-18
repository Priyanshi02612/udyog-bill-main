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
import { AddPartyDto } from './dto/add-party.dto';
import { AcceptPartyInvitationDto } from './dto/accept-party-invitation.dto';
import { RemovePartyDto } from './dto/remove-party.dto';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserBusinessDetails.name)
    private readonly userBusinessDetailsModel: Model<UserBusinessDetails>,
    @InjectModel(ManufacturerWholesalerInvitation.name)
    private readonly invitationModel: Model<ManufacturerWholesalerInvitation>,
    private readonly mailerService: MailerService,
  ) {}

  async getWholesalers(manufacturerUserId: string) {
    if (!manufacturerUserId) {
      throw new BadRequestException('manufacturerUserId is required');
    }

    const manufacturer = await this.userModel.findById(manufacturerUserId);
    if (!manufacturer) {
      throw new NotFoundException('Manufacturer not found');
    }

    const partyUserIds = [
      ...new Set(manufacturer.wholesalerIds?.map((id) => id.toString()) ?? []),
    ];

    if (partyUserIds.length === 0) {
      return [];
    }

    const [wholesalers, wholesalerBusinessDetails] = await Promise.all([
      this.userModel.find({ _id: { $in: partyUserIds } }),
      this.userBusinessDetailsModel.find({ userId: { $in: partyUserIds } }),
    ]);

    const businessDetailsByUserId = new Map(
      wholesalerBusinessDetails.map((details) => [
        details.userId.toString(),
        details,
      ]),
    );

    return wholesalers.map((wholesaler) => {
      const details = businessDetailsByUserId.get(wholesaler.id);

      return {
        userId: wholesaler.id,
        email: wholesaler.email,
        businessName: details?.businessName,
        contactPerson: details?.contactPerson,
        gstin: details?.gstin,
        phone: details?.phone,
        outstanding: 0,
        overdueInvoices: 0,
        invoices: [],
      };
    });
  }

  async addParty(dto: AddPartyDto) {
    const manufacturer = await this.userModel.findById(dto.manufacturerUserId);

    if (!manufacturer) {
      throw new NotFoundException('Manufacturer not found');
    }

    const partyEmail = dto.partyEmail.trim().toLowerCase();
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
