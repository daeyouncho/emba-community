import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KakaoAlimtalkService } from '../kakao-alimtalk.service';
import { User } from '../../users/user.entity';
import { FlashMeetingsService } from '../../flash-meetings/flash-meetings.service';
import { MeetingsGateway } from '../../meetings/meetings.gateway';

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private kakaoService: KakaoAlimtalkService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private flashMeetingsService: FlashMeetingsService,
    private meetingsGateway: MeetingsGateway,
  ) {}

  @Process('meeting-vote-started')
  async handleVoteStarted(job: Job<{ meetingId: string; title: string; voteDeadline?: Date }>) {
    this.logger.log(`[투표시작] meetingId=${job.data.meetingId}`);
    const users = await this.usersRepository.find({ where: { isActive: true, notificationEnabled: true } });
    const deadline = job.data.voteDeadline
      ? new Date(job.data.voteDeadline).toLocaleDateString('ko-KR')
      : '미정';

    for (const user of users) {
      if (user.phone) {
        await this.kakaoService.sendAlimtalk([{
          receiver: user.phone,
          templateCode: 'MEETING_VOTE_START',
          variables: { name: user.name, title: job.data.title, deadline },
        }]);
      }
    }
    this.logger.log(`[투표시작] ${users.length}명 알림 완료`);
  }

  @Process('meeting-confirmed')
  async handleMeetingConfirmed(job: Job<{ meetingId: string; message?: string; title?: string }>) {
    this.logger.log(`[모임확정] meetingId=${job.data.meetingId}`);
    this.meetingsGateway.emitMeetingConfirmed(job.data.meetingId, { title: job.data.title || job.data.message });

    const users = await this.usersRepository.find({ where: { isActive: true, notificationEnabled: true } });
    for (const user of users) {
      if (user.phone) {
        await this.kakaoService.sendAlimtalk([{
          receiver: user.phone,
          templateCode: 'MEETING_CONFIRMED',
          variables: { name: user.name, title: job.data.title || '모임', date: '추후 공지', location: '추후 공지' },
        }]);
      }
    }
  }

  @Process('flash-meeting-nearby')
  async handleFlashMeetingNearby(job: Job<{ flashMeetingId: string; latitude: number; longitude: number; radiusKm: number; title: string; locationName: string }>) {
    this.logger.log(`[번개모임] 주변 사용자 검색`);
    const nearbyUsers = await this.usersRepository
      .createQueryBuilder('user')
      .where(`
        (6371 * acos(
          cos(radians(:lat)) * cos(radians(user.latitude)) *
          cos(radians(user.longitude) - radians(:lng)) +
          sin(radians(:lat)) * sin(radians(user.latitude))
        )) < :radius
      `, { lat: job.data.latitude, lng: job.data.longitude, radius: job.data.radiusKm })
      .andWhere('user.isActive = true')
      .andWhere('user.notificationEnabled = true')
      .getMany();

    this.logger.log(`[번개모임] ${nearbyUsers.length}명에게 알림`);
    for (const user of nearbyUsers) {
      if (user.phone) {
        await this.kakaoService.sendAlimtalk([{
          receiver: user.phone,
          templateCode: 'FLASH_MEETING_NEARBY',
          variables: { name: user.name, title: job.data.title, location: job.data.locationName, radius: String(job.data.radiusKm), expires_at: '1시간 후' },
        }]);
      }
    }
  }

  @Process('birth-year-meeting')
  async handleBirthYearMeeting(job: Job<{ meetingId: string; targetBirthYear: number; title: string }>) {
    this.logger.log(`[년생모임] ${job.data.targetBirthYear}년생 알림`);
    const users = await this.usersRepository.find({
      where: { birthYear: job.data.targetBirthYear, isActive: true, notificationEnabled: true },
    });
    for (const user of users) {
      if (user.phone) {
        await this.kakaoService.sendAlimtalk([{
          receiver: user.phone,
          templateCode: 'BIRTH_YEAR_MEETING',
          variables: { name: user.name, birth_year: String(job.data.targetBirthYear), title: job.data.title, date: '추후 공지', location: '추후 공지' },
        }]);
      }
    }
  }

  @Process('flash-meeting-expire')
  async handleFlashMeetingExpire(job: Job<{ id: string }>) {
    this.logger.log(`[번개모임만료] id=${job.data.id}`);
    await this.flashMeetingsService.expire(job.data.id);
  }
}
