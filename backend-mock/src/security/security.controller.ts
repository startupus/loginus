import { Controller, Get, Delete, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SecurityService } from './security.service';

/**
 * SecurityController - контроллер для управления безопасностью
 * Оптимизирован для мгновенного ответа
 */
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('devices')
  @HttpCode(HttpStatus.OK)
  getDevices() {
    // Оптимизация: мгновенный ответ, данные в памяти
    return this.securityService.getDevices();
  }

  @Delete('devices/:id')
  @HttpCode(HttpStatus.OK)
  deleteDevice(@Param('id') id: string) {
    return this.securityService.deleteDevice(id);
  }

  @Get('activity')
  @HttpCode(HttpStatus.OK)
  getActivity() {
    return this.securityService.getActivity();
  }

  @Post('password/change')
  @HttpCode(HttpStatus.OK)
  changePassword(@Body() passwordDto: { oldPassword: string; newPassword: string }) {
    return this.securityService.changePassword(passwordDto);
  }
}

