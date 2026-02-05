/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/sign-up.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../db/schema/user.schema';
import { Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { generateOtp, hashOtp } from '../common/helper';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
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

    await this.mailerService.sendMail({
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

  async signup(dto: SignupDto) {
    try {
      const existingUser = await this.userModel.findOne({ email: dto.email });
      if (existingUser) {
        const updateUser = await this.userModel.findOneAndUpdate(
          {
            firebaseUid: dto.firebaseUid,
          },
          { ...dto },
          { new: true },
        );

        return updateUser;
      }

      const user = await this.userModel.create(dto);

      return user;
    } catch (error) {
      console.log(error);
      return;
    }
  }
}
