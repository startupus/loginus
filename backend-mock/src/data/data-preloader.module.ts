import { Global, Module } from '@nestjs/common';
import { DataPreloaderService } from './data-preloader.service';

@Global()
@Module({
  providers: [DataPreloaderService],
  exports: [DataPreloaderService],
})
export class DataPreloaderModule {}


