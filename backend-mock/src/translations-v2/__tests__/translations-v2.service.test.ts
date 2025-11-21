/**
 * Тесты для сервиса переводов v2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TranslationsV2Service } from '../translations-v2.service';
import { DataPreloaderService } from '../../data/data-preloader.service';
import * as fs from 'fs';
import * as path from 'path';

// Моки
vi.mock('fs');
vi.mock('path');
vi.mock('crypto', () => ({
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('abc123checksum'),
  })),
}));

describe('TranslationsV2Service', () => {
  let service: TranslationsV2Service;
  let mockPreloader: DataPreloaderService;

  beforeEach(() => {
    mockPreloader = {
      getPreloadedData: vi.fn(),
    } as any;

    // Мокаем package.json
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ version: '1.0.0' }),
    );

    // Мокаем path.join
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

    service = new TranslationsV2Service(mockPreloader);
  });

  describe('getModule', () => {
    it('должен загружать модуль из предзагруженных данных', () => {
      const mockData = { common: { test: 'test' } };
      vi.mocked(mockPreloader.getPreloadedData).mockReturnValue(mockData);

      const result = service.getModule('ru', 'common');

      expect(result).toMatchObject({
        version: '1.0.0',
        locale: 'ru',
        module: 'common',
        data: mockData,
        checksum: 'abc123checksum',
      });
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it('должен загружать модуль с диска, если нет в предзагрузке', () => {
      const mockData = { common: { test: 'test' } };
      vi.mocked(mockPreloader.getPreloadedData).mockReturnValue(undefined);
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockData));

      const result = service.getModule('ru', 'common');

      expect(result).toMatchObject({
        version: '1.0.0',
        locale: 'ru',
        module: 'common',
        data: mockData,
      });
    });

    it('должен выбрасывать ошибку для несуществующего модуля', () => {
      expect(() => service.getModule('ru', 'nonexistent' as any)).toThrow(
        'Module nonexistent not found',
      );
    });
  });

  describe('getModules', () => {
    it('должен загружать несколько модулей', () => {
      const mockCommon = { common: { test: 'common' } };
      const mockDashboard = { dashboard: { test: 'dashboard' } };

      vi.mocked(mockPreloader.getPreloadedData).mockImplementation((key: string) => {
        if (key.includes('common')) return mockCommon;
        if (key.includes('dashboard')) return mockDashboard;
        return undefined;
      });

      const result = service.getModules('ru', ['common', 'dashboard']);

      expect(result).toHaveLength(2);
      expect(result[0].module).toBe('common');
      expect(result[1].module).toBe('dashboard');
    });

    it('должен фильтровать несуществующие модули', () => {
      const mockCommon = { common: { test: 'common' } };
      vi.mocked(mockPreloader.getPreloadedData).mockReturnValue(mockCommon);

      const result = service.getModules('ru', ['common', 'nonexistent' as any]);

      expect(result).toHaveLength(1);
      expect(result[0].module).toBe('common');
    });
  });

  describe('getStatus', () => {
    it('должен возвращать статус системы', () => {
      const result = service.getStatus();

      expect(result).toMatchObject({
        version: '1.0.0',
        modules: expect.arrayContaining(['common', 'dashboard']),
        locales: ['ru', 'en'],
      });
      expect(result.lastUpdated).toBeGreaterThan(0);
    });
  });

  describe('getVersion', () => {
    it('должен возвращать версию для локали', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({
        mtimeMs: 1234567890,
      } as any);

      const result = service.getVersion('ru');

      expect(result).toMatchObject({
        version: '1.0.0',
        locale: 'ru',
        timestamp: 1234567890,
      });
    });
  });
});

