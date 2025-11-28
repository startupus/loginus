import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PluginManagerService } from './plugin-manager.service';
import { SYSTEM_MENU_PLUGINS } from './menu-plugins/system-menu-plugins';
import { Plugin } from './entities/plugin.entity';
import { PluginVersion } from './entities/plugin-version.entity';
import { PluginsService } from './plugins.service';
import { PluginsController } from './plugins.controller';
import { AdminPluginsController } from './admin-plugins.controller';
import { User } from '../users/entities/user.entity';
import { MicroModulesModule } from '../common/micro-modules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plugin, PluginVersion, User]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'default-secret',
      }),
      inject: [ConfigService],
    }),
    MicroModulesModule,
  ],
  controllers: [PluginsController, AdminPluginsController],
  providers: [PluginManagerService, PluginsService],
  exports: [PluginManagerService, PluginsService],
})
export class PluginsModule implements OnModuleInit {
  private readonly logger = new Logger(PluginsModule.name);

  constructor(private readonly pluginManager: PluginManagerService) {}

  async onModuleInit() {
    this.logger.log('🔌 [PluginsModule] onModuleInit вызван');
    try {
      this.logger.log(
        `🔌 [PluginsModule] Регистрация ${SYSTEM_MENU_PLUGINS.length} системных плагинов меню...`,
      );
      // Регистрируем все системные плагины при инициализации модуля
      let registeredCount = 0;
      for (const pluginMetadata of SYSTEM_MENU_PLUGINS) {
        try {
          this.pluginManager.registerPluginFromMetadata(pluginMetadata);
          registeredCount++;
          this.logger.debug(
            `✅ [PluginsModule] Плагин "${pluginMetadata.id}" успешно зарегистрирован.`,
          );
        } catch (error) {
          this.logger.error(
            `❌ [PluginsModule] Ошибка при регистрации плагина "${pluginMetadata.id}":`,
            error,
          );
          // Продолжаем регистрацию других плагинов даже при ошибке
        }
      }
      this.logger.log(
        `✅ [PluginsModule] Зарегистрировано ${registeredCount}/${SYSTEM_MENU_PLUGINS.length} системных плагинов меню.`,
      );
      // Устанавливаем флаг инициализации после регистрации всех плагинов
      this.pluginManager.setInitialized();
      this.logger.log(
        '✅ [PluginsModule] PluginManagerService помечен как инициализированный',
      );
    } catch (error) {
      this.logger.error(
        '❌ [PluginsModule] Критическая ошибка при инициализации модуля плагинов:',
        error,
      );
      this.logger.error('❌ [PluginsModule] Stack trace:', error?.stack);
      // Не бросаем ошибку, чтобы не блокировать запуск приложения
    }
  }
}

