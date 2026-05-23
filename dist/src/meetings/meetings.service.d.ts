import { Repository } from 'typeorm';
import { Meeting, MeetingType } from './meeting.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { Queue } from 'bull';
export declare class MeetingsService {
    private meetingsRepository;
    private notificationsQueue;
    constructor(meetingsRepository: Repository<Meeting>, notificationsQueue: Queue);
    create(createMeetingDto: CreateMeetingDto, organizerId: string): Promise<Meeting>;
    findAll(type?: MeetingType): Promise<Meeting[]>;
    findOne(id: string): Promise<Meeting>;
    confirm(id: string, userId: string): Promise<Meeting>;
    startVoting(id: string, userId: string): Promise<Meeting>;
}
