import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UsersModule } from '../users/users.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { PersonalModule } from '../personal/personal.module';
import { FamilyModule } from '../family/family.module';
import { UIPermissionsModule } from '../settings/micro-modules/ui-permissions/ui-permissions.module';

@Module({
  imports: [UsersModule, DashboardModule, PersonalModule, FamilyModule, UIPermissionsModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}

