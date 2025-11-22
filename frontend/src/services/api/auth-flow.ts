import { apiClient } from './client';

export interface AuthStep {
  id: string;
  type: 'phone_verification' | 'email_verification' | 'password_setup' | 'biometric_setup' | '2fa_setup' | 'profile_completion';
  order: number;
  required: boolean;
  config: Record<string, any>;
}

export interface AuthFlowResponse {
  success: boolean;
  data: AuthStep[];
}

export const authFlowApi = {
  /**
   * Получить текущий алгоритм авторизации
   */
  getAuthFlow: () => apiClient.get<AuthFlowResponse>('/admin/auth-flow'),

  /**
   * Сохранить алгоритм авторизации
   */
  updateAuthFlow: (steps: AuthStep[]) => apiClient.put<AuthFlowResponse>('/admin/auth-flow', { steps }),

  /**
   * Тестировать алгоритм авторизации
   */
  testAuthFlow: () => apiClient.post<{ success: boolean; data: { result: string } }>('/admin/auth-flow/test'),
};

