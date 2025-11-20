import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataPreloaderService } from './data/data-preloader.service';
import { TimingInterceptor } from './common/timing.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Глобальная телеметрия времени обработки запросов
  app.useGlobalInterceptors(new TimingInterceptor());

  // Предзагрузка данных до старта сервера
  try {
    const preloader = app.get(DataPreloaderService);
    const start = Date.now();
    await preloader.preloadAll();
    const duration = Date.now() - start;
    console.log(`📦 Данные предзагружены за ${duration} мс`);
  } catch (e) {
    console.warn('⚠️ Не удалось выполнить предзагрузку данных. Продолжаем старт без неё.', e);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend Mock запущен на http://localhost:${port}/api/v1`);
}

bootstrap();

