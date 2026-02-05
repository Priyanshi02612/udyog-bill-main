/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/sign-up.dto';
import { ResponseHandler } from '../common/response.handler';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOTP(@Body() data: { email: string }) {
    try {
      const response = await this.authService.sendOTP(data);
      return ResponseHandler.handle(response);
    } catch (error: any) {
      return ResponseHandler.handle(null, true, error.message, 400);
    }
  }

  @Post('verify-otp')
  async verifyOTP(@Body() dto: VerifyOtpDto) {
    try {
      const user = await this.authService.verifyOTP(dto);
      return ResponseHandler.handle(user);
    } catch (error: any) {
      return ResponseHandler.handle(null, true, error.message, 400);
    }
  }

  @Post('signup')
  async signUp(@Body() dto: SignupDto) {
    try {
      const user = await this.authService.signup(dto);
      return ResponseHandler.handle(user);
    } catch (error: any) {
      return ResponseHandler.handle(null, true, error.message, 400);
    }
  }
}
