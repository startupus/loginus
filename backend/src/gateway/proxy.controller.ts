import {
  All,
  Controller,
  Req,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

/**
 * ProxyController — catch-all контроллер, который срабатывает только если
 * ни один другой контроллер не обработал запрос.
 *
 * Его задача — проксировать такие запросы на backend-mock, чтобы фронт
 * мог постепенно мигрировать на реальный backend, не теряя старый функционал.
 */
@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async proxyFallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const path = req.path || '';

    // ✅ ИСКЛЮЧЕНИЕ: Плагины обрабатываются PluginProxyController
    // В NestJS порядок обработки роутов зависит от специфичности паттерна
    // @All(':pluginSlug/*') более специфичен, чем @All('*'), поэтому должен обрабатываться раньше
    // Но если запрос все равно попадает сюда, значит PluginProxyController не сработал
    // В этом случае просто не обрабатываем плагины
    if (path.startsWith('/api/v2/plugins')) {
      // НЕ обрабатываем - должен был обработать PluginProxyController
      // Если запрос попал сюда, значит что-то не так с маршрутизацией
      throw new NotFoundException(`Plugin route not found: ${path}`);
    }

    // Не трогаем статические файлы и swagger-документацию
    if (
      path.startsWith('/uploads') ||
      path.startsWith('/api/v2/uploads') ||
      path.startsWith('/api/v2/docs')
    ) {
      throw new NotFoundException();
    }

    // Проксируем все остальные API-запросы на mock backend
    if (path.startsWith('/api/')) {
      await this.proxyService.forward(req, res);
      return;
    }

    // Для не-API запросов отдаём 404, чтобы не ломать статику/SPA
    throw new NotFoundException();
  }
}


