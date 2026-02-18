import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptPartyInvitationDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  wholesalerUserId!: string;
}
