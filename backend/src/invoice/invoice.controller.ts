/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ResponseHandler } from '../common/response.handler';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    try {
      const response =
        await this.invoiceService.createInvoice(createInvoiceDto);
      return ResponseHandler.handle(response);
    } catch (error: any) {
      if (error.response) {
        return ResponseHandler.handle(
          null,
          true,
          error.response.message,
          error.status || 400,
          error.response.errorFields || [],
        );
      }

      return ResponseHandler.handle(
        null,
        true,
        error.message || 'Unexpected error',
        400,
      );
    }
  }

  @Get('manufacturer/:userId')
  async getManufacturerInvoices(@Param('userId') userId: string) {
    try {
      const response =
        await this.invoiceService.getManufacturerInvoices(userId);
      return ResponseHandler.handle(response);
    } catch (error: any) {
      return ResponseHandler.handle(null, true, error.message, 400);
    }
  }

  @Get(':invoiceId')
  async getInvoiceDetails(@Param('invoiceId') invoiceId: string) {
    try {
      const response = await this.invoiceService.getInvoiceDetails(invoiceId);
      return ResponseHandler.handle(response);
    } catch (error: any) {
      return ResponseHandler.handle(null, true, error.message, 400);
    }
  }
}
