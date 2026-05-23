import { FlashMeetingsService } from './flash-meetings.service';
import { CreateFlashMeetingDto } from './dto/create-flash-meeting.dto';
import { User } from '../users/user.entity';
export declare class FlashMeetingsController {
    private readonly service;
    constructor(service: FlashMeetingsService);
    create(dto: CreateFlashMeetingDto, user: User): Promise<import("./flash-meeting.entity").FlashMeeting>;
    findNearby(lat: string, lng: string, radius: string): Promise<import("./flash-meeting.entity").FlashMeeting[]>;
    join(id: string, user: User): Promise<import("./flash-meeting.entity").FlashMeeting>;
}
