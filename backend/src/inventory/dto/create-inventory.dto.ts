import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

class CreateInventoryLineItemDto {
  @IsString()
  itemId!: string;

  @IsNumber()
  @Min(0)
  totalStock!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStock?: number;
}

export class CreateInventoryDto {
  @IsString()
  userId!: string;

  @IsString()
  collection!: string;

  @IsString()
  lotNumber!: string;

  @IsDateString()
  dateReceived!: string;

  @IsNumber()
  itemsCount!: number;

  @IsNumber()
  totalStock!: number;

  @IsNumber()
  totalValue!: number;

  @IsArray()
  @ArrayMinSize(1)
  inventoryItems!: CreateInventoryLineItemDto[];
}
