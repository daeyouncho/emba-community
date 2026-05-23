import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Meeting } from './meeting.entity';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { MeetingsGateway } from './meetings.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meeting]),
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  providers: [MeetingsService, MeetingsGateway],
  controllers: [MeetingsController],
  exports: [MeetingsService, MeetingsGateway],
})
export class MeetingsModule {}
