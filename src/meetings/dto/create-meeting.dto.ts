import { IsString, IsEnum, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { MeetingType } from '../meeting.entity';

export class CreateMeetingDto {
  @IsString()
  title: string;

  @IsOptional() @IsString()
  description?: string;

  @IsEnum(MeetingType)
  type: MeetingType;

  @IsOptional() @IsDateString()
  scheduledAt?: string;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsNumber()
  locationLat?: number;

  @IsOptional() @IsNumber()
  locationLng?: number;

  @IsOptional() @IsNumber()
  maxParticipants?: number;

  @IsOptional() @IsNumber()
  targetBirthYear?: number;

  @IsOptional() @IsDateString()
  voteDeadline?: string;

  @IsOptional() @IsNumber()
  quorumPercent?: number;
}
