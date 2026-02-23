/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Post } from '@nestjs/common';
import { ResponseHandler } from '../common/response.handler';
import { AiService } from './ai.service';
import { GenerateInvoiceDraftDto } from './dto/generate-invoice-draft.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('/invoice-draft')
  async generateInvoiceDraft(@Body() dto: GenerateInvoiceDraftDto) {
    try {
      const response = await this.aiService.generateInvoiceDraft(
        dto.rawText,
        dto.manufacturerId,
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
