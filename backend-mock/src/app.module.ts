import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataPreloaderModule } from './data/data-preloader.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { AdminModule } from './admin/admin.module';
import { PersonalModule } from './personal/personal.module';
import { SecurityModule } from './security/security.module';
import { FamilyModule } from './family/family.module';
import { PaymentModule } from './payment/payment.module';
import { TranslationsModule } from './translations/translations.module';
import { TranslationsV2Module } from './translations-v2/translations-v2.module';
import { SupportModule } from './support/support.module';

@Module({
  imports: [DataPreloaderModule, AuthModule, ProfileModule, AdminModule, PersonalModule, SecurityModule, FamilyModule, PaymentModule, TranslationsModule, TranslationsV2Module, SupportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

