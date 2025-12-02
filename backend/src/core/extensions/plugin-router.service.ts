import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PluginRegistryService } from './plugin-registry.service';
import { EventBusService } from '../events/event-bus.service';
import { PLUGIN_EVENTS } from '../events/events.constants';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Plugin Router Service
 * Загружает контроллеры плагинов и управляет маршрутизацией запросов к ним
 */
@Injectable()
export class PluginRouterService implements OnModuleInit {
  private readonly logger = new Logger(PluginRouterService.name);
  private readonly pluginsBackendPath: string;
  private loadedControllers: Map<string, any> = new Map(); // slug -> controller info
  private routeMap: Map<string, { slug: string; method: string; handler: string }> = new Map(); // route path -> handler info

  /**
   * Получить все зарегистрированные роуты (для отладки)
   */
  getAllRoutes(): Array<[string, { slug: string; method: string; handler: string }]> {
    return Array.from(this.routeMap.entries());
  }

  constructor(
    private readonly registry: PluginRegistryService,
    private readonly moduleRef: ModuleRef,
    private readonly eventBus: EventBusService,
  ) {
    this.pluginsBackendPath = path.join(process.cwd(), 'uploads', 'plugins-backend');
  }

  async onModuleInit() {
    this.logger.log('🔌 [PluginRouter] Initializing plugin router...');
    await this.loadAllPluginControllers();
  }

  /**
   * Загрузить все контроллеры плагинов
   */
  private async loadAllPluginControllers(): Promise<void> {
    try {
      // Проверяем существование директории
      await fs.access(this.pluginsBackendPath);
    } catch {
      this.logger.warn(`[PluginRouter] Plugins backend directory not found: ${this.pluginsBackendPath}`);
      return;
    }

    try {
      const extensions = await this.registry.findEnabled();
      this.logger.log(`[PluginRouter] Found ${extensions.length} enabled extensions`);

      for (const extension of extensions) {
        if (!extension.manifest?.backend?.enabled) {
          continue;
        }

        try {
          await this.loadPluginController(extension);
        } catch (error) {
          this.logger.error(
            `[PluginRouter] Failed to load controller for "${extension.slug}":`,
            error.message,
          );
        }
      }

      this.logger.log(`[PluginRouter] Loaded ${this.loadedControllers.size} plugin controllers`);
      this.logger.log(`[PluginRouter] Registered ${this.routeMap.size} plugin routes`);
    } catch (error) {
      this.logger.error(`[PluginRouter] Error loading plugin controllers:`, error.message);
    }
  }

  /**
   * Загрузить контроллер плагина
   */
  private async loadPluginController(extension: any): Promise<void> {
    const slug = extension.slug;
    const manifest = extension.manifest;

    if (!manifest?.backend?.enabled) {
      return;
    }

    const controllerPath = path.join(
      this.pluginsBackendPath,
      slug,
      manifest.backend.controllerPath.replace('backend/', ''),
    );

    try {
      // Проверяем существование файла контроллера
      await fs.access(controllerPath);
      this.logger.log(`[PluginRouter] Loading controller from: ${controllerPath}`);

      // ✅ ИСПРАВЛЕНИЕ: TypeScript файлы нужно компилировать или использовать ts-node
      // Проверяем, есть ли .js версия файла
      const jsControllerPath = controllerPath.replace(/\.ts$/, '.js');
      let importPath = controllerPath;
      
      try {
        await fs.access(jsControllerPath);
        importPath = jsControllerPath;
        this.logger.debug(`[PluginRouter] Using compiled JS file: ${importPath}`);
      } catch {
        // Если .js файла нет, используем TypeScript с ts-node
        this.logger.debug(`[PluginRouter] JS file not found, using TS with ts-node: ${controllerPath}`);
        importPath = controllerPath;
        
        // Регистрируем ts-node для динамической загрузки TypeScript
        try {
          require('ts-node').register({
            transpileOnly: true,
            compilerOptions: {
              module: 'commonjs',
              esModuleInterop: true,
              allowSyntheticDefaultImports: true,
              skipLibCheck: true,
            },
          });
        } catch (error) {
          this.logger.warn(`[PluginRouter] ts-node not available, TypeScript files may not load: ${error.message}`);
        }
      }

      // Динамический импорт контроллера
      // ВАЖНО: Для TypeScript нужен ts-node или компиляция в JS
      // Используем абсолютный путь для импорта
      const absoluteImportPath = path.isAbsolute(importPath) 
        ? importPath 
        : path.resolve(importPath);
      
      this.logger.debug(`[PluginRouter] Importing from: ${absoluteImportPath}`);
      
      let controllerModule;
      try {
        // ✅ ИСПРАВЛЕНИЕ: Используем require для CommonJS модулей (скомпилированных из TS)
        // import() не работает правильно с декораторами NestJS при динамической загрузке
        if (importPath.endsWith('.js')) {
          // Для JS файлов используем require
          delete require.cache[absoluteImportPath]; // Очищаем кеш
          controllerModule = require(absoluteImportPath);
        } else {
          // Для TS файлов используем import (через ts-node)
          controllerModule = await import(`file://${absoluteImportPath}`);
        }
      } catch (error) {
        // Если не получилось, пробуем без file://
        try {
          if (importPath.endsWith('.js')) {
            delete require.cache[absoluteImportPath];
            controllerModule = require(absoluteImportPath);
          } else {
            controllerModule = await import(absoluteImportPath);
          }
        } catch (error2) {
          this.logger.error(`[PluginRouter] Import error details:`, {
            message: error2.message,
            stack: error2.stack,
            path: absoluteImportPath,
            originalPath: importPath,
          });
          throw new Error(
            `Failed to import controller from ${absoluteImportPath}: ${error2.message}`,
          );
        }
      }

      const controllerName = manifest.backend.controllerName || 'PluginController';
      const ControllerClass = controllerModule[controllerName] || controllerModule.default?.[controllerName] || controllerModule.default;

      if (!ControllerClass) {
        this.logger.error(`[PluginRouter] Available exports: ${Object.keys(controllerModule).join(', ')}`);
        throw new Error(
          `Controller class "${controllerName}" not found in ${absoluteImportPath}. Available: ${Object.keys(controllerModule).join(', ')}`,
        );
      }

      // Создаем экземпляр контроллера с зависимостями
      // Плагины могут требовать EventBusService и PLUGIN_EVENTS
      const controllerInstance = new ControllerClass(this.eventBus, PLUGIN_EVENTS);

      // Сохраняем информацию о контроллере
      this.loadedControllers.set(slug, {
        ControllerClass,
        instance: controllerInstance,
        extension,
        manifest,
        controllerPath,
      });

      // Регистрируем роуты из манифеста
      if (manifest.backend.routes) {
        for (const route of manifest.backend.routes) {
          const fullPath = route.path.startsWith('/') ? route.path : `/${route.path}`;
          const handlerName = route.handler || this.getHandlerNameFromRoute(route.path, route.method);
          
          this.routeMap.set(fullPath, {
            slug,
            method: route.method || 'ALL',
            handler: handlerName,
          });
          
          this.logger.debug(
            `[PluginRouter] Registered route: ${route.method || 'ALL'} ${fullPath} -> ${slug}.${handlerName}`,
          );
        }
      }

      this.logger.log(`[PluginRouter] Controller loaded successfully: ${slug}`);
    } catch (error) {
      this.logger.error(
        `[PluginRouter] Failed to load controller for ${slug}:`,
        {
          message: error.message,
          stack: error.stack,
          controllerPath,
          slug,
        },
      );
      throw error;
    }
  }

  /**
   * Получить имя обработчика из пути роута
   */
  private getHandlerNameFromRoute(routePath: string, method: string): string {
    // Извлекаем последнюю часть пути
    // Например: /calculator/calculate -> calculate
    const parts = routePath.split('/').filter(p => p);
    const lastPart = parts[parts.length - 1] || 'index';
    
    // Преобразуем kebab-case в camelCase
    return lastPart
      .split('-')
      .map((part, index) =>
        index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
      )
      .join('');
  }

  /**
   * Получить контроллер для плагина
   */
  getPluginController(slug: string): any {
    return this.loadedControllers.get(slug) || null;
  }

  /**
   * Получить информацию о роуте
   */
  getRouteInfo(routePath: string): { slug: string; method: string; handler: string } | null {
    // Ищем точное совпадение
    if (this.routeMap.has(routePath)) {
      return this.routeMap.get(routePath)!;
    }

    // Ищем по префиксу (например, /calculator/calculate -> calculator)
    for (const [path, info] of this.routeMap.entries()) {
      if (routePath.startsWith(path)) {
        return info;
      }
    }

    return null;
  }

  /**
   * Вызвать обработчик плагина
   */
  async callPluginHandler(
    slug: string,
    handlerName: string,
    args: any[],
  ): Promise<any> {
    const controllerInfo = this.loadedControllers.get(slug);
    if (!controllerInfo) {
      throw new Error(`Plugin "${slug}" not found`);
    }

    const instance = controllerInfo.instance;
    if (!instance[handlerName]) {
      throw new Error(`Handler "${handlerName}" not found in plugin "${slug}"`);
    }

    return await instance[handlerName](...args);
  }

  /**
   * Перезагрузить контроллер плагина (после обновления)
   */
  async reloadPluginController(slug: string): Promise<void> {
    const extension = await this.registry.findBySlug(slug);
    if (!extension) {
      throw new Error(`Extension with slug "${slug}" not found`);
    }

    // Удаляем старый контроллер
    this.loadedControllers.delete(slug);
    for (const [path, info] of this.routeMap.entries()) {
      if (info.slug === slug) {
        this.routeMap.delete(path);
      }
    }

    // Загружаем новый
    await this.loadPluginController(extension);
    this.logger.log(`[PluginRouter] Reloaded plugin controller: ${slug}`);
  }
}

