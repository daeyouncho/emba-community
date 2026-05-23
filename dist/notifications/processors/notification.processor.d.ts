import { Job } from 'bull';
import { Repository } from 'typeorm';
import { KakaoAlimtalkService } from '../kakao-alimtalk.service';
import { User } from '../../users/user.entity';
import { FlashMeetingsService } from '../../flash-meetings/flash-meetings.service';
import { MeetingsGateway } from '../../meetings/meetings.gateway';
export declare class NotificationProcessor {
    private kakaoService;
    private usersRepository;
    private flashMeetingsService;
    private meetingsGateway;
    private readonly logger;
    constructor(kakaoService: KakaoAlimtalkService, usersRepository: Repository<User>, flashMeetingsService: FlashMeetingsService, meetingsGateway: MeetingsGateway);
    handleVoteStarted(job: Job<{
        meetingId: string;
        title: string;
        voteDeadline?: Date;
    }>): Promise<void>;
    handleMeetingConfirmed(job: Job<{
        meetingId: string;
        message?: string;
        title?: string;
    }>): Promise<void>;
    handleFlashMeetingNearby(job: Job<{
        flashMeetingId: string;
        latitude: number;
        longitude: number;
        radiusKm: number;
        title: string;
        locationName: string;
    }>): Promise<void>;
    handleBirthYearMeeting(job: Job<{
        meetingId: string;
        targetBirthYear: number;
        title: string;
    }>): Promise<void>;
    handleFlashMeetingExpire(job: Job<{
        id: string;
    }>): Promise<void>;
}
