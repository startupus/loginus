import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DataPreloaderModule } from '../data/data-preloader.module';

@Module({
  imports: [DataPreloaderModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

