import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RbacModule } from './rbac/rbac.module';
import { SettingsModule } from './settings/settings.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { TeamsModule } from './teams/teams.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { InvitationsModule } from './auth/micro-modules/invitations/invitations.module';
import { InvitationsController } from './auth/micro-modules/invitations/invitations.controller';
import { ReferralModule } from './auth/micro-modules/referral-system/referral.module';
import { ReferralController } from './auth/micro-modules/referral-system/referral.controller';
import { TestInvitationsController } from './test-invitations.controller';
import { EmailService } from './auth/email.service';
import { Invitation } from './auth/micro-modules/invitations/entities/invitation.entity';
import { User } from './users/entities/user.entity';
import { OrganizationMembership } from './organizations/entities/organization-membership.entity';
import { TeamMembership } from './teams/entities/team-membership.entity';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { AuditInterceptor } from './audit/audit.interceptor';
import { ResponseTransformInterceptor } from './common/response-transform.interceptor';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';

// Общие сервисы
import { CommonModule } from './common/common.module';
import { MicroModulesModule } from './common/micro-modules.module';

// Новые модули для фронтенда
import { ProfileModule } from './profile/profile.module';
import { PersonalModule } from './personal/personal.module';
import { SecurityModule } from './security/security.module';
import { FamilyModule } from './family/family.module';
import { PaymentModule } from './payment/payment.module';
import { SupportModule } from './support/support.module';
import { WorkModule } from './work/work.module';
import { HelpModule } from './help/help.module';
import { TranslationsModule } from './translations/translations.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminModule } from './admin/admin.module';
import { PluginsModule } from './plugins/plugins.module';
import { GatewayModule } from './gateway/gateway.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    // Core infrastructure (event system, plugins)
    CoreModule,

    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('database')!,
      inject: [ConfigService],
    }),

    // Additional entities
    TypeOrmModule.forFeature([
      Invitation, 
      User,
      OrganizationMembership,
      TeamMembership
    ]),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Feature modules
        AuthModule,
        UsersModule,
        RbacModule,
        SettingsModule,
        OrganizationsModule,
        TeamsModule,
        AuditModule,
        NotificationsModule,
        InvitationsModule,
        ReferralModule,
        
        // Общие модули
        CommonModule,
        MicroModulesModule,
        // FinalMicroModulesModule импортируется в AuthModule (глобальный модуль)
        
        // Новые модули для фронтенда
        ProfileModule,
        PersonalModule,
        SecurityModule,
        FamilyModule,
        DashboardModule,
        PaymentModule,
        SupportModule,
        WorkModule,
        HelpModule,
        TranslationsModule,
        AdminModule,
        PluginsModule,
        // GatewayModule должен быть последним, чтобы его catch-all роут
        // срабатывал только как fallback после всех основных контроллеров
        GatewayModule,
  ],
  controllers: [AppController, InvitationsController, TestInvitationsController, ReferralController],
  providers: [
    AppService,
    EmailService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // PermissionsGuard отключен - роли только для отображения в командах/организациях
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionsGuard,
    // },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: AuditInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseTransformInterceptor,
    },
  ],
})
export class AppModule {}