import { Repository } from 'typeorm';
import { Vote, VoteChoice } from './vote.entity';
import { Meeting } from '../meetings/meeting.entity';
import { Queue } from 'bull';
export declare class VotesService {
    private votesRepository;
    private meetingsRepository;
    private notificationsQueue;
    constructor(votesRepository: Repository<Vote>, meetingsRepository: Repository<Meeting>, notificationsQueue: Queue);
    castVote(meetingId: string, userId: string, choice: VoteChoice, preferredDate?: Date): Promise<Vote>;
    getVoteResults(meetingId: string): Promise<{
        total: number;
        agree: number;
        disagree: number;
        abstain: number;
        agreeRate: number;
        dateVotes: Record<string, number>;
        votes: Vote[];
    }>;
    private checkQuorum;
}
