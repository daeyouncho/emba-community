import { User } from '../users/user.entity';
import { Meeting } from '../meetings/meeting.entity';
export declare enum VoteChoice {
    AGREE = "agree",
    DISAGREE = "disagree",
    ABSTAIN = "abstain"
}
export declare class Vote {
    id: string;
    meeting: Meeting;
    meetingId: string;
    user: User;
    userId: string;
    choice: VoteChoice;
    preferredDate: Date;
    createdAt: Date;
}
