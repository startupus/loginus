import { Injectable, Logger } from '@nestjs/common';
import {
  EventPayload,
  EventHandlerResult,
} from './event-emitter.interface';
import {
  EventHandler,
  EventHandlerRegistration,
  EventSubscriptionOptions,
} from './event-handler.interface';
import { EventLoggerService } from './event-logger.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Event Bus Service
 * Central hub for event emission and subscription
 */
@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  private readonly handlers = new Map<string, EventHandlerRegistration[]>();

  constructor(private readonly eventLogger: EventLoggerService) {}

  /**
   * Subscribe to an event
   */
  on(
    eventName: string,
    handler: EventHandler,
    options: EventSubscriptionOptions = {},
  ): string {
    const registration: EventHandlerRegistration = {
      id: uuidv4(),
      eventName,
      handler,
      priority: options.priority ?? 0,
      pluginId: options.pluginId,
      enabled: true,
    };

    // Get existing handlers or create new array
    const existingHandlers = this.handlers.get(eventName) || [];

    // Add new handler and sort by priority (higher first)
    existingHandlers.push(registration);
    existingHandlers.sort((a, b) => b.priority - a.priority);

    this.handlers.set(eventName, existingHandlers);

    this.logger.debug(
      `Registered handler for event "${eventName}" (priority: ${registration.priority}, plugin: ${registration.pluginId || 'core'})`,
    );

    return registration.id;
  }

  /**
   * Unsubscribe from an event
   */
  off(handlerId: string): boolean {
    for (const [eventName, handlers] of this.handlers.entries()) {
      const index = handlers.findIndex((h) => h.id === handlerId);
      if (index !== -1) {
        handlers.splice(index, 1);
        this.logger.debug(`Unregistered handler ${handlerId}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Emit an event
   */
  async emit<T = any>(
    eventName: string,
    data: T,
    metadata?: Record<string, any>,
  ): Promise<boolean> {
    const payload: EventPayload<T> = {
      eventName,
      data,
      timestamp: new Date(),
      userId: metadata?.userId,
      requestId: metadata?.requestId,
      metadata,
    };

    this.logger.debug(`Emitting event: ${eventName}`);

    const handlers = this.handlers.get(eventName) || [];

    if (handlers.length === 0) {
      this.logger.debug(`No handlers registered for event: ${eventName}`);
      return true;
    }

    let currentData = data;
    let shouldContinue = true;

    for (const registration of handlers) {
      if (!registration.enabled) {
        continue;
      }

      const startTime = Date.now();
      let result: EventHandlerResult | boolean | void;
      let error: string | null = null;

      try {
        // Update payload with potentially modified data
        payload.data = currentData;

        // Execute handler
        result = await registration.handler(payload);

        // Process result
        if (typeof result === 'boolean') {
          shouldContinue = result;
        } else if (result && typeof result === 'object') {
          shouldContinue = result.continue ?? true;
          if (result.data !== undefined) {
            currentData = result.data;
          }
          if (result.error) {
            error = result.error;
            this.logger.error(
              `Handler error for ${eventName}: ${result.error}`,
            );
          }
        }
      } catch (err) {
        error = err.message || 'Unknown error';
        this.logger.error(
          `Exception in handler for ${eventName}:`,
          err.stack,
        );
        shouldContinue = false;
      }

      const executionTime = Date.now() - startTime;

      // Log event execution
      await this.eventLogger.log({
        eventName,
        payload,
        pluginId: registration.pluginId,
        status: error ? 'error' : 'success',
        error,
        executionTime,
      });

      if (!shouldContinue) {
        this.logger.debug(
          `Event propagation stopped for ${eventName} by handler ${registration.id}`,
        );
        break;
      }
    }

    return shouldContinue;
  }

  /**
   * Get all registered handlers for an event
   */
  getHandlers(eventName: string): EventHandlerRegistration[] {
    return this.handlers.get(eventName) || [];
  }

  /**
   * Get all handlers registered by a specific plugin
   */
  getPluginHandlers(pluginId: string): EventHandlerRegistration[] {
    const allHandlers: EventHandlerRegistration[] = [];

    for (const handlers of this.handlers.values()) {
      const pluginHandlers = handlers.filter((h) => h.pluginId === pluginId);
      allHandlers.push(...pluginHandlers);
    }

    return allHandlers;
  }

  /**
   * Unregister all handlers for a plugin
   */
  unregisterPlugin(pluginId: string): number {
    let count = 0;

    for (const [eventName, handlers] of this.handlers.entries()) {
      const filtered = handlers.filter((h) => h.pluginId !== pluginId);
      count += handlers.length - filtered.length;
      this.handlers.set(eventName, filtered);
    }

    this.logger.debug(`Unregistered ${count} handlers for plugin ${pluginId}`);
    return count;
  }

  /**
   * Enable/disable a specific handler
   */
  setHandlerEnabled(handlerId: string, enabled: boolean): boolean {
    for (const handlers of this.handlers.values()) {
      const handler = handlers.find((h) => h.id === handlerId);
      if (handler) {
        handler.enabled = enabled;
        return true;
      }
    }
    return false;
  }

  /**
   * Get statistics about registered handlers
   */
  getStatistics() {
    const stats = {
      totalEvents: this.handlers.size,
      totalHandlers: 0,
      handlersByEvent: {} as Record<string, number>,
      handlersByPlugin: {} as Record<string, number>,
    };

    for (const [eventName, handlers] of this.handlers.entries()) {
      stats.totalHandlers += handlers.length;
      stats.handlersByEvent[eventName] = handlers.length;

      for (const handler of handlers) {
        const pluginId = handler.pluginId || 'core';
        stats.handlersByPlugin[pluginId] =
          (stats.handlersByPlugin[pluginId] || 0) + 1;
      }
    }

    return stats;
  }
}

