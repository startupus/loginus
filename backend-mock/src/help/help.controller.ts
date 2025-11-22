import { Controller, Get, Param } from '@nestjs/common';
import { HelpService } from './help.service';

@Controller('help')
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @Get('categories')
  getCategories() {
    return this.helpService.getCategories();
  }

  @Get('categories/:id')
  getCategoryById(@Param('id') id: string) {
    return this.helpService.getCategoryById(id);
  }
}

