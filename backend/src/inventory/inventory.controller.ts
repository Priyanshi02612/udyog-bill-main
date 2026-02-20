/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ResponseHandler } from '../common/response.handler';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async createInventory(@Body() createInventoryDto: CreateInventoryDto) {
    try {
      const response =
        await this.inventoryService.createInventoryLot(createInventoryDto);
      return ResponseHandler.handle(response);
    } catch (error: any) {
      return ResponseHandler.handle(null, true, error.message, 400);
    }
  }

  @Get('/:userId')
  async getUsersInventory(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    try {
      const response = await this.inventoryService.getUsersInventoryLots(
        userId,
        Number(page),
        Number(limit),
      );
      return ResponseHandler.handle(response);
    } catch (error: any) {
      return ResponseHandler.handle(null, true, error.message, 400);
    }
  }
}
