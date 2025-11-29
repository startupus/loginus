/**
 * Core System Events
 * All events that can be emitted in the system
 */

// ==================== USER EVENTS ====================
export const USER_EVENTS = {
  // User lifecycle
  BEFORE_CREATE: 'user.before_create',
  AFTER_CREATE: 'user.after_create',
  BEFORE_UPDATE: 'user.before_update',
  AFTER_UPDATE: 'user.after_update',
  BEFORE_DELETE: 'user.before_delete',
  AFTER_DELETE: 'user.after_delete',

  // Authentication
  LOGIN: 'user.login',
  LOGOUT: 'user.logout',
  LOGIN_FAILED: 'user.login_failed',
  PASSWORD_CHANGED: 'user.password_changed',
  PASSWORD_RESET_REQUESTED: 'user.password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'user.password_reset_completed',

  // Profile
  PROFILE_UPDATED: 'user.profile_updated',
  PROFILE_VIEWED: 'user.profile_viewed',
  AVATAR_CHANGED: 'user.avatar_changed',

  // Status
  ACTIVATED: 'user.activated',
  DEACTIVATED: 'user.deactivated',
  SUSPENDED: 'user.suspended',
} as const;

// ==================== MENU EVENTS ====================
export const MENU_EVENTS = {
  BEFORE_RENDER: 'menu.before_render',
  AFTER_RENDER: 'menu.after_render',

  // Menu items
  ITEM_BEFORE_CLICK: 'menu.item.before_click',
  ITEM_AFTER_CLICK: 'menu.item.after_click',
  ITEM_CREATED: 'menu.item.created',
  ITEM_UPDATED: 'menu.item.updated',
  ITEM_DELETED: 'menu.item.deleted',
  ITEM_REORDERED: 'menu.item.reordered',

  // Structure
  STRUCTURE_CHANGED: 'menu.structure_changed',
  NESTING_CHANGED: 'menu.nesting_changed',
} as const;

// ==================== WIDGET EVENTS ====================
export const WIDGET_EVENTS = {
  BEFORE_LOAD: 'widget.before_load',
  AFTER_LOAD: 'widget.after_load',
  BEFORE_RENDER: 'widget.before_render',
  AFTER_RENDER: 'widget.after_render',

  DATA_RECEIVED: 'widget.data_received',
  ERROR: 'widget.error',

  ADDED_TO_PROFILE: 'widget.added_to_profile',
  REMOVED_FROM_PROFILE: 'widget.removed_from_profile',
  REORDERED: 'widget.reordered',
  CONFIGURED: 'widget.configured',
} as const;

// ==================== DATA EVENTS ====================
export const DATA_EVENTS = {
  // CRUD operations
  BEFORE_CREATE: 'data.before_create',
  AFTER_CREATE: 'data.after_create',
  BEFORE_UPDATE: 'data.before_update',
  AFTER_UPDATE: 'data.after_update',
  BEFORE_DELETE: 'data.before_delete',
  AFTER_DELETE: 'data.after_delete',

  // Validation
  VALIDATED: 'data.validated',
  VALIDATION_FAILED: 'data.validation_failed',

  // Access
  ACCESSED: 'data.accessed',
  EXPORTED: 'data.exported',
  IMPORTED: 'data.imported',
} as const;

// ==================== SYSTEM EVENTS ====================
export const SYSTEM_EVENTS = {
  STARTUP: 'system.startup',
  SHUTDOWN: 'system.shutdown',
  CONFIG_CHANGED: 'system.config_changed',
  ERROR: 'system.error',
  MAINTENANCE_MODE_ENABLED: 'system.maintenance_mode_enabled',
  MAINTENANCE_MODE_DISABLED: 'system.maintenance_mode_disabled',
} as const;

// ==================== PLUGIN EVENTS ====================
export const PLUGIN_EVENTS = {
  BEFORE_INSTALL: 'plugin.before_install',
  INSTALLED: 'plugin.installed',
  INSTALL_FAILED: 'plugin.install_failed',

  ENABLED: 'plugin.enabled',
  DISABLED: 'plugin.disabled',

  BEFORE_UNINSTALL: 'plugin.before_uninstall',
  UNINSTALLED: 'plugin.uninstalled',

  UPDATED: 'plugin.updated',
  CONFIGURED: 'plugin.configured',
} as const;

// ==================== CONTENT EVENTS ====================
export const CONTENT_EVENTS = {
  BEFORE_RENDER: 'content.before_render',
  AFTER_RENDER: 'content.after_render',
  BEFORE_SAVE: 'content.before_save',
  AFTER_SAVE: 'content.after_save',
  PUBLISHED: 'content.published',
  UNPUBLISHED: 'content.unpublished',
} as const;

// ==================== PAYMENT EVENTS ====================
export const PAYMENT_EVENTS = {
  BEFORE_PROCESS: 'payment.before_process',
  AFTER_PROCESS: 'payment.after_process',
  PROCESSING: 'payment.processing',
  SUCCESS: 'payment.success',
  FAILED: 'payment.failed',
  REFUND_REQUESTED: 'payment.refund_requested',
  REFUND_COMPLETED: 'payment.refund_completed',
  REFUND_FAILED: 'payment.refund_failed',
} as const;

// ==================== AUTH EVENTS ====================
export const AUTH_EVENTS = {
  BEFORE_LOGIN: 'auth.before_login',
  AFTER_LOGIN: 'auth.after_login',
  LOGIN_FAILED: 'auth.login_failed',

  TOKEN_CREATED: 'auth.token_created',
  TOKEN_REFRESH: 'auth.token_refresh',
  TOKEN_REVOKED: 'auth.token_revoked',

  SESSION_STARTED: 'auth.session_started',
  SESSION_EXPIRED: 'auth.session_expired',
  SESSION_DESTROYED: 'auth.session_destroyed',

  TWO_FACTOR_ENABLED: 'auth.two_factor_enabled',
  TWO_FACTOR_DISABLED: 'auth.two_factor_disabled',
  TWO_FACTOR_VERIFIED: 'auth.two_factor_verified',
  TWO_FACTOR_FAILED: 'auth.two_factor_failed',
} as const;

// ==================== NOTIFICATION EVENTS ====================
export const NOTIFICATION_EVENTS = {
  BEFORE_SEND: 'notification.before_send',
  AFTER_SEND: 'notification.after_send',
  SEND_FAILED: 'notification.send_failed',
  DELIVERED: 'notification.delivered',
  READ: 'notification.read',
  DISMISSED: 'notification.dismissed',
} as const;

// ==================== FILE EVENTS ====================
export const FILE_EVENTS = {
  BEFORE_UPLOAD: 'file.before_upload',
  AFTER_UPLOAD: 'file.after_upload',
  UPLOAD_FAILED: 'file.upload_failed',
  BEFORE_DELETE: 'file.before_delete',
  AFTER_DELETE: 'file.after_delete',
  DOWNLOADED: 'file.downloaded',
} as const;

// ==================== ORGANIZATION EVENTS ====================
export const ORGANIZATION_EVENTS = {
  CREATED: 'organization.created',
  UPDATED: 'organization.updated',
  DELETED: 'organization.deleted',
  MEMBER_ADDED: 'organization.member_added',
  MEMBER_REMOVED: 'organization.member_removed',
  MEMBER_ROLE_CHANGED: 'organization.member_role_changed',
} as const;

// ==================== TEAM EVENTS ====================
export const TEAM_EVENTS = {
  CREATED: 'team.created',
  UPDATED: 'team.updated',
  DELETED: 'team.deleted',
  MEMBER_ADDED: 'team.member_added',
  MEMBER_REMOVED: 'team.member_removed',
} as const;

// Export all events
export const ALL_EVENTS = {
  USER: USER_EVENTS,
  MENU: MENU_EVENTS,
  WIDGET: WIDGET_EVENTS,
  DATA: DATA_EVENTS,
  SYSTEM: SYSTEM_EVENTS,
  PLUGIN: PLUGIN_EVENTS,
  CONTENT: CONTENT_EVENTS,
  PAYMENT: PAYMENT_EVENTS,
  AUTH: AUTH_EVENTS,
  NOTIFICATION: NOTIFICATION_EVENTS,
  FILE: FILE_EVENTS,
  ORGANIZATION: ORGANIZATION_EVENTS,
  TEAM: TEAM_EVENTS,
} as const;

// Helper: Get all event names as array
export function getAllEventNames(): string[] {
  const events: string[] = [];

  Object.values(ALL_EVENTS).forEach((category) => {
    Object.values(category).forEach((eventName) => {
      events.push(eventName);
    });
  });

  return events;
}

// Helper: Check if event name is valid
export function isValidEventName(eventName: string): boolean {
  return getAllEventNames().includes(eventName);
}

