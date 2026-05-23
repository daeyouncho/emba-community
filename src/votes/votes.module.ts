import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Vote } from './vote.entity';
import { Meeting } from '../meetings/meeting.entity';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote, Meeting]),
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  providers: [VotesService],
  controllers: [VotesController],
  exports: [VotesService],
})
export class VotesModule {}
