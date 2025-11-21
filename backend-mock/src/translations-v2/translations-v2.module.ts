import { Module } from '@nestjs/common';
import { TranslationsV2Service } from './translations-v2.service';
import { TranslationsV2Controller } from './translations-v2.controller';
import { DataPreloaderModule } from '../data/data-preloader.module';

/**
 * Модуль для работы с переводами v2 (модульная структура)
 */
@Module({
  imports: [DataPreloaderModule],
  providers: [TranslationsV2Service],
  controllers: [TranslationsV2Controller],
  exports: [TranslationsV2Service],
})
export class TranslationsV2Module {}

