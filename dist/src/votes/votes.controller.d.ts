import { VotesService } from './votes.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { User } from '../users/user.entity';
export declare class VotesController {
    private readonly votesService;
    constructor(votesService: VotesService);
    castVote(meetingId: string, dto: CastVoteDto, user: User): Promise<import("./vote.entity").Vote>;
    getResults(meetingId: string): Promise<{
        total: number;
        agree: number;
        disagree: number;
        abstain: number;
        agreeRate: number;
        dateVotes: Record<string, number>;
        votes: import("./vote.entity").Vote[];
    }>;
}
