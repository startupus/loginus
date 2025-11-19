export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  TIMEOUT: 15000, // Таймаут 15 секунд для надежности
  RETRY_ATTEMPTS: 1, // Уменьшено количество попыток для более быстрой обработки ошибок
};

