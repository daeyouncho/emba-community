import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FlashMeeting } from '../flash-meetings/flash-meeting.entity';
export declare class MeetingsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private connectedUsers;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(data: {
        meetingId: string;
        userId: string;
    }, client: Socket): void;
    handleLocationUpdate(data: {
        userId: string;
        lat: number;
        lng: number;
    }, client: Socket): void;
    emitVoteUpdate(meetingId: string, voteResult: any): void;
    emitMeetingConfirmed(meetingId: string, meeting: any): void;
    emitFlashMeetingCreated(flashMeeting: FlashMeeting): void;
    emitFlashMeetingUpdated(flashMeeting: FlashMeeting): void;
}
