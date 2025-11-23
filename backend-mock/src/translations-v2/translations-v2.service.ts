import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { DataPreloaderService } from '../data/data-preloader.service';

/**
 * Интерфейс ответа API для отдельного модуля перевода
 */
export interface TranslationModuleResponse {
  version: string;
  locale: string;
  module: string;
  data: Record<string, any>;
  timestamp: number;
  checksum: string;
}

/**
 * Интерфейс статуса переводов
 */
export interface TranslationStatus {
  version: string;
  modules: string[];
  locales: string[];
  lastUpdated: number;
}

/**
 * Доступные модули переводов
 */
const AVAILABLE_MODULES = [
  'common',
  'dashboard',
  'auth',
  'profile',
  'errors',
  'landing',
  'about',
  'features',
  'help',
  'work',
  'modals',
  'support',
  'payment',
  'admin',
] as const;

type ModuleName = typeof AVAILABLE_MODULES[number];

/**
 * Сервис для работы с переводами v2 (модульная структура)
 */
@Injectable()
export class TranslationsV2Service {
  private readonly logger = new Logger(TranslationsV2Service.name);
  private readonly translationsVersion: string;
  private readonly v2DataPath: string;

  constructor(private readonly preloader: DataPreloaderService) {
    // Получаем версию из package.json
    try {
      const packageJsonPath = path.join(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      this.translationsVersion = packageJson.version || '1.0.0';
    } catch {
      this.translationsVersion = '1.0.0';
    }

    this.v2DataPath = path.join(__dirname, '../../data/translations/v2');
  }

  /**
   * Получает переводы для конкретного модуля
   */
  getModule(
    locale: 'ru' | 'en',
    module: string,
  ): TranslationModuleResponse {
    const normalizedLocale = locale === 'en' ? 'en' : 'ru';
    const normalizedModule = module.toLowerCase();

    // Проверяем, что модуль существует
    if (!AVAILABLE_MODULES.includes(normalizedModule as ModuleName)) {
      throw new Error(`Module ${normalizedModule} not found`);
    }

    // Пытаемся загрузить из предзагруженных данных
    const preloadKey = `translations/v2/${normalizedLocale}/${normalizedModule}.json`;
    let moduleData: Record<string, any> | undefined;

    try {
      moduleData = this.preloader.getPreloadedData<Record<string, any>>(
        preloadKey,
      );
    } catch {
      // Игнорируем ошибки предзагрузки
    }

    // Если не найдено в предзагрузке, читаем с диска
    if (!moduleData) {
      const filePath = path.join(
        this.v2DataPath,
        normalizedLocale,
        `${normalizedModule}.json`,
      );

      if (!fs.existsSync(filePath)) {
        throw new Error(
          `Translation file not found: ${normalizedLocale}/${normalizedModule}.json`,
        );
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      moduleData = JSON.parse(content);
    }

    // Вычисляем checksum для проверки целостности
    const dataString = JSON.stringify(moduleData);
    const checksum = crypto
      .createHash('md5')
      .update(dataString)
      .digest('hex');

    return {
      version: this.translationsVersion,
      locale: normalizedLocale,
      module: normalizedModule,
      data: moduleData,
      timestamp: Date.now(),
      checksum,
    };
  }

  /**
   * Получает несколько модулей одновременно
   */
  getModules(
    locale: 'ru' | 'en',
    modules: string[],
  ): TranslationModuleResponse[] {
    const normalizedLocale = locale === 'en' ? 'en' : 'ru';
    const normalizedModules = modules.map((m) => m.toLowerCase());

    // Фильтруем только существующие модули
    const validModules = normalizedModules.filter((m) =>
      AVAILABLE_MODULES.includes(m as ModuleName),
    );

    if (validModules.length === 0) {
      throw new Error('No valid modules provided');
    }

    return validModules.map((module) => this.getModule(normalizedLocale, module));
  }

  /**
   * Получает все модули для локали
   */
  getAllModules(locale: 'ru' | 'en'): Record<string, any> {
    const normalizedLocale = locale === 'en' ? 'en' : 'ru';
    const allModules: Record<string, any> = {};

    AVAILABLE_MODULES.forEach((module) => {
      try {
        const moduleResponse = this.getModule(normalizedLocale, module);
        allModules[module] = moduleResponse.data;
      } catch (error) {
        this.logger.warn(
          `Failed to load module ${module} for locale ${normalizedLocale}: ${error}`,
        );
      }
    });

    return allModules;
  }

  /**
   * Получает статус переводов (версия, доступные модули, локали)
   */
  getStatus(): TranslationStatus {
    return {
      version: this.translationsVersion,
      modules: [...AVAILABLE_MODULES],
      locales: ['ru', 'en'],
      lastUpdated: Date.now(),
    };
  }

  /**
   * Получает версию переводов для конкретной локали
   */
  getVersion(locale: 'ru' | 'en'): { version: string; locale: string; timestamp: number } {
    const normalizedLocale = locale === 'en' ? 'en' : 'ru';
    
    // Пытаемся определить timestamp последнего обновления
    // Берем самый новый файл из модулей
    let maxTimestamp = 0;
    AVAILABLE_MODULES.forEach((module) => {
      try {
        const filePath = path.join(
          this.v2DataPath,
          normalizedLocale,
          `${module}.json`,
        );
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          maxTimestamp = Math.max(maxTimestamp, stats.mtimeMs);
        }
      } catch {
        // Игнорируем ошибки
      }
    });

    return {
      version: this.translationsVersion,
      locale: normalizedLocale,
      timestamp: maxTimestamp || Date.now(),
    };
  }
}

