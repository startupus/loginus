import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Extension } from './entities/extension.entity';
import { MenuItemPlugin } from './entities/menu-item-plugin.entity';
import { ProfileWidget } from './entities/profile-widget.entity';

export interface CreateExtensionDto {
  slug: string;
  name: string;
  description?: string;
  version: string;
  author?: string;
  authorEmail?: string;
  authorUrl?: string;
  extensionType: string;
  uiType?: string;
  icon?: string;
  pathOnDisk: string;
  manifest?: any;
  config?: any;
  subscribedEvents?: string[];
}

export interface UpdateExtensionDto {
  name?: string;
  description?: string;
  enabled?: boolean;
  config?: any;
}

/**
 * Plugin Registry Service
 * Manages plugin registration and metadata in database
 */
@Injectable()
export class PluginRegistryService {
  private readonly logger = new Logger(PluginRegistryService.name);

  constructor(
    @InjectRepository(Extension)
    private readonly extensionRepository: Repository<Extension>,
    @InjectRepository(MenuItemPlugin)
    private readonly menuItemPluginRepository: Repository<MenuItemPlugin>,
    @InjectRepository(ProfileWidget)
    private readonly profileWidgetRepository: Repository<ProfileWidget>,
  ) {}

  /**
   * Register a new extension
   */
  async register(dto: CreateExtensionDto): Promise<Extension> {
    // Check if already exists
    const existing = await this.extensionRepository.findOne({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new Error(`Extension with slug "${dto.slug}" already exists`);
    }

    const extension = this.extensionRepository.create({
      ...dto,
      installedAt: new Date(),
    });

    await this.extensionRepository.save(extension);

    this.logger.log(`Extension "${dto.name}" registered successfully`);
    return extension;
  }

  /**
   * Update extension metadata
   */
  async update(id: string, dto: UpdateExtensionDto): Promise<Extension> {
    const extension = await this.findById(id);

    if (!extension) {
      throw new Error(`Extension with id "${id}" not found`);
    }

    Object.assign(extension, dto);
    extension.updatedAt = new Date();

    await this.extensionRepository.save(extension);

    this.logger.log(`Extension "${extension.name}" updated`);
    return extension;
  }

  /**
   * Enable an extension
   */
  async enable(id: string): Promise<Extension> {
    return this.update(id, { enabled: true });
  }

  /**
   * Disable an extension
   */
  async disable(id: string): Promise<Extension> {
    return this.update(id, { enabled: false });
  }

  /**
   * Unregister (delete) an extension
   */
  async unregister(id: string): Promise<void> {
    const extension = await this.findById(id);

    if (!extension) {
      throw new Error(`Extension with id "${id}" not found`);
    }

    await this.extensionRepository.remove(extension);

    this.logger.log(`Extension "${extension.name}" unregistered`);
  }

  /**
   * Find extension by ID
   */
  async findById(id: string): Promise<Extension | null> {
    return this.extensionRepository.findOne({ where: { id } });
  }

  /**
   * Find extension by slug
   */
  async findBySlug(slug: string): Promise<Extension | null> {
    return this.extensionRepository.findOne({ where: { slug } });
  }

  /**
   * Get all extensions
   */
  async findAll(filters?: {
    extensionType?: string;
    enabled?: boolean;
  }): Promise<Extension[]> {
    const query = this.extensionRepository.createQueryBuilder('ext');

    if (filters?.extensionType) {
      query.andWhere('ext.extensionType = :type', {
        type: filters.extensionType,
      });
    }

    if (filters?.enabled !== undefined) {
      query.andWhere('ext.enabled = :enabled', { enabled: filters.enabled });
    }

    query.orderBy('ext.name', 'ASC');

    return query.getMany();
  }

  /**
   * Get all enabled extensions
   */
  async findEnabled(): Promise<Extension[]> {
    return this.findAll({ enabled: true });
  }

  /**
   * Get extensions by type
   */
  async findByType(extensionType: string): Promise<Extension[]> {
    return this.findAll({ extensionType });
  }

  /**
   * Link plugin to menu item
   */
  async linkToMenuItem(
    menuItemId: string,
    pluginId: string,
    config?: any,
  ): Promise<MenuItemPlugin> {
    const link = this.menuItemPluginRepository.create({
      menuItemId,
      pluginId,
      config,
    });

    await this.menuItemPluginRepository.save(link);

    this.logger.log(`Plugin linked to menu item: ${menuItemId}`);
    return link;
  }

  /**
   * Unlink plugin from menu item
   */
  async unlinkFromMenuItem(menuItemId: string): Promise<void> {
    await this.menuItemPluginRepository.delete({ menuItemId });
    this.logger.log(`Plugin unlinked from menu item: ${menuItemId}`);
  }

  /**
   * Get plugin for menu item
   */
  async getMenuItemPlugin(menuItemId: string): Promise<MenuItemPlugin | null> {
    return this.menuItemPluginRepository.findOne({
      where: { menuItemId },
      relations: ['plugin'],
    });
  }

  /**
   * Add widget to profile
   */
  async addWidgetToProfile(
    widgetId: string,
    position: number,
    width = 1,
    height = 1,
    config?: any,
  ): Promise<ProfileWidget> {
    const widget = this.profileWidgetRepository.create({
      widgetId,
      position,
      width,
      height,
      config,
    });

    await this.profileWidgetRepository.save(widget);

    this.logger.log(`Widget added to profile at position ${position}`);
    return widget;
  }

  /**
   * Remove widget from profile
   */
  async removeWidgetFromProfile(id: string): Promise<void> {
    await this.profileWidgetRepository.delete(id);
    this.logger.log(`Widget removed from profile`);
  }

  /**
   * Get all profile widgets
   */
  async getProfileWidgets(): Promise<ProfileWidget[]> {
    return this.profileWidgetRepository.find({
      where: { enabled: true },
      relations: ['widget'],
      order: { position: 'ASC' },
    });
  }

  /**
   * Update widget position/size
   */
  async updateProfileWidget(
    id: string,
    updates: {
      position?: number;
      width?: number;
      height?: number;
      config?: any;
      enabled?: boolean;
    },
  ): Promise<ProfileWidget> {
    const widget = await this.profileWidgetRepository.findOne({
      where: { id },
    });

    if (!widget) {
      throw new Error(`Profile widget with id "${id}" not found`);
    }

    Object.assign(widget, updates);
    await this.profileWidgetRepository.save(widget);

    this.logger.log(`Profile widget updated`);
    return widget;
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const [
      total,
      enabled,
      byType,
      menuPlugins,
      profileWidgets,
    ] = await Promise.all([
      this.extensionRepository.count(),
      this.extensionRepository.count({ where: { enabled: true } }),
      this.extensionRepository
        .createQueryBuilder('ext')
        .select('ext.extensionType', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('ext.extensionType')
        .getRawMany(),
      this.menuItemPluginRepository.count(),
      this.profileWidgetRepository.count({ where: { enabled: true } }),
    ]);

    return {
      total,
      enabled,
      disabled: total - enabled,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count, 10);
        return acc;
      }, {} as Record<string, number>),
      menuPlugins,
      profileWidgets,
    };
  }
}

