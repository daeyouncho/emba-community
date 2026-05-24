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
exports.MeetingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meeting_entity_1 = require("./meeting.entity");
const bull_1 = require("@nestjs/bull");
let MeetingsService = class MeetingsService {
    constructor(meetingsRepository, notificationsQueue) {
        this.meetingsRepository = meetingsRepository;
        this.notificationsQueue = notificationsQueue;
    }
    async create(createMeetingDto, organizerId) {
        const meeting = this.meetingsRepository.create({
            ...createMeetingDto,
            scheduledAt: createMeetingDto.scheduledAt ? new Date(createMeetingDto.scheduledAt) : undefined,
            voteDeadline: createMeetingDto.voteDeadline ? new Date(createMeetingDto.voteDeadline) : undefined,
            quorumPercent: createMeetingDto.quorumPercent || 50,
            organizerId,
            status: createMeetingDto.type === meeting_entity_1.MeetingType.PROFESSOR ? meeting_entity_1.MeetingStatus.VOTING : meeting_entity_1.MeetingStatus.DRAFT,
        });
        const saved = await this.meetingsRepository.save(meeting);
        if (saved.type === meeting_entity_1.MeetingType.PROFESSOR) {
            await this.notificationsQueue.add('meeting-vote-started', {
                meetingId: saved.id,
                title: saved.title,
                voteDeadline: saved.voteDeadline,
            });
        }
        if (saved.type === meeting_entity_1.MeetingType.BIRTH_YEAR && saved.targetBirthYear) {
            await this.notificationsQueue.add('birth-year-meeting', {
                meetingId: saved.id,
                targetBirthYear: saved.targetBirthYear,
                title: saved.title,
            });
        }
        return saved;
    }
    async findAll(type) {
        const where = {};
        if (type)
            where.type = type;
        return this.meetingsRepository.find({
            where,
            relations: ['organizer'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const meeting = await this.meetingsRepository.findOne({ where: { id }, relations: ['organizer'] });
        if (!meeting)
            throw new common_1.NotFoundException('모임을 찾을 수 없습니다.');
        return meeting;
    }
    async confirm(id, userId) {
        const meeting = await this.findOne(id);
        if (meeting.organizerId !== userId)
            throw new common_1.ForbiddenException('주최자만 확정할 수 있습니다.');
        meeting.status = meeting_entity_1.MeetingStatus.CONFIRMED;
        const saved = await this.meetingsRepository.save(meeting);
        await this.notificationsQueue.add('meeting-confirmed', { meetingId: id, title: meeting.title });
        return saved;
    }
    async startVoting(id, userId) {
        const meeting = await this.findOne(id);
        if (meeting.organizerId !== userId)
            throw new common_1.ForbiddenException('주최자만 투표를 시작할 수 있습니다.');
        meeting.status = meeting_entity_1.MeetingStatus.VOTING;
        return this.meetingsRepository.save(meeting);
    }
    async remove(id) {
        const meeting = await this.meetingsRepository.findOne({ where: { id } });
        if (!meeting) throw new Error('모임을 찾을 수 없습니다');
        await this.meetingsRepository.remove(meeting);
        return { success: true };
    }
    async cancelMeeting(id) {
        const meeting = await this.meetingsRepository.findOne({ where: { id } });
        if (!meeting) throw new Error('모임을 찾을 수 없습니다');
        await this.meetingsRepository.remove(meeting);
        return { success: true, message: '삭제되었습니다' };
    }

};
exports.MeetingsService = MeetingsService;
exports.MeetingsService = MeetingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meeting_entity_1.Meeting)),
    __param(1, (0, bull_1.InjectQueue)('notifications')),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], MeetingsService);
//# sourceMappingURL=meetings.service.js.map