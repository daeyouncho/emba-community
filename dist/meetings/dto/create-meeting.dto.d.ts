import { MeetingType } from '../meeting.entity';
export declare class CreateMeetingDto {
    title: string;
    description?: string;
    type: MeetingType;
    scheduledAt?: string;
    location?: string;
    locationLat?: number;
    locationLng?: number;
    maxParticipants?: number;
    targetBirthYear?: number;
    voteDeadline?: string;
    quorumPercent?: number;
}
