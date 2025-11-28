import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PluginVersion } from './plugin-version.entity';

export enum PluginType {
  EXTERNAL_LINK = 'external_link',
  IFRAME = 'iframe',
  WEB_APP = 'web_app',
}

/**
 * Реальный плагин, который может добавлять пункт в меню личного кабинета.
 * Хранит как общие метаданные, так и типоспецифичную конфигурацию (config).
 */
@Entity('plugins')
export class Plugin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Уникальный человеко-читаемый идентификатор, используется в URL и как ключ.
   * Например: "reports-ai"
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  /**
   * Иконка из дизайн-системы или путь к svg.
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  icon?: string | null;

  /**
   * Тип плагина:
   * - external_link — внешняя ссылка
   * - iframe — внешний URL во фрейме
   * - web_app — встроенное приложение в стиле Telegram Apps
   */
  @Column({ type: 'enum', enum: PluginType })
  type: PluginType;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  /**
   * Порядок отображения в меню.
   */
  @Column({ type: 'int', default: 0 })
  order: number;

  /**
   * Область действия: global / organization / user и т.п.
   * Пока храним как строку, без отдельной enum-таблицы.
   */
  @Column({ type: 'varchar', length: 20, default: 'global' })
  scope: string;

  /**
   * Разрешённые роли (по имени или коду).
   * Хранится как jsonb-массив строк.
   */
  @Column({ type: 'jsonb', default: () => `'[]'::jsonb` })
  allowedRoles: string[];

  /**
   * Требуемые permissions (строки, совпадающие с нашей RBAC-системой).
   */
  @Column({ type: 'jsonb', default: () => `'[]'::jsonb` })
  requiredPermissions: string[];

  /**
   * Типоспецифичная конфигурация.
   *
   * external_link:
   *   { url: string; openIn: 'new_tab' | 'same_tab' }
   *
   * iframe:
   *   { url: string; allowedOrigins?: string[]; sandboxOptions?: string[] }
   *
   * web_app:
   *   {
   *     entryUrl?: string;
   *     staticPath?: string;
   *     launchMode?: 'remote_url' | 'hosted_bundle';
   *     verifySecretId?: string;
   *     webhookUrl?: string;
   *     capabilities?: string[];
   *   }
   */
  @Column({ type: 'jsonb', default: () => `'{}'::jsonb` })
  config: Record<string, any>;

  /**
   * Привязка к меню: какой navigation menu используется (например, "sidebar-main").
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  menuId?: string | null;

  /**
   * ID пункта меню, который создаёт этот плагин (совпадает с id в MenuItemConfig).
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  menuItemId?: string | null;

  /**
   * Родительский пункт меню (id другого MenuItemConfig).
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  menuParentItemId?: string | null;

  @OneToMany(() => PluginVersion, (version) => version.plugin)
  versions: PluginVersion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


