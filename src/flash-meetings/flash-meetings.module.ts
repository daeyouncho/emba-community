import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { FlashMeeting } from './flash-meeting.entity';
import { FlashMeetingsService } from './flash-meetings.service';
import { FlashMeetingsController } from './flash-meetings.controller';
import { MeetingsModule } from '../meetings/meetings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FlashMeeting]),
    BullModule.registerQueue({ name: 'notifications' }),
    MeetingsModule,
  ],
  providers: [FlashMeetingsService],
  controllers: [FlashMeetingsController],
  exports: [FlashMeetingsService],
})
export class FlashMeetingsModule {}
