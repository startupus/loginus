import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../events/event-bus.service';
import { PluginRegistryService } from './plugin-registry.service';
import { Plugin, PluginMetadata } from '../plugins/base-plugin.class';
import { Extension } from './entities/extension.entity';
import * as path from 'path';
import * as fs from 'fs/promises';
import { PLUGIN_EVENTS } from '../events/events.constants';

/**
 * Plugin Loader Service
 * Loads and manages plugin lifecycle
 */
@Injectable()
export class PluginLoaderService implements OnModuleInit {
  private readonly logger = new Logger(PluginLoaderService.name);
  private readonly loadedPlugins = new Map<string, Plugin>();
  private readonly pluginsDirectory: string;

  constructor(
    private readonly eventBus: EventBusService,
    private readonly registry: PluginRegistryService,
  ) {
    // plugins/ directory in backend root
    this.pluginsDirectory = path.join(process.cwd(), 'plugins');
  }

  /**
   * Called when module initializes - load all enabled plugins
   */
  async onModuleInit() {
    this.logger.log('🔌 Initializing Plugin Loader...');

    try {
      await this.ensurePluginsDirectory();
      await this.loadAllEnabledPlugins();
      this.logger.log('✅ Plugin Loader initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Plugin Loader:', error.stack);
    }
  }

  /**
   * Ensure plugins directory exists
   */
  private async ensurePluginsDirectory(): Promise<void> {
    try {
      await fs.access(this.pluginsDirectory);
    } catch {
      await fs.mkdir(this.pluginsDirectory, { recursive: true });
      this.logger.log(`Created plugins directory: ${this.pluginsDirectory}`);
    }
  }

  /**
   * Load all enabled plugins from database
   */
  async loadAllEnabledPlugins(): Promise<void> {
    const extensions = await this.registry.findEnabled();

    this.logger.log(`Found ${extensions.length} enabled extensions to load`);

    for (const extension of extensions) {
      try {
        await this.loadPlugin(extension);
      } catch (error) {
        this.logger.error(
          `Failed to load extension "${extension.slug}":`,
          error.message,
        );
      }
    }

    this.logger.log(`Loaded ${this.loadedPlugins.size} plugins successfully`);
  }

  /**
   * Load a single plugin
   */
  async loadPlugin(extension: Extension): Promise<Plugin> {
    // Check if already loaded
    if (this.loadedPlugins.has(extension.id)) {
      this.logger.warn(`Plugin "${extension.slug}" is already loaded`);
      return this.loadedPlugins.get(extension.id)!;
    }

    this.logger.debug(`Loading plugin: ${extension.slug}`);

    try {
      // Build plugin metadata
      const metadata: PluginMetadata = {
        id: extension.id,
        slug: extension.slug,
        name: extension.name,
        description: extension.description || undefined,
        version: extension.version,
        author: extension.author
          ? {
              name: extension.author,
              email: extension.authorEmail || undefined,
              url: extension.authorUrl || undefined,
            }
          : undefined,
        extensionType: extension.extensionType,
        ui: extension.uiType
          ? {
              enabled: true,
              type: extension.uiType as any,
              icon: extension.icon,
              path: extension.manifest?.ui?.path,
              label: extension.manifest?.ui?.label,
              labelRu: extension.manifest?.ui?.labelRu,
              labelEn: extension.manifest?.ui?.labelEn,
            }
          : undefined,
        events: extension.manifest?.events,
        api: extension.manifest?.api,
        config: extension.config || {},
        pathOnDisk: extension.pathOnDisk,
      };

      // Try to load plugin.js (compiled from plugin.ts)
      const pluginPath = path.join(extension.pathOnDisk, 'plugin.js');

      let PluginClass: any;
      try {
        // Dynamic import
        const module = await import(pluginPath);
        PluginClass = module.default || module.Plugin;
      } catch (error) {
        // If plugin.js doesn't exist or has errors, create a dummy plugin
        this.logger.warn(
          `No plugin.js found for "${extension.slug}", using dummy plugin`,
        );
        PluginClass = this.createDummyPluginClass();
      }

      // Instantiate plugin
      const plugin = new PluginClass(metadata, this.eventBus);

      // Call onEnable lifecycle hook
      if (plugin.onEnable) {
        await plugin.onEnable();
      }

      // Register event handlers
      if (plugin.registerEventHandlers) {
        plugin.registerEventHandlers();
      }

      // Store loaded plugin
      this.loadedPlugins.set(extension.id, plugin);

      // Emit plugin.enabled event
      await this.eventBus.emit(PLUGIN_EVENTS.ENABLED, {
        pluginId: extension.id,
        slug: extension.slug,
        name: extension.name,
      });

      this.logger.log(`✅ Plugin "${extension.slug}" loaded successfully`);
      return plugin;
    } catch (error) {
      this.logger.error(
        `Failed to load plugin "${extension.slug}":`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(extensionId: string): Promise<void> {
    const plugin = this.loadedPlugins.get(extensionId);

    if (!plugin) {
      this.logger.warn(`Plugin with id "${extensionId}" is not loaded`);
      return;
    }

    const metadata = plugin.getMetadata();

    try {
      // Call onDisable lifecycle hook
      if (plugin.onDisable) {
        await plugin.onDisable();
      }

      // Unregister all event handlers
      this.eventBus.unregisterPlugin(extensionId);

      // Remove from loaded plugins
      this.loadedPlugins.delete(extensionId);

      // Emit plugin.disabled event
      await this.eventBus.emit(PLUGIN_EVENTS.DISABLED, {
        pluginId: extensionId,
        slug: metadata.slug,
        name: metadata.name,
      });

      this.logger.log(`Plugin "${metadata.slug}" unloaded`);
    } catch (error) {
      this.logger.error(
        `Error unloading plugin "${metadata.slug}":`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Reload a plugin (unload + load)
   */
  async reloadPlugin(extensionId: string): Promise<Plugin> {
    await this.unloadPlugin(extensionId);

    const extension = await this.registry.findById(extensionId);
    if (!extension) {
      throw new Error(`Extension with id "${extensionId}" not found`);
    }

    return this.loadPlugin(extension);
  }

  /**
   * Get loaded plugin instance
   */
  getPlugin(extensionId: string): Plugin | undefined {
    return this.loadedPlugins.get(extensionId);
  }

  /**
   * Get all loaded plugins
   */
  getAllLoadedPlugins(): Plugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * Check if plugin is loaded
   */
  isPluginLoaded(extensionId: string): boolean {
    return this.loadedPlugins.has(extensionId);
  }

  /**
   * Create a dummy plugin class (for plugins without plugin.js)
   */
  private createDummyPluginClass(): any {
    return class DummyPlugin extends Plugin {
      registerEventHandlers(): void {
        // No event handlers for dummy plugins
      }
    };
  }

  /**
   * Get loader statistics
   */
  getStatistics() {
    return {
      loadedPlugins: this.loadedPlugins.size,
      pluginsDirectory: this.pluginsDirectory,
    };
  }
}

