import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum FlashMeetingStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('flash_meetings')
export class FlashMeeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column()
  locationName: string;

  @Column({ default: 5 })
  maxParticipants: number;

  @Column({ default: 0 })
  currentParticipants: number;

  @Column({ default: 3 })
  radiusKm: number; // 참여 가능 반경

  @Column()
  expiresAt: Date; // 번개 모임 만료 시간

  @Column({ type: 'enum', enum: FlashMeetingStatus, default: FlashMeetingStatus.ACTIVE })
  status: FlashMeetingStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'hostId' })
  host: User;

  @Column()
  hostId: string;

  @CreateDateColumn()
  createdAt: Date;
}
