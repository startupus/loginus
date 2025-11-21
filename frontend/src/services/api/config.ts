export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v2',
  TIMEOUT: 10000, // 10 секунд таймаут для предотвращения зависаний
  RETRY_ATTEMPTS: 0, // Без повторов для мгновенной обработки
};

