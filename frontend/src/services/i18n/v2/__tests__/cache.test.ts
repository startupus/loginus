/**
 * Тесты для системы кэширования переводов в IndexedDB
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { translationCache } from '../cache';
import { CACHE_TTL } from '../config';

// Мокаем IndexedDB
const mockDB = {
  objectStoreNames: {
    contains: vi.fn().mockReturnValue(false),
  },
  transaction: vi.fn(),
  createObjectStore: vi.fn(),
};

const mockStore = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  createIndex: vi.fn(),
  index: vi.fn(),
};

const mockTransaction = {
  objectStore: vi.fn().mockReturnValue(mockStore),
};

// Мокаем indexedDB
const mockIndexedDB = {
  open: vi.fn(),
};

// Устанавливаем моки
beforeEach(() => {
  global.indexedDB = mockIndexedDB as any;
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('translationCache', () => {
  describe('init', () => {
    it('должен инициализировать базу данных', async () => {
      const mockRequest = {
        onerror: null as any,
        onsuccess: null as any,
        onupgradeneeded: null as any,
        result: mockDB,
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);

      // Симулируем успешное открытие
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess({ target: mockRequest } as any);
        }
      }, 0);

      // Вызываем init через get, так как init приватный
      await translationCache.get('ru', 'common');

      expect(mockIndexedDB.open).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('должен возвращать null, если кэш пуст', async () => {
      const mockRequest = {
        onerror: null as any,
        onsuccess: null as any,
        result: null as any,
      };

      mockStore.get.mockReturnValue(mockRequest);
      mockTransaction.objectStore.mockReturnValue(mockStore);
      mockDB.transaction.mockReturnValue(mockTransaction);

      const mockOpenRequest = {
        onerror: null as any,
        onsuccess: null as any,
        onupgradeneeded: null as any,
        result: mockDB,
      };

      mockIndexedDB.open.mockReturnValue(mockOpenRequest);

      // Симулируем успешное открытие
      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
      }, 0);

      // Симулируем пустой результат
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess({ target: { result: undefined } } as any);
        }
      }, 10);

      const result = await translationCache.get('ru', 'common');

      expect(result).toBeNull();
    });

    it('должен возвращать кэшированные данные, если они не истекли', async () => {
      const mockCached = {
        id: 'ru:common',
        locale: 'ru',
        module: 'common',
        data: { common: { test: 'test' } },
        version: '1.0.0',
        checksum: 'abc123',
        timestamp: Date.now(),
        cachedAt: Date.now() - 1000, // Кэш свежий
      };

      const mockRequest = {
        onerror: null as any,
        onsuccess: null as any,
        result: mockCached,
      };

      mockStore.get.mockReturnValue(mockRequest);
      mockTransaction.objectStore.mockReturnValue(mockStore);
      mockDB.transaction.mockReturnValue(mockTransaction);

      const mockOpenRequest = {
        onerror: null as any,
        onsuccess: null as any,
        onupgradeneeded: null as any,
        result: mockDB,
      };

      mockIndexedDB.open.mockReturnValue(mockOpenRequest);

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
      }, 0);

      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess({ target: mockRequest } as any);
        }
      }, 10);

      const result = await translationCache.get('ru', 'common');

      expect(result).toEqual(mockCached);
    });

    it('должен удалять истекший кэш', async () => {
      const mockCached = {
        id: 'ru:common',
        locale: 'ru',
        module: 'common',
        data: { common: { test: 'test' } },
        version: '1.0.0',
        checksum: 'abc123',
        timestamp: Date.now(),
        cachedAt: Date.now() - (CACHE_TTL + 1000), // Кэш истек
      };

      const mockGetRequest = {
        onerror: null as any,
        onsuccess: null as any,
        result: mockCached,
      };

      const mockDeleteRequest = {
        onerror: null as any,
        onsuccess: null as any,
      };

      mockStore.get.mockReturnValue(mockGetRequest);
      mockStore.delete.mockReturnValue(mockDeleteRequest);
      mockTransaction.objectStore.mockReturnValue(mockStore);
      mockDB.transaction.mockReturnValue(mockTransaction);

      const mockOpenRequest = {
        onerror: null as any,
        onsuccess: null as any,
        onupgradeneeded: null as any,
        result: mockDB,
      };

      mockIndexedDB.open.mockReturnValue(mockOpenRequest);

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
      }, 0);

      setTimeout(() => {
        if (mockGetRequest.onsuccess) {
          mockGetRequest.onsuccess({ target: mockGetRequest } as any);
        }
      }, 10);

      const result = await translationCache.get('ru', 'common');

      expect(result).toBeNull();
      expect(mockStore.delete).toHaveBeenCalledWith('ru:common');
    });
  });

  describe('set', () => {
    it('должен сохранять данные в кэш', async () => {
      const mockPutRequest = {
        onerror: null as any,
        onsuccess: null as any,
      };

      mockStore.put.mockReturnValue(mockPutRequest);
      mockTransaction.objectStore.mockReturnValue(mockStore);
      mockDB.transaction.mockReturnValue(mockTransaction);

      const mockOpenRequest = {
        onerror: null as any,
        onsuccess: null as any,
        onupgradeneeded: null as any,
        result: mockDB,
      };

      mockIndexedDB.open.mockReturnValue(mockOpenRequest);

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
      }, 0);

      setTimeout(() => {
        if (mockPutRequest.onsuccess) {
          mockPutRequest.onsuccess({ target: mockPutRequest } as any);
        }
      }, 10);

      await translationCache.set(
        'ru',
        'common',
        { common: { test: 'test' } },
        '1.0.0',
        'abc123',
        Date.now(),
      );

      expect(mockStore.put).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('должен очищать весь кэш', async () => {
      const mockClearRequest = {
        onerror: null as any,
        onsuccess: null as any,
      };

      mockStore.clear.mockReturnValue(mockClearRequest);
      mockTransaction.objectStore.mockReturnValue(mockStore);
      mockDB.transaction.mockReturnValue(mockTransaction);

      const mockOpenRequest = {
        onerror: null as any,
        onsuccess: null as any,
        onupgradeneeded: null as any,
        result: mockDB,
      };

      mockIndexedDB.open.mockReturnValue(mockOpenRequest);

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
      }, 0);

      setTimeout(() => {
        if (mockClearRequest.onsuccess) {
          mockClearRequest.onsuccess({ target: mockClearRequest } as any);
        }
      }, 10);

      await translationCache.clear();

      expect(mockStore.clear).toHaveBeenCalled();
    });
  });
});

