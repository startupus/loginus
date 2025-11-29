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

@Entity('menu_item_plugins')
@Index(['menuItemId'])
@Index(['pluginId'])
export class MenuItemPlugin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  menuItemId: string;

  @Column({ type: 'uuid' })
  pluginId: string;

  @ManyToOne(() => Extension, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pluginId' })
  plugin: Extension;

  // Configuration specific to this menu item
  @Column({ type: 'jsonb', nullable: true })
  config: any;

  @CreateDateColumn()
  createdAt: Date;
}

