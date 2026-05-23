import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { FlashMeetingsService } from './flash-meetings.service';
import { CreateFlashMeetingDto } from './dto/create-flash-meeting.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('flash-meetings')
@UseGuards(JwtAuthGuard)
export class FlashMeetingsController {
  constructor(private readonly service: FlashMeetingsService) {}

  @Post()
  create(@Body() dto: CreateFlashMeetingDto, @CurrentUser() user: User) {
    return this.service.create(dto, user.id);
  }

  @Get('nearby')
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
  ) {
    return this.service.findNearby(Number(lat), Number(lng), Number(radius) || 5);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.join(id, user.id);
  }
}
