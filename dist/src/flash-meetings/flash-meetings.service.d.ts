import { Repository } from 'typeorm';
import { FlashMeeting } from './flash-meeting.entity';
import { CreateFlashMeetingDto } from './dto/create-flash-meeting.dto';
import { Queue } from 'bull';
import { MeetingsGateway } from '../meetings/meetings.gateway';
export declare class FlashMeetingsService {
    private flashRepo;
    private notificationsQueue;
    private meetingsGateway;
    constructor(flashRepo: Repository<FlashMeeting>, notificationsQueue: Queue, meetingsGateway: MeetingsGateway);
    create(dto: CreateFlashMeetingDto, hostId: string): Promise<FlashMeeting>;
    findNearby(lat: number, lng: number, radiusKm?: number): Promise<FlashMeeting[]>;
    join(id: string, userId: string): Promise<FlashMeeting>;
    expire(id: string): Promise<void>;
}
