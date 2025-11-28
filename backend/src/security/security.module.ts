import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    UsersModule,
    AuditModule, // Audit модуль для логирования событий
    forwardRef(() => AuthModule),
  ],
  controllers: [SecurityController],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {
  // EmailService будет доступен через AuthModule, который экспортирует его
}

