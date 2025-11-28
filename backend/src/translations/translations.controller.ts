import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { TranslationsService } from './translations.service';

@ApiTags('translations')
@Controller('translations')
export class TranslationsController {
  private readonly logger = new Logger(TranslationsController.name);

  constructor(private readonly translationsService: TranslationsService) {}

  @Get(':locale')
  @Public()
  @ApiOperation({ summary: 'Получить переводы для локали (несколько модулей)' })
  @ApiResponse({ status: 200, description: 'Переводы загружены' })
  async getTranslations(
    @Param('locale') locale: string,
    @Query('modules') modules?: string,
  ) {
    try {
      const moduleList = modules ? modules.split(',') : ['common'];
      const result = await this.translationsService.getModules(locale, moduleList);
      // Если все модули пустые, это нормально - фронтенд использует fallback
      return result;
    } catch (error) {
      this.logger.error(`Error getting translations for locale ${locale}:`, error);
      // Возвращаем пустой массив вместо ошибки, чтобы фронтенд мог использовать fallback
      return [];
    }
  }

  @Get(':locale/:module')
  @Public()
  @ApiOperation({ summary: 'Получить переводы для конкретного модуля' })
  @ApiResponse({ status: 200, description: 'Переводы модуля загружены' })
  async getModule(
    @Param('locale') locale: string,
    @Param('module') module: string,
  ) {
    try {
      const result = await this.translationsService.getModule(locale, module);
      // Если модуль пустой, это нормально - фронтенд использует fallback
      return result;
    } catch (error) {
      this.logger.error(`Error getting module ${module} for locale ${locale}:`, error);
      // Возвращаем пустой объект вместо ошибки, чтобы фронтенд мог использовать fallback
      return {
        version: '1.0.0',
        locale,
        module,
        data: {},
        timestamp: Date.now(),
        checksum: '0',
      };
    }
  }

  @Get(':locale/version')
  @Public()
  @ApiOperation({ summary: 'Получить версию переводов для локали' })
  @ApiResponse({ status: 200, description: 'Версия переводов' })
  async getVersion(@Param('locale') locale: string) {
    return this.translationsService.getVersion(locale);
  }

  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Получить статус системы переводов' })
  @ApiResponse({ status: 200, description: 'Статус системы переводов' })
  async getStatus() {
    return this.translationsService.getStatus();
  }
}

