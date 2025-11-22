import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { promises as fs } from 'fs';

type PreloadedMap = Record<string, unknown>;

@Injectable()
export class DataPreloaderService {
  private readonly logger = new Logger(DataPreloaderService.name);
  private preloadedData: PreloadedMap = {};
  private isPreloaded = false;

  /**
   * Предзагружает критичные JSON-файлы в память на старте приложения.
   * Это устраняет задержку первой выдачи из-за медленного чтения с диска (Google Drive FS).
   */
  async preloadAll(): Promise<void> {
    if (this.isPreloaded) {
      return;
    }

    const start = Date.now();
    const dataDir = path.join(__dirname, '../../data');

    const filesToPreload = [
      { key: 'profile.json', filePath: path.join(dataDir, 'profile.json') },
      { key: 'users.json', filePath: path.join(dataDir, 'users.json') },
      { key: 'companies.json', filePath: path.join(dataDir, 'companies.json') },
      { key: 'backup-settings.json', filePath: path.join(dataDir, 'backup-settings.json') },
      { key: 'backup-history.json', filePath: path.join(dataDir, 'backup-history.json') },
      // Предзагружаем критичные модули v2 (common, profile) для быстрого старта
      { key: 'translations/v2/ru/common.json', filePath: path.join(dataDir, 'translations/v2/ru/common.json') },
      { key: 'translations/v2/ru/profile.json', filePath: path.join(dataDir, 'translations/v2/ru/profile.json') },
      { key: 'translations/v2/en/common.json', filePath: path.join(dataDir, 'translations/v2/en/common.json') },
      { key: 'translations/v2/en/profile.json', filePath: path.join(dataDir, 'translations/v2/en/profile.json') },
      // При необходимости можно добавить также:
      // { key: 'sessions.json', filePath: path.join(dataDir, 'sessions.json') },
    ];

    try {
      const results = await Promise.allSettled(
        filesToPreload.map(async ({ key, filePath }) => {
          const content = await fs.readFile(filePath, 'utf-8');
          this.preloadedData[key] = JSON.parse(content);
        })
      );

      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        this.logger.warn(
          `Предзагрузка завершилась с ошибками для ${failures.length} файла(ов). Это не критично, сервис продолжит работу, используя fallback к чтению с диска.`
        );
      }

      this.isPreloaded = true;
      const duration = Date.now() - start;
      this.logger.log(`Предзагрузка данных выполнена за ${duration} мс`);
    } catch (err) {
      this.logger.error('Ошибка предзагрузки данных', err as Error);
      // Не бросаем исключение — бэкенд продолжит работать с чтением с диска на первом запросе
    }
  }

  /**
   * Возвращает предзагруженные данные по ключу (относительный путь внутри data/).
   * Например: 'profile.json', 'users.json'
   */
  getPreloadedData<T = unknown>(key: string): T | undefined {
    return this.preloadedData[key] as T | undefined;
  }
}


