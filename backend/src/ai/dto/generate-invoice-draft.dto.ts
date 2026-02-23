import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateInvoiceDraftDto {
  @IsString()
  @IsNotEmpty()
  rawText!: string;

  @IsString()
  manufacturerId!: string;
}
