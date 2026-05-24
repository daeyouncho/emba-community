import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum MeetingType {
  PROFESSOR = 'professor',   // 교수님 모임 (투표 방식)
  BIRTH_YEAR = 'birth_year', // 년생 모임
  FLASH = 'flash',           // 번개 모임
  GENERAL = 'general',       // 일반 모임
  SEMINAR = 'seminar',       // 세미나|수다(무알콜)
}

export enum MeetingStatus {
  DRAFT = 'draft',
  VOTING = 'voting',         // 투표 진행 중
  CONFIRMED = 'confirmed',   // 확정됨
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('meetings')
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: MeetingType, default: MeetingType.GENERAL })
  type: MeetingType;

  @Column({ type: 'enum', enum: MeetingStatus, default: MeetingStatus.DRAFT })
  status: MeetingStatus;

  @Column({ nullable: true })
  scheduledAt: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  locationLat: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  locationLng: number;

  @Column({ default: 0 })
  maxParticipants: number;

  @Column({ nullable: true })
  targetBirthYear: number; // 년생 모임용

  @Column({ nullable: true })
  voteDeadline: Date; // 투표 마감일

  @Column({ nullable: true, type: 'decimal', precision: 5, scale: 2 })
  quorumPercent: number; // 과반수 기준 (기본 50%)

  @ManyToOne(() => User)
  @JoinColumn({ name: 'organizerId' })
  organizer: User;

  @Column()
  organizerId: string;

  @Column({ nullable: true })
  googleCalendarEventId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
