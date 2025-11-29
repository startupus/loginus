import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { EventBusService } from './events/event-bus.service';
import { EventLoggerService } from './events/event-logger.service';
import { PluginRegistryService } from './extensions/plugin-registry.service';
import { PluginLoaderService } from './extensions/plugin-loader.service';
import { ExtensionUploadService } from './extensions/extension-upload.service';
import { ExtensionsController } from './extensions/extensions.controller';
import { EventLog } from './events/entities/event-log.entity';
import { Extension } from './extensions/entities/extension.entity';
import { MenuItemPlugin } from './extensions/entities/menu-item-plugin.entity';
import { ProfileWidget } from './extensions/entities/profile-widget.entity';

/**
 * Core Module
 * Provides event system and plugin infrastructure
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventLog,
      Extension,
      MenuItemPlugin,
      ProfileWidget,
    ]),
    MulterModule.register({
      dest: './uploads/plugins',
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  ],
  controllers: [ExtensionsController],
  providers: [
    EventBusService,
    EventLoggerService,
    PluginRegistryService,
    PluginLoaderService,
    ExtensionUploadService,
  ],
  exports: [
    EventBusService,
    EventLoggerService,
    PluginRegistryService,
    PluginLoaderService,
    ExtensionUploadService,
    TypeOrmModule,
  ],
})
export class CoreModule {}

