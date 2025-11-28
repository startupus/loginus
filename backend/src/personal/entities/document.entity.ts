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

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  series: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  number: string | null;

  @Column({ type: 'date', nullable: true })
  issueDate: Date | null;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  issuer: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fileUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}

