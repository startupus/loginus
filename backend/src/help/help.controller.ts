import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HelpService } from './help.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('help')
@Controller('help')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Получить все категории справки' })
  @ApiResponse({ status: 200, description: 'Список категорий' })
  getCategories() {
    return this.helpService.getCategories();
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Получить категорию по ID' })
  @ApiResponse({ status: 200, description: 'Категория' })
  getCategoryById(@Param('id') id: string) {
    return this.helpService.getCategoryById(id);
  }
}

