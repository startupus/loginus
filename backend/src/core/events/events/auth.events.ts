/**
 * События аутентификации
 */

export const AUTH_EVENTS = {
  // Вход
  BEFORE_LOGIN: 'auth.before_login',
  AFTER_LOGIN: 'auth.after_login',
  LOGIN_FAILED: 'auth.login_failed',

  // Регистрация
  BEFORE_REGISTER: 'auth.before_register',
  AFTER_REGISTER: 'auth.after_register',
  REGISTER_FAILED: 'auth.register_failed',

  // Выход
  LOGOUT: 'auth.logout',

  // Токены
  TOKEN_ISSUED: 'auth.token_issued',
  TOKEN_REFRESH: 'auth.token_refresh',
  TOKEN_REVOKED: 'auth.token_revoked',
  TOKEN_EXPIRED: 'auth.token_expired',

  // Сессия
  SESSION_STARTED: 'auth.session_started',
  SESSION_EXPIRED: 'auth.session_expired',
  SESSION_EXTENDED: 'auth.session_extended',

  // Двухфакторная аутентификация
  TWO_FACTOR_ENABLED: 'auth.two_factor_enabled',
  TWO_FACTOR_DISABLED: 'auth.two_factor_disabled',
  TWO_FACTOR_VERIFIED: 'auth.two_factor_verified',

  // Сброс пароля
  PASSWORD_RESET_REQUESTED: 'auth.password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'auth.password_reset_completed',

  // Wildcard
  ALL: 'auth.*',
} as const;

/**
 * События платежей
 */
export const PAYMENT_EVENTS = {
  // Создание платежа
  BEFORE_PROCESS: 'payment.before_process',
  AFTER_PROCESS: 'payment.after_process',
  PROCESS_FAILED: 'payment.process_failed',

  // Статусы платежа
  PENDING: 'payment.pending',
  SUCCESS: 'payment.success',
  FAILED: 'payment.failed',
  CANCELLED: 'payment.cancelled',

  // Возврат
  REFUND_REQUESTED: 'payment.refund_requested',
  REFUND_PROCESSED: 'payment.refund_processed',
  REFUND_FAILED: 'payment.refund_failed',

  // Подписки
  SUBSCRIPTION_CREATED: 'payment.subscription_created',
  SUBSCRIPTION_RENEWED: 'payment.subscription_renewed',
  SUBSCRIPTION_CANCELLED: 'payment.subscription_cancelled',
  SUBSCRIPTION_EXPIRED: 'payment.subscription_expired',

  // Wildcard
  ALL: 'payment.*',
} as const;

/**
 * Типы данных для событий аутентификации
 */
export interface AuthLoginEventData {
  userId: string;
  email: string;
  method: 'password' | 'oauth' | 'magic_link' | 'two_factor';
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthRegisterEventData {
  userId: string;
  email: string;
  method: string;
}

export interface AuthTokenIssuedEventData {
  userId: string;
  tokenType: 'access' | 'refresh';
  expiresAt: Date;
}

export interface AuthSessionExpiredEventData {
  userId: string;
  sessionId: string;
}

/**
 * Типы данных для событий платежей
 */
export interface PaymentProcessedEventData {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: 'success' | 'failed';
}

export interface PaymentRefundEventData {
  paymentId: string;
  refundId: string;
  amount: number;
  reason?: string;
}

export interface PaymentSubscriptionEventData {
  subscriptionId: string;
  userId: string;
  plan: string;
  status: string;
}

