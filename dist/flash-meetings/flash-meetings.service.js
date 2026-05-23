"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashMeetingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const flash_meeting_entity_1 = require("./flash-meeting.entity");
const bull_1 = require("@nestjs/bull");
const meetings_gateway_1 = require("../meetings/meetings.gateway");
let FlashMeetingsService = class FlashMeetingsService {
    constructor(flashRepo, notificationsQueue, meetingsGateway) {
        this.flashRepo = flashRepo;
        this.notificationsQueue = notificationsQueue;
        this.meetingsGateway = meetingsGateway;
    }
    async create(dto, hostId) {
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
    async findNearby(lat, lng, radiusKm = 5) {
        return this.flashRepo
            .createQueryBuilder('fm')
            .where(`
        (6371 * acos(
          cos(radians(:lat)) * cos(radians(fm.latitude)) *
          cos(radians(fm.longitude) - radians(:lng)) +
          sin(radians(:lat)) * sin(radians(fm.latitude))
        )) < :radius
      `, { lat, lng, radius: radiusKm })
            .andWhere('fm.status = :status', { status: flash_meeting_entity_1.FlashMeetingStatus.ACTIVE })
            .andWhere('fm.expiresAt > :now', { now: new Date() })
            .leftJoinAndSelect('fm.host', 'host')
            .getMany();
    }
    async join(id, userId) {
        const flash = await this.flashRepo.findOne({ where: { id } });
        if (!flash)
            throw new common_1.NotFoundException('번개 모임을 찾을 수 없습니다.');
        if (flash.status !== flash_meeting_entity_1.FlashMeetingStatus.ACTIVE)
            throw new common_1.BadRequestException('참여할 수 없는 모임입니다.');
        if (new Date() > flash.expiresAt)
            throw new common_1.BadRequestException('만료된 모임입니다.');
        if (flash.currentParticipants >= flash.maxParticipants)
            throw new common_1.BadRequestException('인원이 가득 찼습니다.');
        await this.flashRepo.increment({ id }, 'currentParticipants', 1);
        const updated = await this.flashRepo.findOne({ where: { id } });
        this.meetingsGateway.emitFlashMeetingUpdated(updated);
        return updated;
    }
    async expire(id) {
        await this.flashRepo.update(id, { status: flash_meeting_entity_1.FlashMeetingStatus.EXPIRED });
    }
};
exports.FlashMeetingsService = FlashMeetingsService;
exports.FlashMeetingsService = FlashMeetingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(flash_meeting_entity_1.FlashMeeting)),
    __param(1, (0, bull_1.InjectQueue)('notifications')),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object, meetings_gateway_1.MeetingsGateway])
], FlashMeetingsService);
//# sourceMappingURL=flash-meetings.service.js.map