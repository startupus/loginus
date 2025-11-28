import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PluginsService } from './plugins.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LaunchPluginDto } from './dto/launch-plugin.dto';

@ApiTags('plugins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plugins')
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  @Get('available')
  @ApiOperation({ summary: 'Получить список плагинов, доступных текущему пользователю' })
  @ApiResponse({ status: 200, description: 'Список доступных плагинов' })
  async getAvailable(@CurrentUser() user: any) {
    const plugins = await this.pluginsService.getAvailableForUser(user.userId);
    return {
      success: true,
      data: plugins,
    };
  }

  @Post(':slug/launch')
  @ApiOperation({ summary: 'Запустить embedded web_app-плагин и получить initData + launchUrl' })
  @ApiResponse({ status: 200, description: 'Данные для запуска плагина' })
  async launch(
    @Param('slug') slug: string,
    @Body() body: LaunchPluginDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.pluginsService.launchWebAppPlugin(
      slug,
      user.userId,
      body,
    );

    return {
      success: true,
      data: result,
    };
  }
}


