/**
 * Система кэширования переводов в IndexedDB
 */

import type {
  CachedTranslation,
  Locale,
  ModuleName,
  TranslationVersion,
} from './types';
import {
  DB_NAME,
  DB_VERSION,
  STORE_NAME,
  CACHE_TTL,
} from './config';

/**
 * Класс для работы с кэшем переводов в IndexedDB
 */
class TranslationCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Инициализирует базу данных IndexedDB
   */
  private async init(): Promise<void> {
    if (this.db) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        this.initPromise = null;
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initPromise = null;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id', // Используем составной id вместо массива
          });
          store.createIndex('locale', 'locale', { unique: false });
          store.createIndex('module', 'module', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('version', 'version', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Получает кэшированный модуль перевода
   */
  async get(
    locale: Locale,
    module: ModuleName,
  ): Promise<CachedTranslation | null> {
    try {
      await this.init();

      if (!this.db) {
        return null;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(`${locale}:${module}`);

        request.onerror = () => {
          reject(request.error);
        };

        request.onsuccess = () => {
          const cached = request.result as CachedTranslation | undefined;

          if (!cached) {
            resolve(null);
            return;
          }

          // Проверяем, не истек ли срок кэша
          const now = Date.now();
          const age = now - cached.cachedAt;

          if (age > CACHE_TTL) {
            // Кэш истек, удаляем его
            this.delete(locale, module).catch(() => {});
            resolve(null);
            return;
          }

          resolve(cached);
        };
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to get from cache:', error);
      }
      return null;
    }
  }

  /**
   * Сохраняет модуль перевода в кэш
   */
  async set(
    locale: Locale,
    module: ModuleName,
    data: Record<string, any>,
    version: string,
    checksum: string,
    timestamp: number,
  ): Promise<void> {
    try {
      await this.init();

      if (!this.db) {
        return;
      }

      const cached: CachedTranslation & { id: string } = {
        id: `${locale}:${module}`, // Составной ключ
        locale,
        module,
        data,
        version,
        checksum,
        timestamp,
        cachedAt: Date.now(),
      };

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(cached);

        request.onerror = () => {
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to save to cache:', error);
      }
    }
  }

  /**
   * Удаляет модуль перевода из кэша
   */
  async delete(locale: Locale, module: ModuleName): Promise<void> {
    try {
      await this.init();

      if (!this.db) {
        return;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(`${locale}:${module}`);

        request.onerror = () => {
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to delete from cache:', error);
      }
    }
  }

  /**
   * Очищает весь кэш
   */
  async clear(): Promise<void> {
    try {
      await this.init();

      if (!this.db) {
        return;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onerror = () => {
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to clear cache:', error);
      }
    }
  }

  /**
   * Получает кэшированную версию переводов для локали
   */
  async getVersion(locale: Locale): Promise<TranslationVersion | null> {
    try {
      await this.init();

      if (!this.db) {
        return null;
      }

      // Получаем все модули для локали и находим самую новую версию
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('locale');
        const request = index.openCursor(IDBKeyRange.only(locale));

        let latestVersion: TranslationVersion | null = null;
        let maxTimestamp = 0;

        request.onerror = () => {
          reject(request.error);
        };

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const cached = cursor.value as CachedTranslation;
            if (cached.timestamp > maxTimestamp) {
              maxTimestamp = cached.timestamp;
              latestVersion = {
                version: cached.version,
                locale: cached.locale,
                timestamp: cached.timestamp,
              };
            }
            cursor.continue();
          } else {
            resolve(latestVersion);
          }
        };
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to get version from cache:', error);
      }
      return null;
    }
  }
}

/**
 * Экспортируем singleton экземпляр кэша
 */
export const translationCache = new TranslationCache();

