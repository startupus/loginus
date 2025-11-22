import { Controller, Get, Put, Body } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { MenuSettingsService } from '../admin/menu-settings.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly menuSettingsService: MenuSettingsService,
  ) {}

  @Get()
  getProfile() {
    return this.profileService.getProfile();
  }

  @Put()
  updateProfile(@Body() updateDto: any) {
    return this.profileService.updateProfile(updateDto);
  }

  @Get('security')
  getSecuritySettings() {
    return this.profileService.getSecuritySettings();
  }

  @Get('sessions')
  getSessions() {
    return this.profileService.getSessions();
  }

  @Get('dashboard')
  getDashboard() {
    return this.profileService.getDashboard();
  }

  @Get('menu')
  getMenu() {
    return {
      success: true,
      data: this.menuSettingsService.getUserMenu(),
    };
  }
}

