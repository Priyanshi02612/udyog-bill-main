import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { GstType, InvoiceSubmitStatus, TaxMode } from '../../common/enums';

class CreateInvoiceLineItemDto {
  @IsString()
  itemId!: string;

  @IsNumber()
  @Min(0.0001)
  quantity!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  gstPercentage!: number;

  @IsNumber()
  @Min(0)
  taxableAmount!: number;
}

export class CreateInvoiceDto {
  @IsString()
  invoiceNumber!: string;

  @IsString()
  sellerId!: string;

  @IsString()
  buyerId!: string;

  @IsDateString()
  invoiceDate!: string;

  @IsString()
  financialYear!: string;

  @IsEnum(InvoiceSubmitStatus)
  status!: InvoiceSubmitStatus;

  @IsEnum(GstType)
  gstType!: GstType;

  @IsOptional()
  @IsEnum(TaxMode)
  taxMode?: TaxMode;

  @IsNumber()
  @Min(0)
  cgstRate!: number;

  @IsNumber()
  @Min(0)
  sgstRate!: number;

  @IsNumber()
  @Min(0)
  igstRate!: number;

  @IsNumber()
  @Min(0)
  totalTaxAmount!: number;

  @IsNumber()
  @Min(0)
  subtotal!: number;

  @IsNumber()
  roundOff!: number;

  @IsNumber()
  @Min(0)
  total!: number;

  @IsArray()
  @ArrayMinSize(1)
  items!: CreateInvoiceLineItemDto[];
}
