import { User } from '../users/user.entity';
export declare enum MeetingType {
    PROFESSOR = "professor",
    BIRTH_YEAR = "birth_year",
    FLASH = "flash",
    GENERAL = "general"
}
export declare enum MeetingStatus {
    DRAFT = "draft",
    VOTING = "voting",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}
export declare class Meeting {
    id: string;
    title: string;
    description: string;
    type: MeetingType;
    status: MeetingStatus;
    scheduledAt: Date;
    location: string;
    locationLat: number;
    locationLng: number;
    maxParticipants: number;
    targetBirthYear: number;
    voteDeadline: Date;
    quorumPercent: number;
    organizer: User;
    organizerId: string;
    googleCalendarEventId: string;
    createdAt: Date;
    updatedAt: Date;
}
