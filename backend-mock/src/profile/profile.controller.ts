import { Controller, Get, Put, Body } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

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
}

