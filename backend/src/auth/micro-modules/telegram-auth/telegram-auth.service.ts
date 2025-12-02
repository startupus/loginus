import { Injectable } from '@nestjs/common';
import { MicroModuleSettingsService } from '../../../common/services/micro-module-settings.service';

@Injectable()
export class TelegramAuthMicroModuleService {
  constructor(
    private readonly microModuleSettingsService: MicroModuleSettingsService,
  ) {}

  /**
   * Проверка, включен ли модуль Telegram авторизации
   */
  async isEnabled(): Promise<boolean> {
    return this.microModuleSettingsService.getModuleStatus('telegram-auth');
  }

  /**
   * Получение конфигурации модуля
   */
  async getConfig(): Promise<Record<string, any>> {
    const config = await this.microModuleSettingsService.getModuleConfig('telegram-auth');
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    let botUsername = process.env.TELEGRAM_BOT_USERNAME;
    
    // Если bot username не задан, получаем его из Telegram Bot API
    if (!botUsername && botToken) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.result?.username) {
            botUsername = data.result.username;
            console.log(`[TelegramAuth] Bot username retrieved from Telegram API: ${botUsername}`);
          }
        }
      } catch (error) {
        console.warn('[TelegramAuth] Failed to get bot username from Telegram API:', error);
      }
    }
    
    return {
      enabled: await this.isEnabled(),
      botUsername,
      ...config,
      // Не возвращаем botToken в конфиге по соображениям безопасности
    };
  }

  /**
   * Включение/выключение модуля
   */
  async toggle(enabled: boolean): Promise<void> {
    await this.microModuleSettingsService.toggleModule('telegram-auth', enabled);
    console.log(`Telegram Auth Module ${enabled ? 'enabled' : 'disabled'}`);
  }
}