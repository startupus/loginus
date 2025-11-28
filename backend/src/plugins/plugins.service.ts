import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Plugin, PluginType } from './entities/plugin.entity';
import { PluginVersion } from './entities/plugin-version.entity';
import { CreatePluginDto } from './dto/create-plugin.dto';
import { UpdatePluginDto } from './dto/update-plugin.dto';
import { LaunchPluginDto } from './dto/launch-plugin.dto';
import { User } from '../users/entities/user.entity';
import { PermissionsUtilsService } from '../common/services/permissions-utils.service';

@Injectable()
export class PluginsService {
  constructor(
    @InjectRepository(Plugin)
    private readonly pluginRepo: Repository<Plugin>,
    @InjectRepository(PluginVersion)
    private readonly versionRepo: Repository<PluginVersion>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly permissionsUtils: PermissionsUtilsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Список всех плагинов (для админки).
   */
  async findAll(): Promise<Plugin[]> {
    return this.pluginRepo.find({
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOneByIdOrSlug(idOrSlug: string): Promise<Plugin> {
    // Сначала ищем по slug, чтобы избежать ошибок cast для не-UUID значений.
    let plugin = await this.pluginRepo.findOne({
      where: { slug: idOrSlug },
    });

    // Если не нашли и строка похожа на UUID — пробуем искать по id
    if (!plugin && /^[0-9a-fA-F-]{36}$/.test(idOrSlug)) {
      plugin = await this.pluginRepo.findOne({
        where: { id: idOrSlug as any },
      });
    }

    if (!plugin) {
      throw new NotFoundException('Плагин не найден');
    }

    return plugin;
  }

  /**
   * Создание нового плагина.
   * Может работать как регистрация "по URL" (external/iframe/web_app.remote_url),
   * так и как регистрация с manifest.
   */
  async create(dto: CreatePluginDto): Promise<Plugin> {
    const existing = await this.pluginRepo.findOne({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestException(
        `Плагин со slug "${dto.slug}" уже существует`,
      );
    }

    const plugin = this.pluginRepo.create({
      slug: dto.slug,
      name: dto.name,
      description: dto.description,
      icon: dto.icon,
      type: dto.type,
      enabled: dto.enabled ?? true,
      order: dto.order ?? 0,
      scope: dto.scope ?? 'global',
      allowedRoles: dto.allowedRoles ?? [],
      requiredPermissions: dto.requiredPermissions ?? [],
      config: dto.config ?? {},
      menuId: dto.menuId ?? 'sidebar-main',
      menuItemId: dto.menuItemId ?? dto.slug,
      menuParentItemId: dto.menuParentItemId ?? null,
    });

    const saved = await this.pluginRepo.save(plugin);

    // Если переданы данные версии/manifest — создаём первую версию
    if (dto.version || dto.manifest || dto.staticPath) {
      const version = this.versionRepo.create({
        pluginId: saved.id,
        version: dto.version || '1.0.0',
        manifest: dto.manifest ?? {},
        staticPath: dto.staticPath ?? null,
        isActive: true,
      });
      await this.versionRepo.save(version);
    }

    return saved;
  }

  async update(idOrSlug: string, dto: UpdatePluginDto): Promise<Plugin> {
    const plugin = await this.findOneByIdOrSlug(idOrSlug);

    if (dto.slug && dto.slug !== plugin.slug) {
      const conflict = await this.pluginRepo.findOne({
        where: { slug: dto.slug },
      });
      if (conflict) {
        throw new BadRequestException(
          `Плагин со slug "${dto.slug}" уже существует`,
        );
      }
    }

    Object.assign(plugin, {
      ...dto,
      allowedRoles: dto.allowedRoles ?? plugin.allowedRoles,
      requiredPermissions: dto.requiredPermissions ?? plugin.requiredPermissions,
      config: dto.config ?? plugin.config,
    });

    const saved = await this.pluginRepo.save(plugin);

    // Обновление версии (если переданы поля версии)
    if (dto.version || dto.manifest || dto.staticPath) {
      let version = await this.versionRepo.findOne({
        where: { pluginId: saved.id, isActive: true },
      });

      if (!version) {
        version = this.versionRepo.create({
          pluginId: saved.id,
          version: dto.version || '1.0.0',
          manifest: dto.manifest ?? {},
          staticPath: dto.staticPath ?? null,
          isActive: true,
        });
      } else {
        version.version = dto.version || version.version;
        version.manifest = dto.manifest ?? version.manifest;
        version.staticPath = dto.staticPath ?? version.staticPath;
      }

      await this.versionRepo.save(version);
    }

    return saved;
  }

  async enable(idOrSlug: string): Promise<Plugin> {
    const plugin = await this.findOneByIdOrSlug(idOrSlug);
    plugin.enabled = true;
    return this.pluginRepo.save(plugin);
  }

  async disable(idOrSlug: string): Promise<Plugin> {
    const plugin = await this.findOneByIdOrSlug(idOrSlug);
    plugin.enabled = false;
    return this.pluginRepo.save(plugin);
  }

  async remove(idOrSlug: string): Promise<void> {
    const plugin = await this.findOneByIdOrSlug(idOrSlug);
    await this.pluginRepo.remove(plugin);
  }

  /**
   * Список плагинов, доступных текущему пользователю.
   * Используется личным кабинетом для построения меню плагинов.
   */
  async getAvailableForUser(userId: string): Promise<Plugin[]> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: [
        'userRoleAssignments',
        'userRoleAssignments.role',
        'userRoleAssignments.organizationRole',
        'userRoleAssignments.teamRole',
      ],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const userRoles = this.permissionsUtils.extractUserRoles(user);
    const userPermissions = this.permissionsUtils.extractUserPermissions(user);

    const allPlugins = await this.pluginRepo.find({
      where: { enabled: true },
      order: { order: 'ASC', createdAt: 'ASC' },
    });

    return allPlugins.filter((plugin) =>
      this.canUserAccessPlugin(plugin, userRoles, userPermissions),
    );
  }

  private canUserAccessPlugin(
    plugin: Plugin,
    userRoles: string[],
    userPermissions: string[],
  ): boolean {
    if (plugin.allowedRoles?.length) {
      const hasRole = plugin.allowedRoles.some((role) =>
        userRoles.includes(role),
      );
      if (!hasRole) {
        return false;
      }
    }

    if (plugin.requiredPermissions?.length) {
      const hasPermission = plugin.requiredPermissions.some((perm) =>
        userPermissions.includes(perm),
      );
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }

  /**
   * Запуск embedded web_app-плагина:
   * генерируем initData (JWT) и возвращаем launchUrl.
   */
  async launchWebAppPlugin(
    slug: string,
    userId: string,
    dto: LaunchPluginDto,
  ): Promise<{ launchUrl: string; initData: string; expiresInSeconds: number }> {
    const plugin = await this.pluginRepo.findOne({
      where: { slug },
    });

    if (!plugin || !plugin.enabled) {
      throw new NotFoundException('Плагин не найден или отключен');
    }

    if (plugin.type !== PluginType.WEB_APP) {
      throw new BadRequestException(
        'Запуск через initData доступен только для web_app плагинов',
      );
    }

    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: [
        'userRoleAssignments',
        'userRoleAssignments.role',
        'userRoleAssignments.organizationRole',
        'userRoleAssignments.teamRole',
      ],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const userRoles = this.permissionsUtils.extractUserRoles(user);
    const userPermissions = this.permissionsUtils.extractUserPermissions(user);

    if (!this.canUserAccessPlugin(plugin, userRoles, userPermissions)) {
      throw new BadRequestException('У пользователя нет доступа к этому плагину');
    }

    const config = plugin.config || {};
    const launchMode = config.launchMode || 'remote_url';

    let launchUrl: string | undefined;

    if (launchMode === 'hosted_bundle') {
      // TODO: поддержать hosted_bundle, когда появится загрузка статики плагинов.
      // Пока для безопасности и простоты считаем, что hosted_bundle не настроен
      // и не пытаемся вычислять URL, чтобы не падать с 500.
      if (config.staticPath && config.version) {
        const basePath = '/plugins-static';
        launchUrl = `${basePath}/${plugin.slug}/${config.version}/index.html`;
      }
    } else if (config.entryUrl) {
      launchUrl = config.entryUrl;
    }

    if (!launchUrl) {
      throw new BadRequestException(
        'Плагин web_app сконфигурирован некорректно: не указан entryUrl или staticPath',
      );
    }

    const payload: Record<string, any> = {
      sub: user.id,
      pluginId: plugin.id,
      pluginSlug: plugin.slug,
      orgId: dto.orgId ?? null,
      locale: dto.locale ?? null,
      location: dto.location ?? null,
      time: Date.now(),
      extra: dto.extra ?? {},
    };

    const expiresInSeconds = 5 * 60;

    const initData = await this.jwtService.signAsync(payload, {
      expiresIn: expiresInSeconds,
      audience: 'plugin_web_app',
    });

    return {
      launchUrl,
      initData,
      expiresInSeconds,
    };
  }
}


