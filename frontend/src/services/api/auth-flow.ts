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
   * Получить алгоритм авторизации для клиентских форм (страницы входа/регистрации)
   */
  getPublicAuthFlow: () => apiClient.get<AuthFlowResponse>('/auth/flow'),

  /**
   * Тестировать алгоритм авторизации
   */
  testAuthFlow: () => apiClient.post<{ success: boolean; data: { result: string } }>('/admin/auth-flow/test'),

  /**
   * ✅ НОВЫЕ МЕТОДЫ для пошаговой аутентификации
   */
  
  /**
   * Инициировать пошаговый вход
   */
  initLoginFlow: (data: { stepId: string; data: Record<string, any> }) => apiClient.post<{
    success: boolean;
    message: string;
    nextStep?: string;
    sessionId?: string;
    payload?: any;
  }>('/auth/flow/login/init', data),

  /**
   * Выполнить шаг входа
   */
  loginStep: (data: {
    stepId: string;
    sessionId?: string;
    data: any;
  }) => apiClient.post<{
    success: boolean;
    sessionId?: string;
    nextStep?: string;
    completed?: boolean;
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    message?: string;
    tempData?: any;
  }>('/auth/flow/login/step', data),

  /**
   * Инициировать пошаговую регистрацию
   */
  initRegisterFlow: (data: { stepId: string; data: Record<string, any> }) => apiClient.post<{
    success: boolean;
    message: string;
    nextStep?: string;
    sessionId?: string;
    payload?: any;
  }>('/auth/flow/register/init', data),

  /**
   * Выполнить шаг регистрации
   */
  registerStep: (data: {
    stepId: string;
    sessionId?: string;
    data: any;
  }) => apiClient.post<{
    success: boolean;
    sessionId?: string;
    nextStep?: string;
    completed?: boolean;
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    message?: string;
    tempData?: any;
  }>('/auth/flow/register/step', data),

  /**
   * Завершить регистрацию
   */
  completeRegisterFlow: (data: {
    stepId: string;
    sessionId?: string;
    data: any;
  }) => apiClient.post<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    message?: string;
  }>('/auth/flow/register/complete', data),

  /**
   * Получить настройки Auth Flow для пользователя
   */
  getUserFlowSettings: () => apiClient.get('/auth/user-flow-settings'),
};

