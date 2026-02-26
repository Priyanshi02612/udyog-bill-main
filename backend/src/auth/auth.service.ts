/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/sign-up.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../db/schema/user.schema';
import { UserBusinessDetails } from '../db/schema/user-business-details.schema';
import { Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { generateOtp, hashOtp } from '../common/helper';
import { GstType, TaxMode } from '../common/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserBusinessDetails.name)
    private readonly userBusinessDetailsModel: Model<UserBusinessDetails>,
    private readonly mailerService: MailerService,
  ) {}

  async sendOTP(data: { email: string }) {
    const user = await this.userModel.findOne({ email: data.email });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);

    user.otp = hashedOtp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    await user.save();

    void this.mailerService.sendMail({
      to: data.email,
      subject: 'Your verification code',
      html: `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 5 minutes.</p>
    `,
    });

    return { message: 'OTP sent successfully' };
  }

  async verifyOTP(dto: { email: string; otp: string }) {
    const user = await this.userModel.findOne({ email: dto.email });

    if (!user || !user.otp || !user.otpExpiresAt) {
      throw new UnauthorizedException('OTP not found');
    }

    if (user.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('OTP expired');
    }

    const isValid = await bcrypt.compare(dto.otp, user.otp);

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.isOnboarded = true;
    await user.save();

    return {
      message: 'OTP verified successfully',
      user,
    };
  }

  private resolveFinancialYear(dto: SignupDto) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const startYear = month >= 4 ? year : year - 1;
    const endYear = startYear + 1;

    const defaultFinancialYear = {
      id: `FY${startYear}-${endYear}`,
      label: `FY ${startYear} - ${endYear}`,
      range: `April 1, ${startYear} - March 31, ${endYear}`,
      startYear,
      endYear,
    };

    const resolvedFinancialYears = dto.financialYears?.length
      ? dto.financialYears
      : [defaultFinancialYear];

    const resolvedActiveFinancialYearId = resolvedFinancialYears.some(
      (fy) => fy.id === dto.activeFinancialYearId,
    )
      ? dto.activeFinancialYearId!
      : resolvedFinancialYears[0].id;

    return {
      financialYears: resolvedFinancialYears,
      activeFinancialYearId: resolvedActiveFinancialYearId,
    };
  }

  async signup(dto: SignupDto) {
    const normalizedGstin = dto.gstin?.trim().toUpperCase();

    const { financialYears, activeFinancialYearId } =
      this.resolveFinancialYear(dto);

    const user = await this.userModel.findOneAndUpdate(
      { $or: [{ email: dto.email }, { firebaseUid: dto.firebaseUid }] },
      {
        $set: {
          email: dto.email,
          firebaseUid: dto.firebaseUid,
          role: dto.role,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    const businessDetails =
      await this.userBusinessDetailsModel.findOneAndUpdate(
        { userId: user.id },
        {
          $set: {
            userId: user.id,
            contactPerson: dto.contactPerson,
            businessName: dto.businessName,
            gstin: normalizedGstin,
            phone: dto.phone,
            registeredAddress: dto.registeredAddress,
            state: dto.state,
            gstType: dto.gstType ?? GstType.GST_5,
            gstTaxMode: dto.gstTaxMode ?? TaxMode.CGST_SGST,
            financialYears,
            activeFinancialYearId,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );

    return {
      ...(user.toObject() as object),
      ...((businessDetails?.toObject() as object) || {}),
    };
  }
}
