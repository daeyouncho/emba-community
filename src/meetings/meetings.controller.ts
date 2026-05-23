import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MeetingType } from './meeting.entity';
import { User } from '../users/user.entity';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  create(@Body() dto: CreateMeetingDto, @CurrentUser() user: User) {
    return this.meetingsService.create(dto, user.id);
  }

  @Get()
  findAll(@Query('type') type?: MeetingType) {
    return this.meetingsService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id);
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string, @CurrentUser() user: User) {
    return this.meetingsService.confirm(id, user.id);
  }

  @Patch(':id/start-voting')
  startVoting(@Param('id') id: string, @CurrentUser() user: User) {
    return this.meetingsService.startVoting(id, user.id);
  }
}
