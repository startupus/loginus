import { apiClient } from './client';

export interface AuthMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  isPrimary: boolean;
  order: number;
  type: 'primary' | 'oauth' | 'alternative' | 'registration-field' | 'auth-factor';
  flow: 'login' | 'registration' | 'factors';
  stepType?: 'field' | 'auth-method';
  fieldType?: 'surname' | 'name' | 'passport' | 'inn' | 'snils' | 'birthdate' | 'gender';
}

export interface AuthFlowResponse {
  success: boolean;
  data: {
    login: AuthMethod[];
    registration: AuthMethod[];
    factors?: AuthMethod[];
    updatedAt?: string;
  };
}

export const authFlowApi = {
  /**
   * Получить текущий алгоритм авторизации
   */
  getAuthFlow: () => apiClient.get<AuthFlowResponse>('/admin/auth-flow'),

  /**
   * Сохранить алгоритм авторизации
   */
  updateAuthFlow: (methods: AuthMethod[]) => 
    apiClient.put<AuthFlowResponse>('/admin/auth-flow', { methods }),

  /**
   * Тестировать алгоритм авторизации
   */
  testAuthFlow: () => apiClient.post<{ success: boolean; data: { result: string } }>('/admin/auth-flow/test'),
};

