import {
  Controller,
  All,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Req,
  Res,
  HttpException,
  HttpStatus,
  UseGuards,
  Body,
  Query,
  Param,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PluginRouterService } from './plugin-router.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

/**
 * Plugin Proxy Controller
 * Универсальный прокси-контроллер для всех плагинов
 * Перенаправляет запросы к соответствующим контроллерам плагинов
 * 
 * Формат URL: /api/v2/plugins/{plugin-slug}/{route-path}
 * Например: /api/v2/plugins/calculator-advanced/calculator/calculate
 */
@Controller('plugins')
@UseGuards(JwtAuthGuard)
export class PluginProxyController {
  private readonly logger = new Logger(PluginProxyController.name);

  constructor(private readonly pluginRouter: PluginRouterService) {}

  /**
   * Обработка всех HTTP методов для плагинов
   * Формат: /api/v2/plugins/{pluginSlug}/*
   * Используем @All с catch-all паттерном
   */
  @All('*')
  async proxyToPlugin(
    @Req() req: Request,
    @Res() res: Response,
    @Param('pluginSlug') pluginSlug: string,
    @Body() body: any,
    @Query() query: any,
  ): Promise<void> {
    // ✅ ЛОГИРОВАНИЕ: Проверяем, что метод вызывается
    console.log(`[PluginProxy] ⚡ METHOD CALLED: ${req.method} ${req.path}`);
    this.logger.log(`[PluginProxy] ⚡ METHOD CALLED: ${req.method} ${req.path}`);
    
    // Извлекаем путь из URL напрямую
    // Формат: /api/v2/plugins/{pluginSlug}/{routePath}
    // Например: /api/v2/plugins/tic-tac-toe/tic-tac-toe/move
    const fullPath = req.path || req.url?.split('?')[0] || '';
    const pluginPrefix = `/api/v2/plugins/`;
    
    if (!fullPath.startsWith(pluginPrefix)) {
      throw new HttpException(
        `Invalid plugin path: ${fullPath}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    
    // Извлекаем путь после /api/v2/plugins/
    const pathAfterPrefix = fullPath.substring(pluginPrefix.length);
    
    // Первая часть - это slug плагина, остальное - путь роута
    const pathParts = pathAfterPrefix.split('/').filter(p => p);
    if (pathParts.length === 0) {
      throw new HttpException(
        `Plugin slug not found in path: ${fullPath}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    
    const actualPluginSlug = pathParts[0];
    const routePath = pathParts.slice(1).join('/');
    const fullRoutePath = routePath ? `/${routePath}` : '/';
    
    // Обновляем pluginSlug на правильный
    pluginSlug = actualPluginSlug;
    const httpMethod = req.method;

    this.logger.log(
      `[PluginProxy] Request: ${httpMethod} /plugins/${pluginSlug}${fullRoutePath}`,
    );
    this.logger.debug(
      `[PluginProxy] Route path: "${routePath}", Full route path: "${fullRoutePath}", Plugin slug: "${pluginSlug}"`,
    );

    // Получаем контроллер плагина
    const pluginController = this.pluginRouter.getPluginController(pluginSlug);
    if (!pluginController) {
      this.logger.error(`[PluginProxy] Plugin "${pluginSlug}" not found or not loaded`);
      throw new HttpException(
        `Plugin "${pluginSlug}" not found or not loaded`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Получаем информацию о роуте
    const routeInfo = this.pluginRouter.getRouteInfo(fullRoutePath);
    
    if (!routeInfo) {
      // Логируем все зарегистрированные роуты для отладки
      const allRoutes = this.pluginRouter.getAllRoutes();
      this.logger.error(
        `[PluginProxy] Route "${fullRoutePath}" not found in plugin "${pluginSlug}". Available routes: ${JSON.stringify(allRoutes)}`,
      );
      throw new HttpException(
        `Route "${fullRoutePath}" not found in plugin "${pluginSlug}"`,
        HttpStatus.NOT_FOUND,
      );
    }
    
    this.logger.debug(
      `[PluginProxy] Route found: ${routeInfo.method} ${fullRoutePath} -> ${routeInfo.handler}`,
    );

    // Проверяем, что плагин совпадает
    if (routeInfo.slug !== pluginSlug) {
      throw new HttpException(
        `Route "${fullRoutePath}" belongs to plugin "${routeInfo.slug}", not "${pluginSlug}"`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Проверяем метод (если указан в манифесте)
    if (routeInfo.method !== 'ALL' && routeInfo.method !== httpMethod) {
      throw new HttpException(
        `Method ${httpMethod} not allowed for route "${fullRoutePath}". Expected: ${routeInfo.method}`,
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    try {
      // ✅ ИСПРАВЛЕНИЕ: Передаем request, чтобы контроллер мог получить user
      // Вызываем обработчик плагина
      // Передаем body как DTO (для методов с @Body())
      // Передаем query как параметры (для методов с @Query())
      // Передаем request для доступа к user и другим данным
      const result = await this.pluginRouter.callPluginHandler(
        pluginSlug,
        routeInfo.handler,
        [body, query, req], // Передаем body, query и request
      );

      // Отправляем ответ
      res.json(result);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[PluginProxy] Error executing plugin handler:`,
        error.message,
        error.stack,
      );

      throw new HttpException(
        `Error executing plugin handler: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

