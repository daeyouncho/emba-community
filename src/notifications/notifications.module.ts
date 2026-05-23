import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationProcessor } from './processors/notification.processor';
import { KakaoAlimtalkService } from './kakao-alimtalk.service';
import { User } from '../users/user.entity';
import { MeetingsModule } from '../meetings/meetings.module';
import { FlashMeetingsModule } from '../flash-meetings/flash-meetings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({ name: 'notifications' }),
    MeetingsModule,
    FlashMeetingsModule,
  ],
  providers: [NotificationProcessor, KakaoAlimtalkService],
  exports: [KakaoAlimtalkService],
})
export class NotificationsModule {}
