import { Controller, Get, Delete, Post, Param, Body } from '@nestjs/common';
import { SecurityService } from './security.service';

@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('devices')
  getDevices() {
    return this.securityService.getDevices();
  }

  @Delete('devices/:id')
  deleteDevice(@Param('id') id: string) {
    return this.securityService.deleteDevice(id);
  }

  @Get('activity')
  getActivity() {
    return this.securityService.getActivity();
  }

  @Post('password/change')
  changePassword(@Body() passwordDto: { oldPassword: string; newPassword: string }) {
    return this.securityService.changePassword(passwordDto);
  }
}

