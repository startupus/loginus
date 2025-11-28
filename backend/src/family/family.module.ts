import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';
import { UsersModule } from '../users/users.module';
import { TeamsModule } from '../teams/teams.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { InvitationsModule } from '../auth/micro-modules/invitations/invitations.module';
import { AuthModule } from '../auth/auth.module';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { FamilyGroup } from './entities/family-group.entity';
import { UserFamilyGroup } from './entities/user-family-group.entity';

@Module({
  imports: [
    UsersModule,
    TeamsModule,
    OrganizationsModule,
    InvitationsModule,
    AuthModule,
    TypeOrmModule.forFeature([RefreshToken, FamilyGroup, UserFamilyGroup]),
  ],
  controllers: [FamilyController],
  providers: [FamilyService],
  exports: [FamilyService],
})
export class FamilyModule {}

