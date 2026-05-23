import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote, VoteChoice } from './vote.entity';
import { Meeting, MeetingStatus } from '../meetings/meeting.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
    @InjectRepository(Meeting)
    private meetingsRepository: Repository<Meeting>,
    @InjectQueue('notifications')
    private notificationsQueue: Queue,
  ) {}

  async castVote(meetingId: string, userId: string, choice: VoteChoice, preferredDate?: Date): Promise<Vote> {
    const meeting = await this.meetingsRepository.findOne({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('모임을 찾을 수 없습니다.');
    if (meeting.status !== MeetingStatus.VOTING) throw new BadRequestException('투표 중인 모임이 아닙니다.');
    if (meeting.voteDeadline && new Date() > meeting.voteDeadline) throw new BadRequestException('투표 기간이 종료되었습니다.');

    const existing = await this.votesRepository.findOne({ where: { meetingId, userId } });
    if (existing) {
      existing.choice = choice;
      if (preferredDate) existing.preferredDate = preferredDate;
      const updated = await this.votesRepository.save(existing);
      await this.checkQuorum(meetingId);
      return updated;
    }

    const vote = this.votesRepository.create({ meetingId, userId, choice, preferredDate });
    const saved = await this.votesRepository.save(vote);
    await this.checkQuorum(meetingId);
    return saved;
  }

  async getVoteResults(meetingId: string) {
    const votes = await this.votesRepository.find({ where: { meetingId }, relations: ['user'] });
    const total = votes.length;
    const agree = votes.filter(v => v.choice === VoteChoice.AGREE).length;
    const disagree = votes.filter(v => v.choice === VoteChoice.DISAGREE).length;
    const abstain = votes.filter(v => v.choice === VoteChoice.ABSTAIN).length;

    // 선호 날짜 집계
    const dateVotes = votes
      .filter(v => v.preferredDate)
      .reduce((acc, v) => {
        const key = v.preferredDate.toISOString().split('T')[0];
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return { total, agree, disagree, abstain, agreeRate: total ? (agree / total) * 100 : 0, dateVotes, votes };
  }

  // 과반수 달성 시 자동 확정
  private async checkQuorum(meetingId: string): Promise<void> {
    const meeting = await this.meetingsRepository.findOne({ where: { id: meetingId } });
    if (!meeting) return;

    const quorum = meeting.quorumPercent || 50;
    const result = await this.getVoteResults(meetingId);

    if (result.agreeRate >= quorum && result.total >= 2) {
      await this.meetingsRepository.update(meetingId, { status: MeetingStatus.CONFIRMED });
      // 알림 큐에 확정 알림 추가
      await this.notificationsQueue.add('meeting-confirmed', {
        meetingId,
        message: `"${meeting.title}" 모임이 과반수 동의로 확정되었습니다! (${result.agreeRate.toFixed(0)}% 찬성)`,
        voteResult: result,
      });
    }
  }
}
