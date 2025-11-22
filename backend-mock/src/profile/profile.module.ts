import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { MenuSettingsService } from '../admin/menu-settings.service';
import { DataPreloaderModule } from '../data/data-preloader.module';

@Module({
  imports: [DataPreloaderModule],
  controllers: [ProfileController],
  providers: [ProfileService, MenuSettingsService],
})
export class ProfileModule {}

