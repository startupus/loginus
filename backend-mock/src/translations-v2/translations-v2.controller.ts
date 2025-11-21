import { Controller, Get, Param, Query } from '@nestjs/common';
import { TranslationsV2Service } from './translations-v2.service';

/**
 * Контроллер для API v2 переводов
 * Предоставляет модульную загрузку переводов с версионированием
 * Работает на /api/v2/translations
 * Примечание: путь 'v2/translations' будет доступен как /api/v1/v2/translations из-за глобального префикса
 * Для правильной работы нужно использовать полный путь или настроить роутинг отдельно
 */
@Controller('v2/translations')
export class TranslationsV2Controller {
  constructor(private readonly translationsService: TranslationsV2Service) {}

  /**
   * GET /api/v2/translations/:locale/:module
   * Загружает отдельный модуль перевода
   */
  @Get(':locale/:module')
  getModule(
    @Param('locale') locale: string,
    @Param('module') module: string,
  ) {
    const normalized = (locale || 'ru').toLowerCase();
    const l = normalized === 'en' ? 'en' : 'ru';
    return this.translationsService.getModule(l, module);
  }

  /**
   * GET /api/v2/translations/:locale?modules=a,b,c
   * Загружает несколько модулей одновременно
   */
  @Get(':locale')
  getModules(
    @Param('locale') locale: string,
    @Query('modules') modules?: string,
  ) {
    const normalized = (locale || 'ru').toLowerCase();
    const l = normalized === 'en' ? 'en' : 'ru';

    // Если указаны модули через query параметр
    if (modules) {
      const moduleList = modules.split(',').map((m) => m.trim()).filter(Boolean);
      if (moduleList.length > 0) {
        return {
          success: true,
          data: this.translationsService.getModules(l, moduleList),
        };
      }
    }

    // Если модули не указаны, возвращаем все модули
    return {
      success: true,
      data: this.translationsService.getAllModules(l),
    };
  }

  /**
   * GET /api/v2/translations/:locale/version
   * Проверяет версию переводов для локали
   */
  @Get(':locale/version')
  getVersion(@Param('locale') locale: string) {
    const normalized = (locale || 'ru').toLowerCase();
    const l = normalized === 'en' ? 'en' : 'ru';
    return this.translationsService.getVersion(l);
  }

  /**
   * GET /api/v2/translations/status
   * Получает статус и доступные модули
   */
  @Get('status')
  getStatus() {
    return this.translationsService.getStatus();
  }
}

