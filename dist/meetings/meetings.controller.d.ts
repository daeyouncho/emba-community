import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { MeetingType } from './meeting.entity';
import { User } from '../users/user.entity';
export declare class MeetingsController {
    private readonly meetingsService;
    constructor(meetingsService: MeetingsService);
    create(dto: CreateMeetingDto, user: User): Promise<import("./meeting.entity").Meeting>;
    findAll(type?: MeetingType): Promise<import("./meeting.entity").Meeting[]>;
    findOne(id: string): Promise<import("./meeting.entity").Meeting>;
    confirm(id: string, user: User): Promise<import("./meeting.entity").Meeting>;
    startVoting(id: string, user: User): Promise<import("./meeting.entity").Meeting>;
}
