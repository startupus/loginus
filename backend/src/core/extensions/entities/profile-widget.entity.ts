import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Extension } from './extension.entity';

@Entity('profile_widgets')
@Index(['widgetId'])
@Index(['position'])
export class ProfileWidget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  widgetId: string;

  @ManyToOne(() => Extension, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'widgetId' })
  widget: Extension;

  // Order in profile
  @Column({ type: 'int' })
  position: number;

  // Width in grid units
  @Column({ type: 'int', default: 1 })
  width: number;

  // Height in grid units
  @Column({ type: 'int', default: 1 })
  height: number;

  // Widget-specific configuration
  @Column({ type: 'jsonb', nullable: true })
  config: any;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

