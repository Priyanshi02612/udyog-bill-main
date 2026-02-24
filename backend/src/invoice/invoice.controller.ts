/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Post } from '@nestjs/common';
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
}
