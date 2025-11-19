import { apiClient } from './client';

export const authApi = {
  login: (login: string, password: string) =>
    apiClient.post('/auth/login', { login, password }),
    
  register: (phone: string, email: string, password: string) =>
    apiClient.post('/auth/register', { phone, email, password }),
    
  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
    
  logout: () => apiClient.post('/auth/logout'),
  
  checkAccount: (contact: string, type: 'phone' | 'email') =>
    apiClient.post('/auth/check', { contact, type }),
  
  // Объединенный метод для оптимизации - проверяет аккаунт и отправляет код за один запрос
  checkAndSendCode: (contact: string, type: 'phone' | 'email', method?: 'sms' | 'call' | 'telegram') =>
    apiClient.post('/auth/check-and-send-code', { contact, type, method }),
  
  sendCode: (contact: string, type: 'phone' | 'email', method: 'sms' | 'call' | 'telegram', sessionId?: string) =>
    apiClient.post('/auth/send-code', { contact, type, method, sessionId }),
  
  verifyCode: (sessionId: string, code: string) =>
    apiClient.post('/auth/verify-code', { sessionId, code }),
  
  webauthnChallenge: (userId?: string) =>
    apiClient.post('/auth/webauthn/challenge', userId ? { userId } : {}),
  
  webauthnVerify: (credential: any, challenge: string) =>
    apiClient.post('/auth/webauthn/verify', { credential, challenge }),
};

