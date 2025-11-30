import { Injectable, Logger } from '@nestjs/common';
import { PluginRegistryService } from './plugin-registry.service';
import { PluginLoaderService } from './plugin-loader.service';
import { EventBusService } from '../events/event-bus.service';
import { SYSTEM_EVENTS, PLUGIN_EVENTS } from '../events/events';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import AdmZip from 'adm-zip';

export interface UploadResult {
  success: boolean;
  extensionId?: string;
  message: string;
  errors?: string[];
}

/**
 * Extension Upload Service
 * Handles .zip file upload, extraction, and installation
 */
@Injectable()
export class ExtensionUploadService {
  private readonly logger = new Logger(ExtensionUploadService.name);
  private readonly pluginsDirectory: string;
  private readonly uploadsDirectory: string;

  constructor(
    private readonly registry: PluginRegistryService,
    private readonly loader: PluginLoaderService,
    private readonly eventBus: EventBusService,
  ) {
    // Плагины распаковываются в uploads/plugins для доступа через статический endpoint
    this.pluginsDirectory = path.join(process.cwd(), 'uploads', 'plugins');
    this.uploadsDirectory = path.join(process.cwd(), 'uploads', 'temp');
  }

  /**
   * Upload and install extension from .zip file
   */
  async uploadExtension(
    zipBuffer: Buffer,
    name: string,
    extensionType: string,
    config?: Record<string, any>,
  ): Promise<UploadResult> {
    const errors: string[] = [];
    let tempPath: string | null = null;
    let extractPath: string | null = null;

    try {
      // Ensure directories exist
      await this.ensureDirectories();

      // Save uploaded file temporarily
      tempPath = path.join(this.uploadsDirectory, `${uuidv4()}.zip`);
      await fs.writeFile(tempPath, zipBuffer);

      this.logger.debug(`Saved temporary .zip file: ${tempPath}`);

      // Extract .zip file
      const slug = this.generateSlug(name);
      const finalPath = path.join(this.pluginsDirectory, slug);
      await fs.mkdir(finalPath, { recursive: true });
      extractPath = finalPath;

      this.logger.debug(`Extracting .zip to: ${finalPath}`);
      
      // Use adm-zip to extract
      const zip = new AdmZip(tempPath);
      zip.extractAllTo(finalPath, true);

      this.logger.debug(`Extraction complete`);

      // Read manifest.json
      const manifestPath = path.join(finalPath, 'manifest.json');
      let manifest: any = {
        name,
        version: '1.0.0',
        description: `${name} extension`,
      };

      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        manifest = JSON.parse(manifestContent);
        this.logger.debug(`Read manifest: ${JSON.stringify(manifest)}`);
      } catch (error) {
        this.logger.warn(`No manifest.json found or invalid, using defaults`);
      }

      // 🔥 УСТАНОВКА BACKEND КОДА (если есть)
      if (await this.hasBackendCode(finalPath)) {
        this.logger.log(`[ExtensionUploadService] Backend code detected, installing...`);
        await this.installBackendCode(finalPath, slug, manifest);
      }

      // Check if extension already exists
      const existing = await this.registry.findBySlug(slug);
      if (existing) {
        errors.push(`Extension with slug "${slug}" already exists`);
        return { success: false, message: 'Extension already exists', errors };
      }

      this.logger.debug(`Created plugin directory: ${finalPath}`);

      // Register extension in database
      const extension = await this.registry.register({
        slug,
        name: manifest.displayName || manifest.name || name,
        description: manifest.description,
        version: manifest.version || '1.0.0',
        author: manifest.author,
        extensionType: manifest.type || extensionType,
        uiType: manifest.config?.renderType,
        icon: manifest.icon,
        pathOnDisk: finalPath,
        manifest,
        config: {
          ...config,
          ...manifest.config,
          // URL для доступа к файлам плагина через статический endpoint
          baseUrl: `/uploads/plugins/${slug}`,
          entrypoint: manifest.config?.entrypoint || 'index.html',
        },
        subscribedEvents: manifest.events?.subscribes || [],
      });

      this.logger.log(`✅ Extension "${name}" installed successfully`);

      // ✅ Emit PLUGIN_INSTALLED event
      await this.eventBus.emit(PLUGIN_EVENTS.INSTALLED, {
        extensionId: extension.id,
        slug: extension.slug,
        name: extension.name,
        extensionType,
      });

      return {
        success: true,
        extensionId: extension.id,
        message: 'Extension installed successfully',
      };
    } catch (error) {
      this.logger.error('Failed to upload extension:', error.stack);

      // Cleanup on error
      if (extractPath) {
        try {
          await fs.rm(extractPath, { recursive: true, force: true });
        } catch {}
      }

      errors.push(error.message);
      return {
        success: false,
        message: 'Failed to install extension',
        errors,
      };
    } finally {
      // Clean up temp file
      if (tempPath) {
        try {
          await fs.unlink(tempPath);
        } catch {}
      }
    }
  }

  /**
   * Ensure required directories exist
   */
  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.pluginsDirectory, { recursive: true });
    await fs.mkdir(this.uploadsDirectory, { recursive: true });
  }

  /**
   * Validate manifest.json structure
   */
  private validateManifest(manifest: any): string[] {
    const errors: string[] = [];

    if (!manifest.name) {
      errors.push('manifest.name is required');
    }

    if (!manifest.version) {
      errors.push('manifest.version is required');
    }

    // Version format validation (semantic versioning)
    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      errors.push('manifest.version must follow semantic versioning (e.g., 1.0.0)');
    }

    return errors;
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Install npm dependencies
   */
  private async installDependencies(pluginPath: string): Promise<void> {
    const packageJsonPath = path.join(pluginPath, 'package.json');

    try {
      await fs.access(packageJsonPath);
      this.logger.debug('Found package.json, installing dependencies...');

      // Note: In production, you'd run `npm install` here
      // For now, we'll skip this to avoid blocking
      // await exec('npm install', { cwd: pluginPath });

      this.logger.debug('Dependencies installed (skipped in dev mode)');
    } catch {
      // No package.json, skip
      this.logger.debug('No package.json found, skipping dependencies');
    }
  }

  /**
   * Compile TypeScript to JavaScript
   */
  private async compileTypeScript(pluginPath: string): Promise<void> {
    const tsFilePath = path.join(pluginPath, 'plugin.ts');
    const jsFilePath = path.join(pluginPath, 'plugin.js');

    try {
      await fs.access(tsFilePath);
      this.logger.debug('Found plugin.ts, compiling...');

      // Note: In production, you'd run `tsc` here
      // For now, we'll skip this to avoid blocking
      // await exec('npx tsc plugin.ts', { cwd: pluginPath });

      this.logger.debug('TypeScript compiled (skipped in dev mode)');
    } catch {
      // No plugin.ts, check if plugin.js exists
      try {
        await fs.access(jsFilePath);
        this.logger.debug('Found plugin.js, skipping compilation');
      } catch {
        this.logger.warn('Neither plugin.ts nor plugin.js found');
      }
    }
  }

  /**
   * Проверка наличия backend кода в плагине
   */
  private async hasBackendCode(pluginPath: string): Promise<boolean> {
    try {
      const backendPath = path.join(pluginPath, 'backend');
      await fs.access(backendPath);
      const entries = await fs.readdir(backendPath);
      return entries.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Установка backend кода плагина
   * Копирует backend код в src/plugins/{slug}/ для динамической загрузки
   */
  private async installBackendCode(
    pluginPath: string,
    slug: string,
    manifest: any,
  ): Promise<void> {
    try {
      const backendSourcePath = path.join(pluginPath, 'backend');
      // Используем uploads/plugins-backend вместо src/plugins для production
      const backendTargetPath = path.join(
        process.cwd(),
        'uploads',
        'plugins-backend',
        slug,
      );

      // Создаём целевую директорию
      await fs.mkdir(backendTargetPath, { recursive: true });

      // Копируем все файлы из backend/ в src/plugins/{slug}/
      const files = await fs.readdir(backendSourcePath);
      for (const file of files) {
        const sourceFile = path.join(backendSourcePath, file);
        const targetFile = path.join(backendTargetPath, file);

        const stat = await fs.stat(sourceFile);
        if (stat.isFile()) {
          await fs.copyFile(sourceFile, targetFile);
          this.logger.debug(
            `[ExtensionUploadService] Copied backend file: ${file}`,
          );
        }
      }

      // Сохраняем информацию о backend в манифесте
      if (manifest.backend) {
        manifest.backend.installedPath = backendTargetPath;
        manifest.backend.installedAt = new Date().toISOString();
      }

      this.logger.log(
        `[ExtensionUploadService] Backend code installed to: ${backendTargetPath}`,
      );

      // TODO: Динамическая регистрация модуля в NestJS
      // Это требует перезапуска приложения или использования динамических модулей
      this.logger.warn(
        `[ExtensionUploadService] Backend code installed but module registration requires app restart`,
      );
    } catch (error) {
      this.logger.error(
        `[ExtensionUploadService] Failed to install backend code:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Uninstall extension (delete files)
   */
  async uninstallExtension(extensionId: string): Promise<void> {
    const extension = await this.registry.findById(extensionId);

    if (!extension) {
      throw new Error(`Extension with id "${extensionId}" not found`);
    }

    // Unload plugin if loaded
    if (this.loader.isPluginLoaded(extensionId)) {
      await this.loader.unloadPlugin(extensionId);
    }

    // Delete files
    try {
      await fs.rm(extension.pathOnDisk, { recursive: true, force: true });
      this.logger.log(`Deleted plugin files: ${extension.pathOnDisk}`);

      // Удаляем backend код если был установлен
      const backendPath = path.join(
        process.cwd(),
        'src',
        'plugins',
        extension.slug,
      );
      try {
        await fs.rm(backendPath, { recursive: true, force: true });
        this.logger.log(`Deleted backend code: ${backendPath}`);
      } catch (backendError) {
        this.logger.warn(
          `Failed to delete backend code (may not exist):`,
          backendError.message,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to delete plugin files:`, error.message);
    }

    // Unregister from database
    await this.registry.unregister(extensionId);

    this.logger.log(`Extension "${extension.name}" uninstalled`);
  }
}

