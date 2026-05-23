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
var CalendarService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meeting_entity_1 = require("../meetings/meeting.entity");
const user_entity_1 = require("../users/user.entity");
const axios_1 = require("axios");
let CalendarService = CalendarService_1 = class CalendarService {
    constructor(configService, meetingsRepository, usersRepository) {
        this.configService = configService;
        this.meetingsRepository = meetingsRepository;
        this.usersRepository = usersRepository;
        this.logger = new common_1.Logger(CalendarService_1.name);
        this.GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
        this.CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
    }
    getAuthUrl(userId) {
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const redirectUri = this.configService.get('GOOGLE_REDIRECT_URI');
        const scopes = ['https://www.googleapis.com/auth/calendar.events'];
        return `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent(scopes.join(' '))}&` +
            `access_type=offline&` +
            `state=${userId}`;
    }
    async handleOAuthCallback(code, userId) {
        const tokens = await this.exchangeCode(code);
        if (tokens.refresh_token) {
            await this.usersRepository.update(userId, { googleRefreshToken: tokens.refresh_token });
            this.logger.log(`구글 캘린더 연동 완료: userId=${userId}`);
        }
    }
    async refreshAccessToken(refreshToken) {
        const response = await axios_1.default.post(this.GOOGLE_TOKEN_URL, {
            client_id: this.configService.get('GOOGLE_CLIENT_ID'),
            client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        });
        return response.data.access_token;
    }
    async exchangeCode(code) {
        const response = await axios_1.default.post(this.GOOGLE_TOKEN_URL, {
            code,
            client_id: this.configService.get('GOOGLE_CLIENT_ID'),
            client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
            redirect_uri: this.configService.get('GOOGLE_REDIRECT_URI'),
            grant_type: 'authorization_code',
        });
        return response.data;
    }
    async addMeetingToCalendar(meetingId, userId) {
        const meeting = await this.meetingsRepository.findOne({ where: { id: meetingId } });
        if (!meeting)
            throw new common_1.BadRequestException('모임을 찾을 수 없습니다.');
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user?.googleRefreshToken)
            throw new common_1.BadRequestException('구글 캘린더 연동이 필요합니다.');
        const accessToken = await this.refreshAccessToken(user.googleRefreshToken);
        const startTime = meeting.scheduledAt || new Date();
        const endTime = new Date(startTime.getTime() + 2 * 3600000);
        const event = {
            summary: `[EMBA 동기모임] ${meeting.title}`,
            description: meeting.description || '',
            location: meeting.location || '',
            start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Seoul' },
            end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Seoul' },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 60 },
                    { method: 'email', minutes: 1440 },
                ],
            },
        };
        const response = await axios_1.default.post(`${this.CALENDAR_API}/calendars/primary/events`, event, { headers: { Authorization: `Bearer ${accessToken}` } });
        const eventId = response.data.id;
        await this.meetingsRepository.update(meetingId, { googleCalendarEventId: eventId });
        this.logger.log(`구글 캘린더 이벤트 생성: ${eventId}`);
        return eventId;
    }
    async updateCalendarEvent(meetingId, userId) {
        const meeting = await this.meetingsRepository.findOne({ where: { id: meetingId } });
        if (!meeting?.googleCalendarEventId)
            return;
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user?.googleRefreshToken)
            return;
        const accessToken = await this.refreshAccessToken(user.googleRefreshToken);
        const startTime = meeting.scheduledAt;
        const endTime = new Date(startTime.getTime() + 2 * 3600000);
        await axios_1.default.patch(`${this.CALENDAR_API}/calendars/primary/events/${meeting.googleCalendarEventId}`, {
            summary: `[EMBA 동기모임] ${meeting.title}`,
            start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Seoul' },
            end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Seoul' },
            location: meeting.location || '',
        }, { headers: { Authorization: `Bearer ${accessToken}` } });
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = CalendarService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(meeting_entity_1.Meeting)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map