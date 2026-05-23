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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vote_entity_1 = require("./vote.entity");
const meeting_entity_1 = require("../meetings/meeting.entity");
const bull_1 = require("@nestjs/bull");
let VotesService = class VotesService {
    constructor(votesRepository, meetingsRepository, notificationsQueue) {
        this.votesRepository = votesRepository;
        this.meetingsRepository = meetingsRepository;
        this.notificationsQueue = notificationsQueue;
    }
    async castVote(meetingId, userId, choice, preferredDate) {
        const meeting = await this.meetingsRepository.findOne({ where: { id: meetingId } });
        if (!meeting)
            throw new common_1.NotFoundException('모임을 찾을 수 없습니다.');
        if (meeting.status !== meeting_entity_1.MeetingStatus.VOTING)
            throw new common_1.BadRequestException('투표 중인 모임이 아닙니다.');
        if (meeting.voteDeadline && new Date() > meeting.voteDeadline)
            throw new common_1.BadRequestException('투표 기간이 종료되었습니다.');
        const existing = await this.votesRepository.findOne({ where: { meetingId, userId } });
        if (existing) {
            existing.choice = choice;
            if (preferredDate)
                existing.preferredDate = preferredDate;
            const updated = await this.votesRepository.save(existing);
            await this.checkQuorum(meetingId);
            return updated;
        }
        const vote = this.votesRepository.create({ meetingId, userId, choice, preferredDate });
        const saved = await this.votesRepository.save(vote);
        await this.checkQuorum(meetingId);
        return saved;
    }
    async getVoteResults(meetingId) {
        const votes = await this.votesRepository.find({ where: { meetingId }, relations: ['user'] });
        const total = votes.length;
        const agree = votes.filter(v => v.choice === vote_entity_1.VoteChoice.AGREE).length;
        const disagree = votes.filter(v => v.choice === vote_entity_1.VoteChoice.DISAGREE).length;
        const abstain = votes.filter(v => v.choice === vote_entity_1.VoteChoice.ABSTAIN).length;
        const dateVotes = votes
            .filter(v => v.preferredDate)
            .reduce((acc, v) => {
            const key = v.preferredDate.toISOString().split('T')[0];
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        return { total, agree, disagree, abstain, agreeRate: total ? (agree / total) * 100 : 0, dateVotes, votes };
    }
    async checkQuorum(meetingId) {
        const meeting = await this.meetingsRepository.findOne({ where: { id: meetingId } });
        if (!meeting)
            return;
        const quorum = meeting.quorumPercent || 50;
        const result = await this.getVoteResults(meetingId);
        if (result.agreeRate >= quorum && result.total >= 2) {
            await this.meetingsRepository.update(meetingId, { status: meeting_entity_1.MeetingStatus.CONFIRMED });
            await this.notificationsQueue.add('meeting-confirmed', {
                meetingId,
                message: `"${meeting.title}" 모임이 과반수 동의로 확정되었습니다! (${result.agreeRate.toFixed(0)}% 찬성)`,
                voteResult: result,
            });
        }
    }
};
exports.VotesService = VotesService;
exports.VotesService = VotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vote_entity_1.Vote)),
    __param(1, (0, typeorm_1.InjectRepository)(meeting_entity_1.Meeting)),
    __param(2, (0, bull_1.InjectQueue)('notifications')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, Object])
], VotesService);
//# sourceMappingURL=votes.service.js.map