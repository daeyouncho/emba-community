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
var NotificationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const kakao_alimtalk_service_1 = require("../kakao-alimtalk.service");
const user_entity_1 = require("../../users/user.entity");
const flash_meetings_service_1 = require("../../flash-meetings/flash-meetings.service");
const meetings_gateway_1 = require("../../meetings/meetings.gateway");
let NotificationProcessor = NotificationProcessor_1 = class NotificationProcessor {
    constructor(kakaoService, usersRepository, flashMeetingsService, meetingsGateway) {
        this.kakaoService = kakaoService;
        this.usersRepository = usersRepository;
        this.flashMeetingsService = flashMeetingsService;
        this.meetingsGateway = meetingsGateway;
        this.logger = new common_1.Logger(NotificationProcessor_1.name);
    }
    async handleVoteStarted(job) {
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
    async handleMeetingConfirmed(job) {
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
    async handleFlashMeetingNearby(job) {
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
    async handleBirthYearMeeting(job) {
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
    async handleFlashMeetingExpire(job) {
        this.logger.log(`[번개모임만료] id=${job.data.id}`);
        await this.flashMeetingsService.expire(job.data.id);
    }
};
exports.NotificationProcessor = NotificationProcessor;
__decorate([
    (0, bull_1.Process)('meeting-vote-started'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationProcessor.prototype, "handleVoteStarted", null);
__decorate([
    (0, bull_1.Process)('meeting-confirmed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationProcessor.prototype, "handleMeetingConfirmed", null);
__decorate([
    (0, bull_1.Process)('flash-meeting-nearby'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationProcessor.prototype, "handleFlashMeetingNearby", null);
__decorate([
    (0, bull_1.Process)('birth-year-meeting'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationProcessor.prototype, "handleBirthYearMeeting", null);
__decorate([
    (0, bull_1.Process)('flash-meeting-expire'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationProcessor.prototype, "handleFlashMeetingExpire", null);
exports.NotificationProcessor = NotificationProcessor = NotificationProcessor_1 = __decorate([
    (0, bull_1.Processor)('notifications'),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [kakao_alimtalk_service_1.KakaoAlimtalkService,
        typeorm_2.Repository,
        flash_meetings_service_1.FlashMeetingsService,
        meetings_gateway_1.MeetingsGateway])
], NotificationProcessor);
//# sourceMappingURL=notification.processor.js.map