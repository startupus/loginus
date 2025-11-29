import { EventBusService } from '../events/event-bus.service';
import { EventHandler, EventSubscriptionOptions } from '../events/event-handler.interface';
import { Logger } from '@nestjs/common';

/**
 * Plugin Metadata (from manifest.json)
 */
export interface PluginMetadata {
  id: string;
  slug: string;
  name: string;
  description?: string;
  version: string;
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  extensionType: string;
  ui?: {
    enabled: boolean;
    type?: 'iframe' | 'embedded' | 'external';
    icon?: string;
    path?: string;
    label?: string;
    labelRu?: string;
    labelEn?: string;
  };
  events?: {
    subscribes: string[];
  };
  api?: {
    endpoints: Array<{
      method: string;
      path: string;
      description?: string;
    }>;
  };
  config?: Record<string, any>;
  pathOnDisk: string;
}

/**
 * Base Plugin Class
 * All plugins should extend this class
 */
export abstract class Plugin {
  protected readonly logger: Logger;
  private readonly handlerIds: string[] = [];

  constructor(
    protected readonly metadata: PluginMetadata,
    protected readonly eventBus: EventBusService,
  ) {
    this.logger = new Logger(`Plugin:${metadata.slug}`);
  }

  /**
   * Called when plugin is installed
   */
  async onInstall(): Promise<void> {
    this.logger.log('Plugin installed');
  }

  /**
   * Called when plugin is enabled
   */
  async onEnable(): Promise<void> {
    this.logger.log('Plugin enabled');
  }

  /**
   * Called when plugin is disabled
   */
  async onDisable(): Promise<void> {
    this.logger.log('Plugin disabled');
    // Unregister all event handlers
    this.unregisterAllHandlers();
  }

  /**
   * Called when plugin is uninstalled
   */
  async onUninstall(): Promise<void> {
    this.logger.log('Plugin uninstalled');
  }

  /**
   * Called when plugin is updated
   */
  async onUpdate(oldVersion: string, newVersion: string): Promise<void> {
    this.logger.log(`Plugin updated from ${oldVersion} to ${newVersion}`);
  }

  /**
   * Register event handlers
   * Override this method to subscribe to events
   */
  abstract registerEventHandlers(): void;

  /**
   * Subscribe to an event
   */
  protected on(
    eventName: string,
    handler: EventHandler,
    options: Omit<EventSubscriptionOptions, 'pluginId'> = {},
  ): void {
    const handlerId = this.eventBus.on(eventName, handler, {
      ...options,
      pluginId: this.metadata.id,
    });

    this.handlerIds.push(handlerId);
    this.logger.debug(`Subscribed to event: ${eventName}`);
  }

  /**
   * Unregister all event handlers
   */
  protected unregisterAllHandlers(): void {
    for (const handlerId of this.handlerIds) {
      this.eventBus.off(handlerId);
    }
    this.handlerIds.length = 0;
    this.logger.debug('Unregistered all event handlers');
  }

  /**
   * Emit an event
   */
  protected async emit<T = any>(
    eventName: string,
    data: T,
    metadata?: Record<string, any>,
  ): Promise<boolean> {
    return this.eventBus.emit(eventName, data, {
      ...metadata,
      pluginId: this.metadata.id,
    });
  }

  /**
   * Get plugin configuration
   */
  protected getConfig<T = any>(key: string, defaultValue?: T): T {
    return this.metadata.config?.[key] ?? defaultValue;
  }

  /**
   * Get plugin metadata
   */
  getMetadata(): PluginMetadata {
    return this.metadata;
  }
}

