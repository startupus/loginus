import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { FamilyGroup } from './family-group.entity';

export enum FamilyMemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  CHILD = 'child',
}

@Entity('user_family_groups')
export class UserFamilyGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId', type: 'uuid' })
  userId: string;

  @Column({ name: 'familyGroupId', type: 'uuid' })
  familyGroupId: string;

  @Column({
    type: 'enum',
    enum: FamilyMemberRole,
    default: FamilyMemberRole.MEMBER,
  })
  role: FamilyMemberRole;

  @Column({ name: 'invitedBy', type: 'uuid', nullable: true })
  invitedBy: string | null;

  @Column({ default: () => 'NOW()' })
  joinedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => FamilyGroup, (group) => group.memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'familyGroupId' })
  familyGroup: FamilyGroup;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invitedBy' })
  inviter: User | null;
}

