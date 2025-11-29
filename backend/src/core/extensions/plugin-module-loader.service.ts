import { Injectable, Logger, DynamicModule, Type } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Plugin Module Loader Service
 * Загружает и регистрирует backend модули плагинов
 */
@Injectable()
export class PluginModuleLoaderService {
  private readonly logger = new Logger(PluginModuleLoaderService.name);
  private readonly pluginsBackendPath: string;
  private loadedModules: Map<string, DynamicModule> = new Map();

  constructor() {
    this.pluginsBackendPath = path.join(process.cwd(), 'src', 'plugins');
  }

  /**
   * Загрузить модуль плагина
   * @param slug Slug плагина
   * @param manifest Манифест плагина
   */
  async loadPluginModule(
    slug: string,
    manifest: any,
  ): Promise<DynamicModule | null> {
    if (!manifest.backend?.enabled) {
      this.logger.debug(`[PluginModuleLoader] No backend for plugin: ${slug}`);
      return null;
    }

    const modulePath = path.join(
      this.pluginsBackendPath,
      slug,
      manifest.backend.modulePath.replace('backend/', ''),
    );

    try {
      // Проверяем существование файла модуля
      await fs.access(modulePath);
      this.logger.log(
        `[PluginModuleLoader] Loading module from: ${modulePath}`,
      );

      // Динамический импорт модуля
      // ВНИМАНИЕ: Это требует что модуль уже скомпилирован в JS
      // Для TypeScript нужна компиляция или использование ts-node
      const module = await import(modulePath);

      const moduleName = manifest.backend.moduleName || 'PluginModule';
      const PluginModule = module[moduleName] as Type<any>;

      if (!PluginModule) {
        throw new Error(
          `Module class "${moduleName}" not found in ${modulePath}`,
        );
      }

      // Создаём динамический модуль
      const dynamicModule: DynamicModule = {
        module: PluginModule,
        imports: [],
        controllers: [],
        providers: [],
        exports: [],
      };

      this.loadedModules.set(slug, dynamicModule);
      this.logger.log(
        `[PluginModuleLoader] Module loaded successfully: ${slug}`,
      );

      return dynamicModule;
    } catch (error) {
      this.logger.error(
        `[PluginModuleLoader] Failed to load module for ${slug}:`,
        error.message,
      );
      return null;
    }
  }

  /**
   * Получить загруженный модуль
   */
  getLoadedModule(slug: string): DynamicModule | null {
    return this.loadedModules.get(slug) || null;
  }

  /**
   * Выгрузить модуль плагина
   */
  unloadPluginModule(slug: string): void {
    this.loadedModules.delete(slug);
    this.logger.log(`[PluginModuleLoader] Module unloaded: ${slug}`);
  }
}

