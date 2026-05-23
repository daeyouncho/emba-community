import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Meeting } from '../meetings/meeting.entity';
import { User } from '../users/user.entity';
export declare class CalendarService {
    private configService;
    private meetingsRepository;
    private usersRepository;
    private readonly logger;
    private readonly GOOGLE_TOKEN_URL;
    private readonly CALENDAR_API;
    constructor(configService: ConfigService, meetingsRepository: Repository<Meeting>, usersRepository: Repository<User>);
    getAuthUrl(userId: string): string;
    handleOAuthCallback(code: string, userId: string): Promise<void>;
    private refreshAccessToken;
    private exchangeCode;
    addMeetingToCalendar(meetingId: string, userId: string): Promise<string>;
    updateCalendarEvent(meetingId: string, userId: string): Promise<void>;
}
