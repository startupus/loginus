import { Controller, Get, Param } from '@nestjs/common';
import { TranslationsService } from './translations.service';

@Controller('translations')
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Get(':locale')
  getByLocale(@Param('locale') locale: string) {
    const normalized = (locale || 'ru').toLowerCase();
    const l = normalized === 'en' ? 'en' : 'ru';
    return this.translationsService.getTranslations(l as 'ru' | 'en');
  }
}


