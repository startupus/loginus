import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PluginRegistryService } from './plugin-registry.service';
import { PluginLoaderService } from './plugin-loader.service';
import { ExtensionUploadService } from './extension-upload.service';
import { EventBusService } from '../events/event-bus.service';
import { EventLoggerService } from '../events/event-logger.service';
import { SYSTEM_EVENTS, PLUGIN_EVENTS } from '../events/events';
import {
  UploadExtensionDto,
  UpdateExtensionConfigDto,
  LinkPluginToMenuDto,
  AddWidgetToProfileDto,
} from './dto/extensions.dto';

// Note: Permissions system is disabled in app.module
// All extension endpoints are accessible to authenticated users

/**
 * Extensions Controller
 * API для управления расширениями (плагинами и виджетами)
 */
@Controller('admin/extensions')
export class ExtensionsController {
  constructor(
    private readonly registry: PluginRegistryService,
    private readonly loader: PluginLoaderService,
    private readonly uploadService: ExtensionUploadService,
    private readonly eventBus: EventBusService,
    private readonly eventLogger: EventLoggerService,
  ) {}

  /**
   * Загрузить .zip расширение
   * POST /api/admin/extensions/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  // Убираем ValidationPipe - FormData с файлами не работает с class-validator
  async uploadExtension(
    @UploadedFile() file: any, // Express.Multer.File
    @Body() body: any,  // Получаем сырой body
  ) {
    console.log('[ExtensionsController] uploadExtension called');
    console.log('[ExtensionsController] file:', file ? { 
      originalname: file.originalname, 
      mimetype: file.mimetype, 
      size: file.size,
      hasBuffer: !!file.buffer,
      bufferLength: file.buffer?.length,
    } : 'NO FILE');
    console.log('[ExtensionsController] body:', body);
    console.log('[ExtensionsController] body.extensionType type:', typeof body.extensionType);
    console.log('[ExtensionsController] body.enabled type:', typeof body.enabled);

    // Ручная валидация
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
      console.error('[ExtensionsController] file.buffer is missing or invalid!', {
        hasBuffer: !!file.buffer,
        bufferType: typeof file.buffer,
        fileKeys: Object.keys(file),
      });
      throw new BadRequestException('File buffer is missing or invalid');
    }

    if (!file.originalname.endsWith('.zip')) {
      throw new BadRequestException('File must be a .zip archive');
    }

    if (!body.name || typeof body.name !== 'string') {
      throw new BadRequestException('Name is required and must be a string');
    }

    if (!body.extensionType || typeof body.extensionType !== 'string') {
      throw new BadRequestException('Extension type is required');
    }

    // Преобразуем enabled из string в boolean
    const enabled = body.enabled === 'true' || body.enabled === true;

    // Маппинг 'plugin' -> 'menu_item' для обратной совместимости
    const extensionType = body.extensionType === 'plugin' ? 'menu_item' : body.extensionType;

    const result = await this.uploadService.uploadExtension(
      file.buffer,
      body.name,
      extensionType,
      body.config,
    );

    if (!result.success) {
      throw new BadRequestException(result.message, {
        cause: result.errors?.join(', '),
      });
    }

    // Если enabled передан и установка успешна, устанавливаем его после установки
    if (enabled !== undefined && result.success && result.extensionId) {
      await this.registry.update(result.extensionId, { enabled: enabled });
    }

    return {
      success: true,
      data: {
        extensionId: result.extensionId,
        message: result.message,
      },
    };
  }

  /**
   * Получить список всех расширений
   * GET /api/admin/extensions
   */
  @Get()
  async getExtensions(
    @Query('type') extensionType?: string,
    @Query('enabled') enabled?: string,
  ) {
    const filters: any = {};

    if (extensionType) {
      filters.extensionType = extensionType;
    }

    if (enabled !== undefined) {
      filters.enabled = enabled === 'true';
    }

    const extensions = await this.registry.findAll(filters);

    return {
      success: true,
      data: extensions,
    };
  }

  /**
   * Получить детали расширения
   * GET /api/admin/extensions/:id
   */
  @Get(':id')
  async getExtension(@Param('id') id: string) {
    const extension = await this.registry.findById(id);

    if (!extension) {
      throw new NotFoundException(`Extension with id "${id}" not found`);
    }

    return {
      success: true,
      data: extension,
    };
  }

  /**
   * Включить расширение
   * POST /api/admin/extensions/:id/enable
   */
  @Post(':id/enable')
  async enableExtension(@Param('id') id: string) {
    const extension = await this.registry.enable(id);

    // Load plugin if it's not loaded yet
    if (!this.loader.isPluginLoaded(id)) {
      await this.loader.loadPlugin(extension);
    }

    // ✅ Emit PLUGIN_ENABLED event
    await this.eventBus.emit(PLUGIN_EVENTS.ENABLED, {
      extensionId: id,
      slug: extension.slug,
      name: extension.name,
    });

    return {
      success: true,
      data: extension,
      message: 'Extension enabled successfully',
    };
  }

  /**
   * Выключить расширение
   * POST /api/admin/extensions/:id/disable
   */
  @Post(':id/disable')
  async disableExtension(@Param('id') id: string) {
    const extension = await this.registry.disable(id);

    // Unload plugin if loaded
    if (this.loader.isPluginLoaded(id)) {
      await this.loader.unloadPlugin(id);
    }

    // ✅ Emit PLUGIN_DISABLED event
    await this.eventBus.emit(PLUGIN_EVENTS.DISABLED, {
      extensionId: id,
      slug: extension.slug,
      name: extension.name,
    });

    return {
      success: true,
      data: extension,
      message: 'Extension disabled successfully',
    };
  }

  /**
   * Обновить конфигурацию расширения
   * PUT /api/admin/extensions/:id/config
   */
  @Put(':id/config')
  async updateConfig(
    @Param('id') id: string,
    @Body() dto: UpdateExtensionConfigDto,
  ) {
    const extension = await this.registry.update(id, { config: dto.config });

    // Reload plugin to apply new config
    if (this.loader.isPluginLoaded(id)) {
      await this.loader.reloadPlugin(id);
    }

    return {
      success: true,
      data: extension,
      message: 'Configuration updated successfully',
    };
  }

  /**
   * Удалить расширение
   * DELETE /api/admin/extensions/:id
   */
  @Delete(':id')
  async deleteExtension(@Param('id') id: string) {
    // Get extension before deleting
    const extension = await this.registry.findById(id);

    await this.uploadService.uninstallExtension(id);

    // ✅ Emit PLUGIN_UNINSTALLED event
    if (extension) {
      await this.eventBus.emit(PLUGIN_EVENTS.UNINSTALLED, {
        extensionId: id,
        slug: extension.slug,
        name: extension.name,
      });
    }

    return {
      success: true,
      message: 'Extension deleted successfully',
    };
  }

  /**
   * Привязать плагин к пункту меню
   * POST /api/admin/extensions/menu-link
   */
  @Post('menu-link')
  async linkToMenu(@Body() dto: LinkPluginToMenuDto) {
    const link = await this.registry.linkToMenuItem(
      dto.menuItemId,
      dto.pluginId,
      dto.config,
    );

    return {
      success: true,
      data: link,
      message: 'Plugin linked to menu item successfully',
    };
  }

  /**
   * Отвязать плагин от пункта меню
   * DELETE /api/admin/extensions/menu-link/:menuItemId
   */
  @Delete('menu-link/:menuItemId')
  async unlinkFromMenu(@Param('menuItemId') menuItemId: string) {
    await this.registry.unlinkFromMenuItem(menuItemId);

    return {
      success: true,
      message: 'Plugin unlinked from menu item successfully',
    };
  }

  /**
   * Добавить виджет в профиль
   * POST /api/admin/extensions/profile-widgets
   */
  @Post('profile-widgets')
  async addWidgetToProfile(@Body() dto: AddWidgetToProfileDto) {
    const widget = await this.registry.addWidgetToProfile(
      dto.widgetId,
      dto.position,
      dto.width,
      dto.height,
      dto.config,
    );

    return {
      success: true,
      data: widget,
      message: 'Widget added to profile successfully',
    };
  }

  /**
   * Получить виджеты профиля
   * GET /api/admin/extensions/profile-widgets
   */
  @Get('profile-widgets')
  async getProfileWidgets() {
    const widgets = await this.registry.getProfileWidgets();

    return {
      success: true,
      data: widgets,
    };
  }

  /**
   * Удалить виджет из профиля
   * DELETE /api/admin/extensions/profile-widgets/:id
   */
  @Delete('profile-widgets/:id')
  async removeWidgetFromProfile(@Param('id') id: string) {
    await this.registry.removeWidgetFromProfile(id);

    return {
      success: true,
      message: 'Widget removed from profile successfully',
    };
  }

  /**
   * Получить статистику расширений
   * GET /api/admin/extensions/stats
   */
  @Get('stats/overview')
  async getStatistics() {
    const [registryStats, loaderStats, eventStats] = await Promise.all([
      this.registry.getStatistics(),
      this.loader.getStatistics(),
      this.eventLogger.getStatistics(),
    ]);

    return {
      success: true,
      data: {
        extensions: registryStats,
        loader: loaderStats,
        events: eventStats,
      },
    };
  }

  /**
   * Получить логи событий
   * GET /api/admin/extensions/event-logs
   */
  @Get('event-logs')
  async getEventLogs(
    @Query('eventName') eventName?: string,
    @Query('pluginId') pluginId?: string,
    @Query('limit') limit = 100,
  ) {
    let logs;

    if (eventName) {
      logs = await this.eventLogger.getEventLogs(eventName, limit);
    } else if (pluginId) {
      logs = await this.eventLogger.getPluginLogs(pluginId, limit);
    } else {
      logs = await this.eventLogger.getFailedLogs(limit);
    }

    return {
      success: true,
      data: logs,
    };
  }
}

