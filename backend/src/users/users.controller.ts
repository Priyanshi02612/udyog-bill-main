/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { ResponseHandler } from '../common/response.handler';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/:firebaseUid')
  async getUserByFirebaseId(@Param('firebaseUid') firebaseUid: string) {
    try {
      const response = await this.usersService.getUserByFirebaseId(firebaseUid);
      return ResponseHandler.handle(response);
    } catch (error: any) {
      return ResponseHandler.handle(null, true, error.message, 400);
    }
  }
}
