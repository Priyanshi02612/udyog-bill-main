import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateItemDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsString()
  unit!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  gstPercentage!: number;

  @IsNumber()
  @Min(0)
  hsnCode!: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  materialType?: string;

  @IsOptional()
  @IsString()
  designPattern?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  ownerId?: string;
}
