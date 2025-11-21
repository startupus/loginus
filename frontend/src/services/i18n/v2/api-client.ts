/**
 * API клиент для работы с переводами v2
 */

import type {
  Locale,
  ModuleName,
  TranslationModuleResponse,
  TranslationStatus,
  TranslationVersion,
} from './types';
import { API_V2_BASE_URL } from './config';

/**
 * Таймаут для запросов переводов (10 секунд)
 */
const REQUEST_TIMEOUT = 10000;

/**
 * Создает fetch запрос с таймаутом
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Класс для работы с API переводов v2
 */
class TranslationsAPI {
  /**
   * Загружает отдельный модуль перевода
   */
  async getModule(
    locale: Locale,
    module: ModuleName,
  ): Promise<TranslationModuleResponse> {
    const url = `${API_V2_BASE_URL}/translations/${locale}/${module}`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to load module ${module} for locale ${locale}: ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Загружает несколько модулей одновременно
   */
  async getModules(
    locale: Locale,
    modules: ModuleName[],
  ): Promise<TranslationModuleResponse[]> {
    const modulesParam = modules.join(',');
    const url = `${API_V2_BASE_URL}/translations/${locale}?modules=${modulesParam}`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to load modules for locale ${locale}: ${response.statusText}`,
      );
    }

    const result = await response.json();
    return result.data || [];
  }

  /**
   * Получает статус переводов
   */
  async getStatus(): Promise<TranslationStatus> {
    const url = `${API_V2_BASE_URL}/translations/status`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получает версию переводов для локали
   */
  async getVersion(locale: Locale): Promise<TranslationVersion> {
    const url = `${API_V2_BASE_URL}/translations/${locale}/version`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get version for locale ${locale}: ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Проверяет, доступен ли API v2
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.getStatus();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Экспортируем singleton экземпляр API клиента
 */
export const translationsAPI = new TranslationsAPI();

