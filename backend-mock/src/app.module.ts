import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { AdminModule } from './admin/admin.module';
import { PersonalModule } from './personal/personal.module';
import { SecurityModule } from './security/security.module';
import { FamilyModule } from './family/family.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [AuthModule, ProfileModule, AdminModule, PersonalModule, SecurityModule, FamilyModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

