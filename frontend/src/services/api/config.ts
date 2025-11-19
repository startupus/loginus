export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  TIMEOUT: 10000, // Таймаут 10 секунд для более быстрой обработки ошибок
  RETRY_ATTEMPTS: 1, // Уменьшено количество попыток для более быстрой обработки ошибок
};

