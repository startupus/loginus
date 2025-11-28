import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Plugin } from './plugin.entity';

/**
 * Версия плагина (особенно актуально для web_app с hosted_bundle).
 * Позволяет откатываться на предыдущие версии и хранить полный manifest.
 */
@Entity('plugin_versions')
export class PluginVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pluginId: string;

  @ManyToOne(() => Plugin, (plugin) => plugin.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pluginId' })
  plugin: Plugin;

  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({ type: 'text', nullable: true })
  changelog?: string | null;

  /**
   * Путь до статики (index.html) внутри нашей файловой системы,
   * если launchMode = hosted_bundle.
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  staticPath?: string | null;

  /**
   * Полный manifest из plugin.json, чтобы не терять исходную конфигурацию.
   */
  @Column({ type: 'jsonb', default: () => `'{}'::jsonb` })
  manifest: Record<string, any>;

  /**
   * Является ли эта версия активной.
   * Можно хранить несколько записей и быстро переключаться.
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


