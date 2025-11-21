/**
 * Тесты для API клиента переводов v2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { translationsAPI } from '../api-client';
import { API_V2_BASE_URL } from '../config';

// Мокаем fetch
global.fetch = vi.fn();

describe('translationsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getModule', () => {
    it('должен загружать модуль перевода', async () => {
      const mockResponse = {
        version: '1.0.0',
        locale: 'ru',
        module: 'common',
        data: { common: { test: 'test' } },
        timestamp: Date.now(),
        checksum: 'abc123',
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await translationsAPI.getModule('ru', 'common');

      expect(fetch).toHaveBeenCalledWith(
        `${API_V2_BASE_URL}/translations/ru/common`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('должен выбрасывать ошибку при неудачном запросе', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      } as Response);

      await expect(translationsAPI.getModule('ru', 'common')).rejects.toThrow(
        'Failed to load module common for locale ru: Not Found',
      );
    });
  });

  describe('getModules', () => {
    it('должен загружать несколько модулей', async () => {
      const mockResponse = {
        success: true,
        data: [
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
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await translationsAPI.getModules('ru', ['common', 'dashboard']);

      expect(fetch).toHaveBeenCalledWith(
        `${API_V2_BASE_URL}/translations/ru?modules=common,dashboard`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getStatus', () => {
    it('должен получать статус переводов', async () => {
      const mockResponse = {
        version: '1.0.0',
        modules: ['common', 'dashboard'],
        locales: ['ru', 'en'],
        lastUpdated: Date.now(),
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await translationsAPI.getStatus();

      expect(fetch).toHaveBeenCalledWith(
        `${API_V2_BASE_URL}/translations/status`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getVersion', () => {
    it('должен получать версию переводов для локали', async () => {
      const mockResponse = {
        version: '1.0.0',
        locale: 'ru',
        timestamp: Date.now(),
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await translationsAPI.getVersion('ru');

      expect(fetch).toHaveBeenCalledWith(
        `${API_V2_BASE_URL}/translations/ru/version`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('isAvailable', () => {
    it('должен возвращать true, если API доступен', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ version: '1.0.0' }),
      } as Response);

      const result = await translationsAPI.isAvailable();

      expect(result).toBe(true);
    });

    it('должен возвращать false, если API недоступен', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await translationsAPI.isAvailable();

      expect(result).toBe(false);
    });
  });
});

