import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PluginsService } from './plugins.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { CreatePluginDto } from './dto/create-plugin.dto';
import { UpdatePluginDto } from './dto/update-plugin.dto';

@ApiTags('admin-plugins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/plugins')
export class AdminPluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  @Get()
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Получить список всех плагинов (админка)' })
  @ApiResponse({ status: 200, description: 'Список плагинов' })
  async findAll() {
    const plugins = await this.pluginsService.findAll();
    return {
      success: true,
      data: plugins,
    };
  }

  @Get(':idOrSlug')
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Получить плагин по id или slug' })
  @ApiResponse({ status: 200, description: 'Плагин найден' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    const plugin = await this.pluginsService.findOneByIdOrSlug(idOrSlug);
    return {
      success: true,
      data: plugin,
    };
  }

  @Post()
  @RequireRoles('super_admin')
  @ApiOperation({
    summary: 'Создать/зарегистрировать плагин',
    description:
      'Создаёт новый плагин. Может использоваться как для регистрации внешней ссылки/iframe, так и для web_app с entryUrl или hosted_bundle.',
  })
  @ApiResponse({ status: 201, description: 'Плагин создан' })
  async create(@Body() dto: CreatePluginDto) {
    const plugin = await this.pluginsService.create(dto);
    return {
      success: true,
      data: plugin,
    };
  }

  @Patch(':idOrSlug')
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Обновить плагин' })
  @ApiResponse({ status: 200, description: 'Плагин обновлён' })
  async update(
    @Param('idOrSlug') idOrSlug: string,
    @Body() dto: UpdatePluginDto,
  ) {
    const plugin = await this.pluginsService.update(idOrSlug, dto);
    return {
      success: true,
      data: plugin,
    };
  }

  @Post(':idOrSlug/enable')
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Включить плагин' })
  @ApiResponse({ status: 200, description: 'Плагин включён' })
  async enable(@Param('idOrSlug') idOrSlug: string) {
    const plugin = await this.pluginsService.enable(idOrSlug);
    return {
      success: true,
      data: plugin,
    };
  }

  @Post(':idOrSlug/disable')
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Выключить плагин' })
  @ApiResponse({ status: 200, description: 'Плагин выключен' })
  async disable(@Param('idOrSlug') idOrSlug: string) {
    const plugin = await this.pluginsService.disable(idOrSlug);
    return {
      success: true,
      data: plugin,
    };
  }

  @Delete(':idOrSlug')
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Удалить плагин' })
  @ApiResponse({ status: 200, description: 'Плагин удалён' })
  async remove(@Param('idOrSlug') idOrSlug: string) {
    await this.pluginsService.remove(idOrSlug);
    return {
      success: true,
      data: true,
    };
  }
}


