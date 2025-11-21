import { Module } from '@nestjs/common';
import { TranslationsV2Service } from './translations-v2.service';
import { DataPreloaderModule } from '../data/data-preloader.module';

/**
 * Модуль для работы с переводами v2 (модульная структура)
 * Контроллер не используется здесь, так как роуты регистрируются напрямую через Express в main.ts
 */
@Module({
  imports: [DataPreloaderModule],
  providers: [TranslationsV2Service],
  exports: [TranslationsV2Service],
})
export class TranslationsV2Module {}

