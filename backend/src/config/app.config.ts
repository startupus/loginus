import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  swaggerEnabled: process.env.SWAGGER_ENABLED !== 'false',
  logLevel: process.env.LOG_LEVEL || 'debug',
  /**
   * Базовый URL для mock backend.
   * Используется gateway-слоем для проксирования не реализованных на real backend эндпоинтов.
   * Может быть переопределён через переменную окружения MOCK_BACKEND_URL.
   *
   * Примеры:
   * - локально с docker-compose: http://backend-mock:3001
   * - локально без docker:      http://localhost:3003
   */
  mockBackendUrl:
    process.env.MOCK_BACKEND_URL ||
    process.env.MOCK_BACKEND_URL_INTERNAL || // запасной вариант, если нужно разделять внутренний/внешний URL
    'http://localhost:3003',
}));
