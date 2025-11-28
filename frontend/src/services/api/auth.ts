import { apiClient } from './client';
import { useAuthStore } from '@/store';

export const authApi = {
  /**
   * Логин по email или телефону + пароль.
   * Поле login может содержать как email, так и номер телефона.
   */
  login: (login: string, password: string) =>
    apiClient.post('/auth/login', { login, password }),

  /**
   * Регистрация по email + пароль.
   * Телефон при необходимости добавляется отдельными шагами (онбординг/привязка).
   */
  register: (email: string, password: string, extra?: { firstName?: string; lastName?: string; organizationId?: string; teamId?: string; referralCode?: string }) =>
    apiClient.post('/auth/register', {
      email,
      password,
      ...(extra || {}),
    }),

  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),

  logout: () => {
    const { refreshToken } = useAuthStore.getState();
    return apiClient.post('/auth/logout', {
      refreshToken: refreshToken || undefined,
    });
  },

  checkAccount: (contact: string, type: 'phone' | 'email') =>
    apiClient.post('/auth/check', { contact, type }),

  // Объединенный метод для оптимизации - проверяет аккаунт и отправляет код за один запрос
  checkAndSendCode: (
    contact: string,
    type: 'phone' | 'email',
    method?: 'sms' | 'call' | 'telegram',
  ) => apiClient.post('/auth/check-and-send-code', { contact, type, method }),

  sendCode: (
    contact: string,
    type: 'phone' | 'email',
    method: 'sms' | 'call' | 'telegram',
    sessionId?: string,
  ) => apiClient.post('/auth/send-code', { contact, type, method, sessionId }),

  verifyCode: (sessionId: string, code: string) =>
    apiClient.post('/auth/verify-code', { sessionId, code }),

  webauthnChallenge: (userId?: string) =>
    apiClient.post('/auth/webauthn/challenge', userId ? { userId } : {}),

  webauthnVerify: (credential: any, challenge: string) =>
    apiClient.post('/auth/webauthn/verify', { credential, challenge }),
};

