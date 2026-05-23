"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MeetingsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let MeetingsGateway = MeetingsGateway_1 = class MeetingsGateway {
    constructor() {
        this.logger = new common_1.Logger(MeetingsGateway_1.name);
        this.connectedUsers = new Map();
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.connectedUsers.delete(client.id);
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleJoinRoom(data, client) {
        client.join(`meeting:${data.meetingId}`);
        this.connectedUsers.set(client.id, data.userId);
        client.emit('joined', { meetingId: data.meetingId });
    }
    handleLocationUpdate(data, client) {
        this.server.emit('user-location-updated', data);
    }
    emitVoteUpdate(meetingId, voteResult) {
        this.server.to(`meeting:${meetingId}`).emit('vote-updated', voteResult);
    }
    emitMeetingConfirmed(meetingId, meeting) {
        this.server.to(`meeting:${meetingId}`).emit('meeting-confirmed', meeting);
        this.server.emit('meeting-confirmed-global', { meetingId, title: meeting.title });
    }
    emitFlashMeetingCreated(flashMeeting) {
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
    emitFlashMeetingUpdated(flashMeeting) {
        this.server.emit('flash-meeting-updated', {
            id: flashMeeting.id,
            currentParticipants: flashMeeting.currentParticipants,
            maxParticipants: flashMeeting.maxParticipants,
        });
    }
};
exports.MeetingsGateway = MeetingsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MeetingsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-meeting-room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], MeetingsGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('update-location'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], MeetingsGateway.prototype, "handleLocationUpdate", null);
exports.MeetingsGateway = MeetingsGateway = MeetingsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/meetings',
    })
], MeetingsGateway);
//# sourceMappingURL=meetings.gateway.js.map