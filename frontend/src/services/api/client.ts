import axios from 'axios';
import { API_CONFIG } from './config';
import { useAuthStore } from '@/store';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // Добавляем метку времени для измерения задержки
    if (process.env.NODE_ENV === 'development') {
      (config as any).metadata = { startTime: performance.now() };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    // Логируем время ответа в dev режиме (неблокирующе)
    if (process.env.NODE_ENV === 'development' && (response.config as any).metadata?.startTime) {
      const duration = performance.now() - (response.config as any).metadata.startTime;
      // Используем setTimeout для неблокирующего логирования
      setTimeout(() => {
        console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration.toFixed(2)}ms`);
      }, 0);
    }
    return response;
  },
  async (error) => {
    // Логируем ошибки с временем
    if (process.env.NODE_ENV === 'development' && error.config?.metadata?.startTime) {
      const duration = performance.now() - error.config.metadata.startTime;
      console.error(`[API] ${error.config.method?.toUpperCase()} ${error.config.url}: ERROR after ${duration.toFixed(2)}ms`, error.message);
    }
    if (error.response?.status === 401) {
      const { refreshToken, logout } = useAuthStore.getState();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const { accessToken: newAccessToken } = response.data.data;
          useAuthStore.getState().login(
            useAuthStore.getState().user!,
            newAccessToken,
            refreshToken
          );
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(error.config);
        } catch {
          logout();
        }
      } else {
        logout();
      }
    }
    return Promise.reject(error);
  }
);

