import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { SystemSetting } from './entities/system-setting.entity';
import { EventsModule } from '../core/events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemSetting]),
    EventsModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}