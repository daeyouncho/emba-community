import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CastVoteDto } from './dto/cast-vote.dto';
import { User } from '../users/user.entity';

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post(':meetingId')
  castVote(
    @Param('meetingId') meetingId: string,
    @Body() dto: CastVoteDto,
    @CurrentUser() user: User,
  ) {
    const preferredDate = dto.preferredDate ? new Date(dto.preferredDate) : undefined;
    return this.votesService.castVote(meetingId, user.id, dto.choice, preferredDate);
  }

  @Get(':meetingId/results')
  getResults(@Param('meetingId') meetingId: string) {
    return this.votesService.getVoteResults(meetingId);
  }
}
