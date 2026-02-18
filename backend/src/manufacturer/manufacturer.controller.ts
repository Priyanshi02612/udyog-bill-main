/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Post } from '@nestjs/common';
import { ResponseHandler } from '../common/response.handler';
import { ManufacturerService } from './manufacturer.service';
import { AddPartyDto } from './dto/add-party.dto';
import { AcceptPartyInvitationDto } from './dto/accept-party-invitation.dto';

@Controller('manufacturer')
export class ManufacturerController {
  constructor(private readonly manufacturerService: ManufacturerService) {}

  @Post('add-party')
  async addParty(@Body() dto: AddPartyDto) {
    try {
      const response = await this.manufacturerService.addParty(dto);
      return ResponseHandler.handle(response);
    } catch (error: any) {
      return ResponseHandler.handle(null, true, error.message, 400);
    }
  }

  @Post('accept-invitation')
  async acceptInvitation(@Body() dto: AcceptPartyInvitationDto) {
    try {
      const response = await this.manufacturerService.acceptInvitation(dto);
      return ResponseHandler.handle(response);
    } catch (error: any) {
      return ResponseHandler.handle(null, true, error.message, 400);
    }
  }
}
