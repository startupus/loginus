import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataPreloaderService } from './data/data-preloader.service';
import { TimingInterceptor } from './common/timing.interceptor';
import { TranslationsV2Service } from './translations-v2/translations-v2.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix для API v2
  app.setGlobalPrefix('api/v2');
  
  // Для translations v2 используем отдельный роутинг через Express напрямую
  // Это позволяет обойти глобальный префикс для translations эндпоинтов
  const expressApp = app.getHttpAdapter().getInstance();
  const translationsV2Service = app.get(TranslationsV2Service);
  
  // Регистрируем translations роуты на /api/v2/translations
  // ВАЖНО: Порядок имеет значение - более специфичные роуты должны быть раньше
  
  // 1. Статус (самый специфичный)
  expressApp.get('/api/v2/translations/status', (req, res) => {
    res.json(translationsV2Service.getStatus());
  });
  
  // 2. Версия для локали (более специфичный, чем просто locale)
  expressApp.get('/api/v2/translations/:locale/version', (req, res) => {
    const locale = req.params.locale === 'en' ? 'en' : 'ru';
    res.json(translationsV2Service.getVersion(locale));
  });
  
  // 3. Отдельный модуль (locale/:module)
  expressApp.get('/api/v2/translations/:locale/:module', (req, res) => {
    const locale = req.params.locale === 'en' ? 'en' : 'ru';
    try {
      res.json(translationsV2Service.getModule(locale, req.params.module));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // 4. Все модули для локали или несколько модулей (самый общий)
  expressApp.get('/api/v2/translations/:locale', (req, res) => {
    const locale = req.params.locale === 'en' ? 'en' : 'ru';
    const modules = req.query.modules as string;
    
    if (modules) {
      const moduleList = modules.split(',').map((m: string) => m.trim()).filter(Boolean);
      res.json({
        success: true,
        data: translationsV2Service.getModules(locale, moduleList),
      });
    } else {
      res.json({
        success: true,
        data: translationsV2Service.getAllModules(locale),
      });
    }
  });

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
  console.log(`🚀 Backend Mock запущен на http://localhost:${port}/api/v2`);
}

bootstrap();

