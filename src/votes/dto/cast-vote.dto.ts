import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { VoteChoice } from '../vote.entity';

export class CastVoteDto {
  @IsEnum(VoteChoice)
  choice: VoteChoice;

  @IsOptional() @IsDateString()
  preferredDate?: string;
}
