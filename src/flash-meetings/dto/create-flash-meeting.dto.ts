import { IsString, IsNumber, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class CreateFlashMeetingDto {
  @IsString()
  title: string;

  @IsOptional() @IsString()
  description?: string;

  @IsNumber() @Min(-90) @Max(90)
  latitude: number;

  @IsNumber() @Min(-180) @Max(180)
  longitude: number;

  @IsString()
  locationName: string;

  @IsOptional() @IsNumber() @Min(2)
  maxParticipants?: number;

  @IsOptional() @IsNumber() @Min(1) @Max(50)
  radiusKm?: number;

  @IsDateString()
  expiresAt: string;
}
