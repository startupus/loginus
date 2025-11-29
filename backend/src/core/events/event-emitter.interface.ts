/**
 * Event Emitter Interface
 * Represents an event that can be emitted in the system
 */
export interface EventPayload<T = any> {
  /**
   * Name of the event (e.g., 'user.login', 'menu.before_render')
   */
  eventName: string;

  /**
   * Data associated with the event
   */
  data: T;

  /**
   * Timestamp when the event was emitted
   */
  timestamp: Date;

  /**
   * User ID who triggered the event (if applicable)
   */
  userId?: string;

  /**
   * Request ID for tracing (if applicable)
   */
  requestId?: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Event Handler Result
 * Returned by event handlers to control event propagation
 */
export interface EventHandlerResult {
  /**
   * Whether to continue event propagation
   * If false, subsequent handlers won't be called
   */
  continue: boolean;

  /**
   * Modified data (can be passed to next handlers)
   */
  data?: any;

  /**
   * Error message (if handler failed)
   */
  error?: string;
}

