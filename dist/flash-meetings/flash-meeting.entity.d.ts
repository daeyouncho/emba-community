import { User } from '../users/user.entity';
export declare enum FlashMeetingStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELLED = "cancelled"
}
export declare class FlashMeeting {
    id: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    locationName: string;
    maxParticipants: number;
    currentParticipants: number;
    radiusKm: number;
    expiresAt: Date;
    status: FlashMeetingStatus;
    host: User;
    hostId: string;
    createdAt: Date;
}
