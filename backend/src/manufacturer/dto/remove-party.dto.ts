import { IsNotEmpty, IsString } from 'class-validator';

export class RemovePartyDto {
  @IsString()
  @IsNotEmpty()
  manufacturerUserId!: string;

  @IsString()
  @IsNotEmpty()
  wholesalerUserId!: string;
}
