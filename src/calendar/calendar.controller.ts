import { Controller, Get, Post, Param, Query, UseGuards, Redirect } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('auth')
  @UseGuards(JwtAuthGuard)
  getAuthUrl(@CurrentUser() user: User) {
    return { url: this.calendarService.getAuthUrl(user.id) };
  }

  @Get('callback')
  async handleCallback(@Query('code') code: string, @Query('state') userId: string) {
    await this.calendarService.handleOAuthCallback(code, userId);
    return { message: '구글 캘린더 연동이 완료되었습니다!' };
  }

  @Post('meetings/:meetingId/add')
  @UseGuards(JwtAuthGuard)
  addToCalendar(@Param('meetingId') meetingId: string, @CurrentUser() user: User) {
    return this.calendarService.addMeetingToCalendar(meetingId, user.id);
  }
}
