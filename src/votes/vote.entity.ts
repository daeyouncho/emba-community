import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Meeting } from '../meetings/meeting.entity';

export enum VoteChoice {
  AGREE = 'agree',
  DISAGREE = 'disagree',
  ABSTAIN = 'abstain',
}

@Entity('votes')
@Unique(['meetingId', 'userId'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Meeting)
  @JoinColumn({ name: 'meetingId' })
  meeting: Meeting;

  @Column()
  meetingId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: VoteChoice })
  choice: VoteChoice;

  @Column({ nullable: true })
  preferredDate: Date; // 선호 날짜 (교수님 모임 날짜 투표용)

  @CreateDateColumn()
  createdAt: Date;
}
