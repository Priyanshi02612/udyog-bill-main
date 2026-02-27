/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ResponseHandler } from '../common/response.handler';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceService } from './invoice.service';
import { PayInvoiceDto } from './dto/pay-invoice.dto';

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

  @Get('wholesaler/:userId')
  async getWholesalerInvoices(@Param('userId') userId: string) {
    try {
      const response = await this.invoiceService.getWholesalerInvoices(userId);
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

  @Put(':invoiceId')
  async updateInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() updateInvoiceDto: CreateInvoiceDto,
  ) {
    try {
      const response = await this.invoiceService.updateInvoice(
        invoiceId,
        updateInvoiceDto,
      );
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

  @Put(':invoiceId/pay')
  async payInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() dto: PayInvoiceDto,
  ) {
    try {
      const response = await this.invoiceService.markInvoiceAsPaid(
        invoiceId,
        dto.wholesalerUserId,
      );
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
}
