import { EventPayload, EventHandlerResult } from './event-emitter.interface';

/**
 * Event Handler Interface
 * Represents a function that handles an event
 */
export type EventHandler<T = any> = (
  payload: EventPayload<T>,
) => Promise<EventHandlerResult | boolean | void>;

/**
 * Event Handler Registration
 * Contains handler function and its metadata
 */
export interface EventHandlerRegistration {
  /**
   * Unique identifier for this handler
   */
  id: string;

  /**
   * Event name to listen to
   */
  eventName: string;

  /**
   * Handler function
   */
  handler: EventHandler;

  /**
   * Priority (higher = executed first)
   * Default: 0
   */
  priority: number;

  /**
   * Plugin ID that registered this handler (if applicable)
   */
  pluginId?: string;

  /**
   * Whether this handler is enabled
   */
  enabled: boolean;
}

/**
 * Event Subscription Options
 */
export interface EventSubscriptionOptions {
  /**
   * Priority (higher = executed first)
   * Default: 0
   */
  priority?: number;

  /**
   * Plugin ID
   */
  pluginId?: string;
}

