import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UIPermissionsService } from '../settings/micro-modules/ui-permissions/ui-permissions.service';

@ApiTags('profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly uiPermissionsService: UIPermissionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Получить профиль пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль пользователя' })
  async getProfile(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.profileService.getProfile(userId);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Получить данные дашборда' })
  @ApiResponse({ status: 200, description: 'Данные дашборда' })
  async getDashboard(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.profileService.getDashboard(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Обновить профиль' })
  @ApiResponse({ status: 200, description: 'Профиль обновлен' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateDto: Partial<{
      firstName: string;
      lastName: string;
      displayName: string;
      birthday: string;
    }>
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.profileService.updateProfile(userId, updateDto);
  }

  @Get('menu')
  @ApiOperation({ summary: 'Получить меню для текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Сайдбар меню пользователя' })
  async getUserMenu(@CurrentUser() user: any) {
    try {
      const userId = user?.userId || user?.id || user?.sub;
      if (!userId) {
        console.error('[ProfileController] User ID not found');
        return {
          success: false,
          error: 'User ID not found',
          data: [],
        };
      }
      
      const MENU_ID = 'sidebar-main';
      const menu = await this.uiPermissionsService.getNavigationMenuForUser(
        userId,
        MENU_ID,
      );

      // Фронтенд ожидает массив пунктов меню
      return {
        success: true,
        data: menu?.items || [],
      };
    } catch (error) {
      console.error('[ProfileController] Error getting user menu:', error);
      console.error('[ProfileController] Error stack:', error instanceof Error ? error.stack : 'No stack');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
      };
    }
  }
}

