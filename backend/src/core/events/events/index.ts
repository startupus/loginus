/**
 * Centralized export for all event definitions
 */

// Event constants
export * from './user.events';
export * from './menu.events';
export * from './widget.events';
export * from './system.events';
export * from './data.events';
export * from './auth.events';

// Export all event names as a single object for convenience
import { USER_EVENTS } from './user.events';
import { MENU_EVENTS } from './menu.events';
import { WIDGET_EVENTS } from './widget.events';
import { SYSTEM_EVENTS, PLUGIN_EVENTS } from './system.events';
import { DATA_EVENTS, DOCUMENT_EVENTS, ADDRESS_EVENTS, FAMILY_EVENTS } from './data.events';
import { AUTH_EVENTS, PAYMENT_EVENTS } from './auth.events';

/**
 * All system events grouped by category
 */
export const EVENTS = {
  USER: USER_EVENTS,
  MENU: MENU_EVENTS,
  WIDGET: WIDGET_EVENTS,
  SYSTEM: SYSTEM_EVENTS,
  PLUGIN: PLUGIN_EVENTS,
  DATA: DATA_EVENTS,
  DOCUMENT: DOCUMENT_EVENTS,
  ADDRESS: ADDRESS_EVENTS,
  FAMILY: FAMILY_EVENTS,
  AUTH: AUTH_EVENTS,
  PAYMENT: PAYMENT_EVENTS,
} as const;

/**
 * Helper function to get all event names as array
 */
export function getAllEventNames(): string[] {
  const events: string[] = [];
  
  function extractEvents(obj: Record<string, any>) {
    Object.values(obj).forEach((value) => {
      if (typeof value === 'string') {
        events.push(value);
      } else if (typeof value === 'object') {
        extractEvents(value);
      }
    });
  }
  
  extractEvents(EVENTS);
  return [...new Set(events)]; // Remove duplicates
}

