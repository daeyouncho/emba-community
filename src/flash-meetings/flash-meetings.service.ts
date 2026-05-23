import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashMeeting, FlashMeetingStatus } from './flash-meeting.entity';
import { CreateFlashMeetingDto } from './dto/create-flash-meeting.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MeetingsGateway } from '../meetings/meetings.gateway';

@Injectable()
export class FlashMeetingsService {
  constructor(
    @InjectRepository(FlashMeeting)
    private flashRepo: Repository<FlashMeeting>,
    @InjectQueue('notifications')
    private notificationsQueue: Queue,
    private meetingsGateway: MeetingsGateway,
  ) {}

  async create(dto: CreateFlashMeetingDto, hostId: string): Promise<FlashMeeting> {
    const flash = this.flashRepo.create({
      ...dto,
      expiresAt: new Date(dto.expiresAt),
      radiusKm: dto.radiusKm || 3,
      maxParticipants: dto.maxParticipants || 5,
      hostId,
    });

    const saved = await this.flashRepo.save(flash);
    this.meetingsGateway.emitFlashMeetingCreated(saved);

    await this.notificationsQueue.add('flash-meeting-nearby', {
      flashMeetingId: saved.id,
      latitude: saved.latitude,
      longitude: saved.longitude,
      radiusKm: saved.radiusKm,
      title: saved.title,
      locationName: saved.locationName,
    });

    const delay = new Date(dto.expiresAt).getTime() - Date.now();
    if (delay > 0) {
      await this.notificationsQueue.add('flash-meeting-expire', { id: saved.id }, { delay });
    }

    return saved;
  }

  async findNearby(lat: number, lng: number, radiusKm = 5): Promise<FlashMeeting[]> {
    return this.flashRepo
      .createQueryBuilder('fm')
      .where(`
        (6371 * acos(
          cos(radians(:lat)) * cos(radians(fm.latitude)) *
          cos(radians(fm.longitude) - radians(:lng)) +
          sin(radians(:lat)) * sin(radians(fm.latitude))
        )) < :radius
      `, { lat, lng, radius: radiusKm })
      .andWhere('fm.status = :status', { status: FlashMeetingStatus.ACTIVE })
      .andWhere('fm.expiresAt > :now', { now: new Date() })
      .leftJoinAndSelect('fm.host', 'host')
      .getMany();
  }

  async join(id: string, userId: string): Promise<FlashMeeting> {
    const flash = await this.flashRepo.findOne({ where: { id } });
    if (!flash) throw new NotFoundException('번개 모임을 찾을 수 없습니다.');
    if (flash.status !== FlashMeetingStatus.ACTIVE) throw new BadRequestException('참여할 수 없는 모임입니다.');
    if (new Date() > flash.expiresAt) throw new BadRequestException('만료된 모임입니다.');
    if (flash.currentParticipants >= flash.maxParticipants) throw new BadRequestException('인원이 가득 찼습니다.');

    await this.flashRepo.increment({ id }, 'currentParticipants', 1);
    const updated = await this.flashRepo.findOne({ where: { id } });
    this.meetingsGateway.emitFlashMeetingUpdated(updated);
    return updated;
  }

  async expire(id: string): Promise<void> {
    await this.flashRepo.update(id, { status: FlashMeetingStatus.EXPIRED });
  }
}
