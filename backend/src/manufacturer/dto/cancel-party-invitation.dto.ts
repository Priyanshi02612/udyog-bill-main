import { IsNotEmpty, IsString } from 'class-validator';

export class CancelPartyInvitationDto {
  @IsString()
  @IsNotEmpty()
  manufacturerUserId!: string;

  @IsString()
  @IsNotEmpty()
  partyEmail!: string;
}
