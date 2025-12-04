import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  
  // Настройка статической раздачи файлов
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log('Setting up static assets from:', uploadsPath);
  
  // Проверяем существование директории
  const fs = require('fs');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('Created uploads directory:', uploadsPath);
  }
  
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });
  console.log('Static assets configured for /uploads/*');
  
  // Также настраиваем раздачу для /api/v2/uploads (на случай если нужен полный путь)
  app.useStaticAssets(uploadsPath, {
    prefix: '/api/v2/uploads',
  });
  console.log('Static assets also configured for /api/v2/uploads/*');

  // Cookie parser
  app.use(cookieParser());

  // Настройка bodyParser для увеличения лимита размера запроса (для загрузки файлов)
  // Это важно для предотвращения ошибки 413 (Request Entity Too Large)
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ limit: '50mb', extended: true }));

  // Global prefix
  app.setGlobalPrefix('api/v2');

  // CORS
  const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
  const isDevelopment = configService.get('NODE_ENV') !== 'production';
  
  app.enableCors({
    origin: (origin, callback) => {
      // Разрешаем запросы без origin (например, с файловой системы или Postman)
      // Также разрешаем origin === "null" (браузерные запросы с null origin)
      if (!origin || origin === 'null') return callback(null, true);
      
      // В режиме разработки разрешаем все localhost и 127.0.0.1
      if (isDevelopment) {
        if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('0.0.0.0')) {
          return callback(null, true);
        }
      }
      
      const allowedOrigins = [
        frontendUrl,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:5173', // Vite default
        'http://localhost:5174', // Vite alternative
        'http://localhost:8080',
        'http://localhost:8081',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:8081',
        'https://loginus.ldmco.ru',
        'http://45.144.176.42:3000',
        'http://45.144.176.42:3002',
        'https://loginus.ldmco.ru',
        'http://loginus.ldmco.ru',
        'https://loginus.startapus.com',
        'http://loginus.startapus.com'
      ];
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Если это не в списке и не development, отклоняем
      return callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global exception filter для логирования всех ошибок
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  // ВАЖНО: НЕ применяем к multipart/form-data (файловым загрузкам)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Отключаем для поддержки файловых загрузок
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger setup
  if (configService.get('app.swaggerEnabled') !== false) {
    const config = new DocumentBuilder()
      .setTitle('Loginus API')
      .setDescription('API документация для системы управления базой знаний и поддержкой')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Введите JWT токен',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('auth', 'Аутентификация и авторизация')
      .addTag('users', 'Управление пользователями')
      .addTag('roles', 'Управление ролями')
      .addTag('permissions', 'Управление правами')
      .addTag('organizations', 'Организации')
      .addTag('teams', 'Команды')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v2/docs', app, document, {
      customSiteTitle: 'Loginus API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = configService.get('app.port') || 3001;
  
  // Добавляем middleware для отключения кеширования API ответов ПЕРЕД listen
  // Важно: в NestJS нужно использовать интерсептор или global interceptor
  app.use((req: any, res: any, next: any) => {
    // Для всех API запросов отключаем кеширование
    if (req.path && req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }
    next();
  });

  // ✅ ВРЕМЕННОЕ РЕШЕНИЕ: Добавляем middleware для логирования запросов к плагинам
  // Это поможет понять, доходят ли запросы до сервера
  app.use((req: any, res: any, next: any) => {
    if (req.path && req.path.startsWith('/api/v2/plugins')) {
      console.log(`[Middleware] Plugin request: ${req.method} ${req.path}`, {
        url: req.url,
        originalUrl: req.originalUrl,
        baseUrl: req.baseUrl,
      });
    }
    next();
  });
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/v2/docs`);
}

bootstrap();