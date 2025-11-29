/**
 * События пользователей
 */

export const USER_EVENTS = {
  // Создание пользователя
  BEFORE_CREATE: 'user.before_create',
  AFTER_CREATE: 'user.after_create',
  CREATE_FAILED: 'user.create_failed',

  // Обновление пользователя
  BEFORE_UPDATE: 'user.before_update',
  AFTER_UPDATE: 'user.after_update',
  UPDATE_FAILED: 'user.update_failed',

  // Удаление пользователя
  BEFORE_DELETE: 'user.before_delete',
  AFTER_DELETE: 'user.after_delete',
  DELETE_FAILED: 'user.delete_failed',

  // Аутентификация
  LOGIN: 'user.login',
  LOGIN_FAILED: 'user.login_failed',
  LOGOUT: 'user.logout',
  SESSION_EXPIRED: 'user.session_expired',
  TOKEN_REFRESH: 'user.token_refresh',

  // Изменение данных
  PASSWORD_CHANGED: 'user.password_changed',
  EMAIL_CHANGED: 'user.email_changed',
  PROFILE_UPDATED: 'user.profile_updated',
  AVATAR_UPDATED: 'user.avatar_updated',

  // Права и роли
  ROLE_ASSIGNED: 'user.role_assigned',
  ROLE_REMOVED: 'user.role_removed',
  PERMISSION_GRANTED: 'user.permission_granted',
  PERMISSION_REVOKED: 'user.permission_revoked',

  // Верификация
  EMAIL_VERIFIED: 'user.email_verified',
  PHONE_VERIFIED: 'user.phone_verified',
  VERIFICATION_CODE_SENT: 'user.verification_code_sent',

  // Статус
  ACTIVATED: 'user.activated',
  DEACTIVATED: 'user.deactivated',
  SUSPENDED: 'user.suspended',

  // Wildcard для всех событий пользователей
  ALL: 'user.*',
} as const;

/**
 * Типы данных для событий пользователей
 */
export interface UserCreatedEventData {
  userId: string;
  email: string;
  role?: string;
}

export interface UserUpdatedEventData {
  userId: string;
  changes: Record<string, any>;
  previousValues: Record<string, any>;
}

export interface UserDeletedEventData {
  userId: string;
  email: string;
}

export interface UserLoginEventData {
  userId: string;
  email: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserPasswordChangedEventData {
  userId: string;
  email: string;
}

