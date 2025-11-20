import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DataPreloaderService } from '../data/data-preloader.service';

@Injectable()
export class TranslationsService {
  constructor(private readonly preloader: DataPreloaderService) {}

  getTranslations(locale: 'ru' | 'en'): any {
    const key = `translations/${locale}.json`;
    const preloaded = this.preloader.getPreloadedData<any>(key);
    if (preloaded) {
      return {
        success: true,
        data: preloaded,
      };
    }

    // Fallback: читаем с диска
    const filePath = path.join(__dirname, '../../data', key);
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);
    return {
      success: true,
      data: json,
    };
  }
}


