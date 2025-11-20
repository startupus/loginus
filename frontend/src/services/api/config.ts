export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  // Таймаут удален для мгновенной обработки
  RETRY_ATTEMPTS: 0, // Без повторов для мгновенной обработки
};

