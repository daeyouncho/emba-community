import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from '../meetings/meeting.entity';
import { User } from '../users/user.entity';
import axios from 'axios';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private readonly GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
  private readonly CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

  constructor(
    private configService: ConfigService,
    @InjectRepository(Meeting)
    private meetingsRepository: Repository<Meeting>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Google OAuth 인증 URL 생성
  getAuthUrl(userId: string): string {
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

  // OAuth 콜백 처리
  async handleOAuthCallback(code: string, userId: string): Promise<void> {
    const tokens = await this.exchangeCode(code);
    if (tokens.refresh_token) {
      await this.usersRepository.update(userId, { googleRefreshToken: tokens.refresh_token });
      this.logger.log(`구글 캘린더 연동 완료: userId=${userId}`);
    }
  }

  // Access Token 갱신
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await axios.post<GoogleTokenResponse>(this.GOOGLE_TOKEN_URL, {
      client_id: this.configService.get('GOOGLE_CLIENT_ID'),
      client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });
    return response.data.access_token;
  }

  private async exchangeCode(code: string): Promise<GoogleTokenResponse> {
    const response = await axios.post<GoogleTokenResponse>(this.GOOGLE_TOKEN_URL, {
      code,
      client_id: this.configService.get('GOOGLE_CLIENT_ID'),
      client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
      redirect_uri: this.configService.get('GOOGLE_REDIRECT_URI'),
      grant_type: 'authorization_code',
    });
    return response.data;
  }

  // 모임을 구글 캘린더에 추가
  async addMeetingToCalendar(meetingId: string, userId: string): Promise<string> {
    const meeting = await this.meetingsRepository.findOne({ where: { id: meetingId } });
    if (!meeting) throw new BadRequestException('모임을 찾을 수 없습니다.');

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user?.googleRefreshToken) throw new BadRequestException('구글 캘린더 연동이 필요합니다.');

    const accessToken = await this.refreshAccessToken(user.googleRefreshToken);
    const startTime = meeting.scheduledAt || new Date();
    const endTime = new Date(startTime.getTime() + 2 * 3600000); // 기본 2시간

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
          { method: 'email', minutes: 1440 }, // 하루 전
        ],
      },
    };

    const response = await axios.post(
      `${this.CALENDAR_API}/calendars/primary/events`,
      event,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    const eventId = response.data.id;
    await this.meetingsRepository.update(meetingId, { googleCalendarEventId: eventId });
    this.logger.log(`구글 캘린더 이벤트 생성: ${eventId}`);
    return eventId;
  }

  // 모임 일정 변경 시 캘린더 업데이트
  async updateCalendarEvent(meetingId: string, userId: string): Promise<void> {
    const meeting = await this.meetingsRepository.findOne({ where: { id: meetingId } });
    if (!meeting?.googleCalendarEventId) return;

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user?.googleRefreshToken) return;

    const accessToken = await this.refreshAccessToken(user.googleRefreshToken);
    const startTime = meeting.scheduledAt;
    const endTime = new Date(startTime.getTime() + 2 * 3600000);

    await axios.patch(
      `${this.CALENDAR_API}/calendars/primary/events/${meeting.googleCalendarEventId}`,
      {
        summary: `[EMBA 동기모임] ${meeting.title}`,
        start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Seoul' },
        end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Seoul' },
        location: meeting.location || '',
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  }
}
