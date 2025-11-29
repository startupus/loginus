import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('extensions')
@Index(['slug'], { unique: true })
@Index(['enabled'])
@Index(['extensionType'])
export class Extension {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  authorEmail: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  authorUrl: string;

  // Extension type: widget, menu_item, payment, auth, content, system, user, api
  @Column({ type: 'varchar', length: 50 })
  extensionType: string;

  // UI type for plugins with UI: iframe, embedded, external, or null
  @Column({ type: 'varchar', length: 50, nullable: true })
  uiType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string;

  // Path to plugin files on disk
  @Column({ type: 'varchar', length: 500 })
  pathOnDisk: string;

  // Full manifest.json content
  @Column({ type: 'jsonb', nullable: true })
  manifest: any;

  // Plugin configuration
  @Column({ type: 'jsonb', nullable: true })
  config: any;

  // Events this plugin subscribes to
  @Column({ type: 'jsonb', nullable: true })
  subscribedEvents: string[];

  // Enabled/disabled status
  @Column({ type: 'boolean', default: false })
  enabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  installedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

