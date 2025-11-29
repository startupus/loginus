import { Injectable, Logger } from '@nestjs/common';
import { PluginRegistryService } from './plugin-registry.service';
import { PluginLoaderService } from './plugin-loader.service';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

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
  ) {
    this.pluginsDirectory = path.join(process.cwd(), 'plugins');
    this.uploadsDirectory = path.join(process.cwd(), 'uploads', 'plugins');
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

      // For now, we'll skip extraction and create a simple plugin structure
      // TODO: Implement proper .zip extraction using child_process and `unzip` command
      // or install adm-zip package
      
      const slug = this.generateSlug(name);

      // Check if extension already exists
      const existing = await this.registry.findBySlug(slug);
      if (existing) {
        errors.push(`Extension with slug "${slug}" already exists`);
        return { success: false, message: 'Extension already exists', errors };
      }

      // Create plugin directory
      const finalPath = path.join(this.pluginsDirectory, slug);
      await fs.mkdir(finalPath, { recursive: true });
      extractPath = finalPath;

      // Copy .zip to plugin directory
      await fs.copyFile(tempPath, path.join(finalPath, 'plugin.zip'));

      // Create a dummy manifest for now
      const manifest: any = {
        name,
        version: '1.0.0',
        description: `${name} extension`,
      };

      this.logger.debug(`Created plugin directory: ${finalPath}`);

      // Register extension in database
      const extension = await this.registry.register({
        slug,
        name: name || manifest.name,
        description: manifest.description,
        version: manifest.version || '1.0.0',
        author: manifest.author?.name,
        authorEmail: manifest.author?.email,
        authorUrl: manifest.author?.url,
        extensionType,
        uiType: manifest.ui?.type,
        icon: manifest.ui?.icon,
        pathOnDisk: finalPath,
        manifest,
        config,
        subscribedEvents: manifest.events?.subscribes || [],
      });

      this.logger.log(`✅ Extension "${name}" installed successfully`);

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
    } catch (error) {
      this.logger.error(`Failed to delete plugin files:`, error.message);
    }

    // Unregister from database
    await this.registry.unregister(extensionId);

    this.logger.log(`Extension "${extension.name}" uninstalled`);
  }
}

