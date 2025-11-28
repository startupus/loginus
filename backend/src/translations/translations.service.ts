import { Injectable, Logger } from '@nestjs/common';
import { promises as fs, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

@Injectable()
export class TranslationsService {
  private readonly logger = new Logger(TranslationsService.name);
  private readonly version = '1.0.0';
  private modules: string[] = ['common', 'profile', 'auth', 'dashboard', 'help'];
  private locales: string[] = ['ru', 'en'];
  private readonly cache = new Map<string, Record<string, any>>();
  private readonly translationRoots: string[];

  constructor() {
    try {
      this.translationRoots = this.resolveTranslationRoots();
      this.logger.log(`[TranslationsService] Resolved ${this.translationRoots.length} translation roots`);
      this.scanAvailableLocalesAndModules();
      this.logger.log(`[TranslationsService] Initialized successfully`);
      this.logger.log(`[TranslationsService] Available locales: ${this.locales.join(', ')}`);
      this.logger.log(`[TranslationsService] Available modules: ${this.modules.join(', ')}`);
    } catch (error) {
      this.logger.error(`[TranslationsService] Error during initialization:`, error);
      if (error instanceof Error) {
        this.logger.error(`[TranslationsService] Error message: ${error.message}`);
        this.logger.error(`[TranslationsService] Error stack: ${error.stack}`);
      }
      // Устанавливаем дефолтные значения, чтобы сервис мог работать
      try {
        this.translationRoots = [resolve(__dirname, 'locales')];
      } catch (pathError) {
        this.logger.error(`[TranslationsService] Failed to set default path:`, pathError);
        this.translationRoots = [];
      }
      this.locales = ['ru', 'en'];
      this.modules = ['common', 'profile', 'auth', 'dashboard', 'help'];
      this.logger.warn(`[TranslationsService] Using fallback configuration`);
    }
  }

  /**
   * Получить переводы для нескольких модулей
   */
  async getModules(locale: string, modules: string[]) {
    try {
      const result: any[] = [];
      
      for (const module of modules) {
        try {
          const data = await this.getModuleData(locale, module);
          result.push({
            version: this.version,
            locale,
            module,
            data,
            timestamp: Date.now(),
            checksum: this.generateChecksum(data),
          });
        } catch (moduleError) {
          this.logger.warn(`Error loading module ${module} for locale ${locale}:`, moduleError);
          // Добавляем пустой модуль вместо ошибки
          result.push({
            version: this.version,
            locale,
            module,
            data: {},
            timestamp: Date.now(),
            checksum: '0',
          });
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Error in getModules for locale ${locale}, modules ${modules.join(',')}:`, error);
      // Возвращаем пустой массив вместо выбрасывания ошибки
      return [];
    }
  }

  /**
   * Получить переводы для одного модуля
   */
  async getModule(locale: string, module: string) {
    try {
      const data = await this.getModuleData(locale, module);
      
      return {
        version: this.version,
        locale,
        module,
        data,
        timestamp: Date.now(),
        checksum: this.generateChecksum(data),
      };
    } catch (error) {
      this.logger.error(`Error in getModule for locale ${locale}, module ${module}:`, error);
      // Возвращаем пустой модуль вместо выбрасывания ошибки
      return {
        version: this.version,
        locale,
        module,
        data: {},
        timestamp: Date.now(),
        checksum: '0',
      };
    }
  }

  /**
   * Получить версию переводов
   */
  async getVersion(locale: string) {
    return {
      version: this.version,
      locale,
      timestamp: Date.now(),
    };
  }

  /**
   * Получить статус системы переводов
   */
  async getStatus() {
    return {
      version: this.version,
      modules: this.modules,
      locales: this.locales,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Регистрируем возможные пути к файлам переводов
   */
  private resolveTranslationRoots(): string[] {
    const roots: string[] = [];
    
    // Добавляем пути только если они определены
    if (process.env.TRANSLATIONS_DIR) {
      roots.push(resolve(process.env.TRANSLATIONS_DIR));
    }
    
    // Пути относительно process.cwd()
    roots.push(resolve(process.cwd(), 'frontend', 'src', 'services', 'i18n', 'locales'));
    roots.push(resolve(process.cwd(), 'backend', 'src', 'translations', 'locales'));
    
    // Путь относительно __dirname (в dist будет dist/translations, в src - src/translations)
    try {
      const dirnamePath = resolve(__dirname, 'locales');
      roots.push(dirnamePath);
    } catch (error) {
      this.logger.warn(`[TranslationsService] Failed to resolve __dirname path:`, error);
    }
    
    // Docker paths (абсолютные)
    roots.push('/app/frontend/src/services/i18n/locales');
    roots.push('/app/backend/src/translations/locales');
    
    // Также проверяем путь в dist (для production)
    try {
      const distPath = resolve(process.cwd(), 'dist', 'translations', 'locales');
      roots.push(distPath);
    } catch (error) {
      // Игнорируем ошибки
    }

    const uniqueRoots = Array.from(new Set(roots));
    this.logger.log(`[TranslationsService] Translation roots resolved: ${uniqueRoots.join(', ')}`);
    return uniqueRoots;
  }

  /**
   * Сканируем доступные локали и модули, чтобы возвращать актуальный статус.
   */
  private scanAvailableLocalesAndModules() {
    try {
      const localeSet = new Set<string>(this.locales);
      const moduleSet = new Set<string>(this.modules);

      for (const root of this.translationRoots) {
        try {
          if (!existsSync(root)) {
            continue;
          }
          const localeDirs = readdirSync(root, { withFileTypes: true }).filter((dirent) =>
            dirent.isDirectory(),
          );

          for (const localeDir of localeDirs) {
            try {
              localeSet.add(localeDir.name);
              const files = readdirSync(join(root, localeDir.name), { withFileTypes: true }).filter(
                (dirent) => dirent.isFile() && dirent.name.endsWith('.json'),
              );
              for (const file of files) {
                moduleSet.add(file.name.replace('.json', ''));
              }
            } catch (error) {
              this.logger.warn(`[TranslationsService] Error scanning locale ${localeDir.name} in ${root}:`, error);
              // Продолжаем сканирование других локалей
            }
          }
        } catch (error) {
          this.logger.warn(`[TranslationsService] Error scanning root ${root}:`, error);
          // Продолжаем сканирование других корневых директорий
        }
      }

      this.locales = Array.from(localeSet);
      this.modules = Array.from(moduleSet);
    } catch (error) {
      this.logger.error(`[TranslationsService] Critical error in scanAvailableLocalesAndModules:`, error);
      // Используем дефолтные значения
      this.locales = ['ru', 'en'];
      this.modules = ['common', 'profile', 'auth', 'dashboard', 'help'];
    }
  }

  /**
   * Получить данные модуля перевода из файловой системы с кэшированием.
   */
  private async getModuleData(
    locale: string,
    module: string,
  ): Promise<Record<string, any>> {
    try {
      const cacheKey = `${locale}:${module}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      for (const root of this.translationRoots) {
        try {
          const filePath = join(root, locale, `${module}.json`);
          if (!existsSync(filePath)) {
            continue;
          }

          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          this.cache.set(cacheKey, data);
          return data;
        } catch (error) {
          this.logger.warn(
            `Failed to read translations from ${join(root, locale, `${module}.json`)}: ${(error as Error).message}`,
          );
          // Продолжаем поиск в других путях
          continue;
        }
      }

      // Если файл не найден, возвращаем пустой объект вместо ошибки
      this.logger.warn(`Missing translations for ${locale}/${module}. Checked paths: ${this.translationRoots.map(root => join(root, locale, `${module}.json`)).join(', ')}`);
      return {};
    } catch (error) {
      this.logger.error(`Error in getModuleData for ${locale}/${module}:`, error);
      // Возвращаем пустой объект вместо выбрасывания ошибки
      return {};
    }
  }

  /**
   * Генерировать checksum для данных
   */
  private generateChecksum(data: any): string {
    const str = JSON.stringify(data || {});
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

