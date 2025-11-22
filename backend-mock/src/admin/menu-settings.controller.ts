import { Controller, Get, Put, Body } from '@nestjs/common';
import { MenuSettingsService, MenuSettings } from './menu-settings.service';

@Controller('admin/menu-settings')
export class MenuSettingsController {
  constructor(private readonly menuSettingsService: MenuSettingsService) {}

  @Get()
  getMenuSettings() {
    return {
      success: true,
      data: this.menuSettingsService.getMenuSettings(),
    };
  }

  @Put()
  updateMenuSettings(@Body() settings: MenuSettings) {
    return {
      success: true,
      data: this.menuSettingsService.updateMenuSettings(settings),
    };
  }
}

