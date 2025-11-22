import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';
import { MenuSettingsController } from './menu-settings.controller';
import { MenuSettingsService } from './menu-settings.service';
import { DataPreloaderModule } from '../data/data-preloader.module';

@Module({
  imports: [DataPreloaderModule],
  controllers: [AdminController, BackupController, MenuSettingsController],
  providers: [AdminService, BackupService, MenuSettingsService],
  exports: [MenuSettingsService],
})
export class AdminModule {}

