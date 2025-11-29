import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TwoFactorSettingsService } from './two-factor-settings.service';
import { TwoFactorSettingsController } from './two-factor-settings.controller';
import { UserRoleManagementService } from './user-role-management.service';
import { UserRoleManagementController } from './user-role-management.controller';
import { User } from './entities/user.entity';
import { UserRoleAssignment } from './entities/user-role-assignment.entity';
import { Role } from '../rbac/entities/role.entity';
import { OrganizationRole } from '../organizations/entities/organization-role.entity';
import { TeamRole } from '../teams/entities/team-role.entity';
import { Invitation } from '../auth/micro-modules/invitations/entities/invitation.entity';
import { Team } from '../teams/entities/team.entity';
import { TeamMembership } from '../teams/entities/team-membership.entity';
import { OrganizationMembership } from '../organizations/entities/organization-membership.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { RbacModule } from '../rbac/rbac.module';
import { EventsModule } from '../core/events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      UserRoleAssignment, 
      Role, 
      OrganizationRole, 
      TeamRole, 
      Invitation, 
      Team, 
      TeamMembership, 
      OrganizationMembership, 
      Organization
    ]),
    RbacModule,
    EventsModule,
  ],
  controllers: [UsersController, TwoFactorSettingsController, UserRoleManagementController],
  providers: [UsersService, TwoFactorSettingsService, UserRoleManagementService],
  exports: [UsersService, TwoFactorSettingsService, UserRoleManagementService],
})
export class UsersModule {}
