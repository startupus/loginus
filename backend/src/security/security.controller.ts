import { Controller, Get, Delete, Post, Body, Param, UseGuards, Patch, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { SecurityService } from './security.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('security')
@Controller('security')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('devices')
  @ApiOperation({ summary: 'Получить список устройств' })
  @ApiResponse({ status: 200, description: 'Список устройств' })
  async getDevices(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.securityService.getDevices(userId);
  }

  @Delete('devices/:deviceId')
  @ApiOperation({ summary: 'Удалить устройство' })
  @ApiResponse({ status: 200, description: 'Устройство удалено' })
  async deleteDevice(@CurrentUser() user: any, @Param('deviceId') deviceId: string) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.securityService.deleteDevice(userId, deviceId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Получить историю активности' })
  @ApiResponse({ status: 200, description: 'История активности' })
  async getActivity(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.securityService.getActivity(userId);
  }

  @Post('password/change')
  @ApiOperation({ summary: 'Изменить пароль' })
  @ApiResponse({ status: 200, description: 'Пароль изменен' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() dto: { oldPassword: string; newPassword: string }
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    const result = await this.securityService.changePassword(userId, dto.oldPassword, dto.newPassword);
    return { success: true, ...result };
  }

  @Patch('auth-method')
  @ApiOperation({ summary: 'Обновить основной способ входа' })
  @ApiResponse({ status: 200, description: 'Способ входа обновлен' })
  async updateAuthMethod(
    @CurrentUser() user: any,
    @Body() dto: { primaryAuthMethod: string; emailAuthType?: 'password' | 'code'; hasEmailCode?: boolean },
    @Req() req: Request
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.securityService.updateAuthMethod(userId, dto.primaryAuthMethod, dto.emailAuthType, dto.hasEmailCode, req);
  }

  @Get('auth-method')
  @ApiOperation({ summary: 'Получить основной способ входа' })
  @ApiResponse({ status: 200, description: 'Способ входа' })
  async getAuthMethod(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.securityService.getAuthMethod(userId);
  }

  @Get('recovery-methods')
  @ApiOperation({ summary: 'Получить доступные способы восстановления' })
  @ApiResponse({ status: 200, description: 'Список способов восстановления' })
  async getRecoveryMethods(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.securityService.getAvailableRecoveryMethods(userId);
  }

  @Post('recovery-method/setup')
  @ApiOperation({ summary: 'Настроить способ восстановления' })
  @ApiResponse({ status: 200, description: 'Способ восстановления настроен' })
  async setupRecoveryMethod(
    @CurrentUser() user: any,
    @Body() dto: { method: 'email' | 'phone' }
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.securityService.setupRecoveryMethod(userId, dto.method);
  }

  @Post('logout-all')
  @ApiOperation({ summary: 'Выйти со всех устройств' })
  @ApiResponse({ status: 200, description: 'Выход выполнен со всех устройств' })
  @ApiResponse({ status: 400, description: 'Ошибка выполнения' })
  async logoutFromAllDevices(
    @CurrentUser() user: any,
    @Body() body: { keepCurrentSession?: boolean },
    @Req() req: Request
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    const currentTokenId = body.keepCurrentSession ? user?.tokenId : undefined;
    return this.securityService.logoutFromAllDevices(userId, currentTokenId, req);
  }
}

