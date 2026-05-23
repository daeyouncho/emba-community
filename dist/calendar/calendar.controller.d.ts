import { CalendarService } from './calendar.service';
import { User } from '../users/user.entity';
export declare class CalendarController {
    private readonly calendarService;
    constructor(calendarService: CalendarService);
    getAuthUrl(user: User): {
        url: string;
    };
    handleCallback(code: string, userId: string): Promise<{
        message: string;
    }>;
    addToCalendar(meetingId: string, user: User): Promise<string>;
}
