import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AddPartyDto {
  @IsString()
  @IsNotEmpty()
  manufacturerUserId!: string;

  @IsEmail()
  @IsNotEmpty()
  partyEmail!: string;
}
