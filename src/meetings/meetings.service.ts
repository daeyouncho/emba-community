import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting, MeetingType, MeetingStatus } from './meeting.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private meetingsRepository: Repository<Meeting>,
    @InjectQueue('notifications')
    private notificationsQueue: Queue,
  ) {}

  async create(createMeetingDto: CreateMeetingDto, organizerId: string): Promise<Meeting> {
    const meeting = this.meetingsRepository.create({
      ...createMeetingDto,
      scheduledAt: createMeetingDto.scheduledAt ? new Date(createMeetingDto.scheduledAt) : undefined,
      voteDeadline: createMeetingDto.voteDeadline ? new Date(createMeetingDto.voteDeadline) : undefined,
      quorumPercent: createMeetingDto.quorumPercent || 50,
      organizerId,
      status: createMeetingDto.type === MeetingType.PROFESSOR ? MeetingStatus.VOTING : MeetingStatus.DRAFT,
    });

    const saved = await this.meetingsRepository.save(meeting);

    // 교수님 모임이면 즉시 투표 시작 알림
    if (saved.type === MeetingType.PROFESSOR) {
      await this.notificationsQueue.add('meeting-vote-started', {
        meetingId: saved.id,
        title: saved.title,
        voteDeadline: saved.voteDeadline,
      });
    }

    // 년생 모임이면 해당 년생에게 알림
    if (saved.type === MeetingType.BIRTH_YEAR && saved.targetBirthYear) {
      await this.notificationsQueue.add('birth-year-meeting', {
        meetingId: saved.id,
        targetBirthYear: saved.targetBirthYear,
        title: saved.title,
      });
    }

    return saved;
  }

  async findAll(type?: MeetingType): Promise<Meeting[]> {
    const where: any = {};
    if (type) where.type = type;
    return this.meetingsRepository.find({
      where,
      relations: ['organizer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Meeting> {
    const meeting = await this.meetingsRepository.findOne({ where: { id }, relations: ['organizer'] });
    if (!meeting) throw new NotFoundException('모임을 찾을 수 없습니다.');
    return meeting;
  }

  async confirm(id: string, userId: string): Promise<Meeting> {
    const meeting = await this.findOne(id);
    if (meeting.organizerId !== userId) throw new ForbiddenException('주최자만 확정할 수 있습니다.');
    meeting.status = MeetingStatus.CONFIRMED;
    const saved = await this.meetingsRepository.save(meeting);
    await this.notificationsQueue.add('meeting-confirmed', { meetingId: id, title: meeting.title });
    return saved;
  }

  async startVoting(id: string, userId: string): Promise<Meeting> {
    const meeting = await this.findOne(id);
    if (meeting.organizerId !== userId) throw new ForbiddenException('주최자만 투표를 시작할 수 있습니다.');
    meeting.status = MeetingStatus.VOTING;
    return this.meetingsRepository.save(meeting);
  }
}
