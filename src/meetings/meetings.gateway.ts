import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { FlashMeeting } from '../flash-meetings/flash-meeting.entity';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/meetings',
})
export class MeetingsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MeetingsGateway.name);
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-meeting-room')
  handleJoinRoom(@MessageBody() data: { meetingId: string; userId: string }, @ConnectedSocket() client: Socket) {
    client.join(`meeting:${data.meetingId}`);
    this.connectedUsers.set(client.id, data.userId);
    client.emit('joined', { meetingId: data.meetingId });
  }

  @SubscribeMessage('update-location')
  handleLocationUpdate(@MessageBody() data: { userId: string; lat: number; lng: number }, @ConnectedSocket() client: Socket) {
    // 위치 업데이트를 브로드캐스트
    this.server.emit('user-location-updated', data);
  }

  // 투표 결과 실시간 업데이트
  emitVoteUpdate(meetingId: string, voteResult: any) {
    this.server.to(`meeting:${meetingId}`).emit('vote-updated', voteResult);
  }

  // 모임 확정 알림
  emitMeetingConfirmed(meetingId: string, meeting: any) {
    this.server.to(`meeting:${meetingId}`).emit('meeting-confirmed', meeting);
    this.server.emit('meeting-confirmed-global', { meetingId, title: meeting.title });
  }

  // 번개 모임 생성 알림
  emitFlashMeetingCreated(flashMeeting: FlashMeeting) {
    this.server.emit('flash-meeting-created', {
      id: flashMeeting.id,
      title: flashMeeting.title,
      locationName: flashMeeting.locationName,
      latitude: flashMeeting.latitude,
      longitude: flashMeeting.longitude,
      radiusKm: flashMeeting.radiusKm,
      expiresAt: flashMeeting.expiresAt,
      maxParticipants: flashMeeting.maxParticipants,
      currentParticipants: flashMeeting.currentParticipants,
    });
  }

  // 번개 모임 참여자 수 업데이트
  emitFlashMeetingUpdated(flashMeeting: FlashMeeting) {
    this.server.emit('flash-meeting-updated', {
      id: flashMeeting.id,
      currentParticipants: flashMeeting.currentParticipants,
      maxParticipants: flashMeeting.maxParticipants,
    });
  }
}
