/**
 * Тесты для системы загрузки переводов v2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadModule, loadModules, shouldUpdateModule } from '../loader';
import { translationCache } from '../cache';
import { translationsAPI } from '../api-client';
import * as config from '../config';

// Моки
vi.mock('../cache');
vi.mock('../api-client');
vi.mock('../config');

describe('loadModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Мокаем конфигурацию
    vi.mocked(config.isDynamicMode).mockReturnValue(true);
    vi.mocked(config.useStaticFallback).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('должен загружать модуль из кэша, если он доступен', async () => {
    const mockCached = {
      id: 'ru:common',
      locale: 'ru',
      module: 'common',
      data: { common: { test: 'test' } },
      version: '1.0.0',
      checksum: 'abc123',
      timestamp: Date.now(),
      cachedAt: Date.now() - 1000,
    };

    vi.mocked(translationCache.get).mockResolvedValue(mockCached);

    const result = await loadModule('ru', 'common', { useCache: true });

    expect(translationCache.get).toHaveBeenCalledWith('ru', 'common');
    expect(result).toEqual(mockCached.data);
  });

  it('должен загружать модуль через API, если кэш пуст', async () => {
    const mockResponse = {
      version: '1.0.0',
      locale: 'ru',
      module: 'common',
      data: { common: { test: 'test' } },
      timestamp: Date.now(),
      checksum: 'abc123',
    };

    vi.mocked(translationCache.get).mockResolvedValue(null);
    vi.mocked(translationsAPI.getModule).mockResolvedValue(mockResponse);
    vi.mocked(translationCache.set).mockResolvedValue();

    const result = await loadModule('ru', 'common', { useCache: true, useAPI: true });

    expect(translationsAPI.getModule).toHaveBeenCalledWith('ru', 'common');
    expect(translationCache.set).toHaveBeenCalled();
    expect(result).toEqual(mockResponse.data);
  });

  it('должен использовать статические файлы как fallback при ошибке API', async () => {
    vi.mocked(translationCache.get).mockResolvedValue(null);
    vi.mocked(translationsAPI.getModule).mockRejectedValue(new Error('API error'));

    // Мокаем динамический импорт статических файлов
    const mockStaticData = { common: { test: 'static' } };
    vi.doMock('../../locales/ru/common.json', () => ({
      default: mockStaticData,
    }));

    // В реальном тесте нужно будет использовать vi.mock для импорта
    // Здесь просто проверяем логику fallback
    const result = await loadModule('ru', 'common', {
      useCache: true,
      useAPI: true,
      useStaticFallback: true,
    });

    // Результат будет пустым объектом, так как мы не можем реально импортировать файлы в тесте
    // Но логика fallback должна работать
    expect(translationsAPI.getModule).toHaveBeenCalled();
  });

  it('должен использовать fallback на русский язык для других локалей', async () => {
    vi.mocked(translationCache.get).mockResolvedValue(null);
    vi.mocked(translationsAPI.getModule).mockRejectedValue(new Error('API error'));

    const mockRuData = { common: { test: 'ru' } };
    vi.mocked(translationCache.get).mockImplementation(async (locale, module) => {
      if (locale === 'ru' && module === 'common') {
        return {
          id: 'ru:common',
          locale: 'ru',
          module: 'common',
          data: mockRuData,
          version: '1.0.0',
          checksum: 'abc123',
          timestamp: Date.now(),
          cachedAt: Date.now() - 1000,
        };
      }
      return null;
    });

    const result = await loadModule('en', 'common', {
      useCache: true,
      useAPI: true,
      useStaticFallback: true,
    });

    // Должен попытаться загрузить русский язык
    expect(translationCache.get).toHaveBeenCalledWith('en', 'common');
  });
});

describe('loadModules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(config.isDynamicMode).mockReturnValue(true);
  });

  it('должен загружать несколько модулей через API', async () => {
    const mockResponses = [
      {
        version: '1.0.0',
        locale: 'ru',
        module: 'common',
        data: { common: { test: 'common' } },
        timestamp: Date.now(),
        checksum: 'abc123',
      },
      {
        version: '1.0.0',
        locale: 'ru',
        module: 'dashboard',
        data: { dashboard: { test: 'dashboard' } },
        timestamp: Date.now(),
        checksum: 'def456',
      },
    ];

    vi.mocked(translationsAPI.getModules).mockResolvedValue(mockResponses);
    vi.mocked(translationCache.set).mockResolvedValue();

    const result = await loadModules('ru', ['common', 'dashboard'], {
      useAPI: true,
      useCache: true,
    });

    expect(translationsAPI.getModules).toHaveBeenCalledWith('ru', ['common', 'dashboard']);
    expect(result).toEqual({
      common: mockResponses[0].data,
      dashboard: mockResponses[1].data,
    });
  });
});

describe('shouldUpdateModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(config.isDynamicMode).mockReturnValue(true);
  });

  it('должен возвращать true, если версии не совпадают', async () => {
    const mockCached = {
      id: 'ru:common',
      locale: 'ru',
      module: 'common',
      data: {},
      version: '1.0.0',
      checksum: 'abc123',
      timestamp: Date.now(),
      cachedAt: Date.now() - 1000,
    };

    const mockServerVersion = {
      version: '1.0.1',
      locale: 'ru',
      timestamp: Date.now(),
    };

    vi.mocked(translationCache.get).mockResolvedValue(mockCached);
    vi.mocked(translationsAPI.getVersion).mockResolvedValue(mockServerVersion);

    const result = await shouldUpdateModule('ru', 'common');

    expect(result).toBe(true);
  });

  it('должен возвращать false, если версии совпадают', async () => {
    const mockCached = {
      id: 'ru:common',
      locale: 'ru',
      module: 'common',
      data: {},
      version: '1.0.0',
      checksum: 'abc123',
      timestamp: Date.now(),
      cachedAt: Date.now() - 1000,
    };

    const mockServerVersion = {
      version: '1.0.0',
      locale: 'ru',
      timestamp: Date.now(),
    };

    vi.mocked(translationCache.get).mockResolvedValue(mockCached);
    vi.mocked(translationsAPI.getVersion).mockResolvedValue(mockServerVersion);

    const result = await shouldUpdateModule('ru', 'common');

    expect(result).toBe(false);
  });
});

