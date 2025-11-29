import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('event_logs')
@Index(['eventName'])
@Index(['pluginId'])
@Index(['createdAt'])
@Index(['status'])
export class EventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  eventName: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: any;

  @Column({ type: 'uuid', nullable: true })
  pluginId: string;

  @Column({ type: 'varchar', length: 50 })
  status: 'success' | 'error';

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'int' })
  executionTime: number; // milliseconds

  @CreateDateColumn()
  createdAt: Date;
}

