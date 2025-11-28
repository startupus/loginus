import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UIPermissionsService } from '../settings/micro-modules/ui-permissions/ui-permissions.service';
import { SettingsService } from '../settings/settings.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly uiPermissionsService: UIPermissionsService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get('stats')
  @RequireRoles('super_admin', 'company_admin')
  @ApiOperation({ summary: 'Получить статистику админки' })
  @ApiResponse({ status: 200, description: 'Статистика админки' })
  async getStats(@CurrentUser() user: any) {
    const userRole = user?.role || user?.roles?.[0];
    const companyId = user?.companyId;
    const stats = await this.adminService.getStats(userRole, companyId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('users')
  @RequireRoles('super_admin', 'company_admin')
  @ApiOperation({ summary: 'Получить список пользователей' })
  @ApiResponse({ status: 200, description: 'Список пользователей' })
  async getUsers(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('companyId') companyId?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const userRole = user?.role || user?.roles?.[0];
    const userCompanyId = user?.companyId;
    const result = await this.adminService.getUsers({
      page: page || 1,
      limit: limit || 20,
      companyId: companyId || userCompanyId,
      role,
      status,
      search,
      userRole,
    });

    return {
      success: true,
      data: result,
    };
  }

  @Get('users/:id')
  @RequireRoles('super_admin', 'company_admin')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiResponse({ status: 200, description: 'Пользователь' })
  async getUserById(@Param('id') id: string, @CurrentUser() user: any) {
    const userRole = user?.role || user?.roles?.[0];
    const companyId = user?.companyId;
    const result = await this.adminService.getUserById(id, userRole, companyId);
    return {
      success: true,
      data: result,
    };
  }

  @Post('users')
  @RequireRoles('super_admin', 'company_admin')
  @ApiOperation({ summary: 'Создать пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь создан' })
  async createUser(@Body() userData: any, @CurrentUser() user: any) {
    const userRole = user?.role || user?.roles?.[0];
    const companyId = user?.companyId;
    const created = await this.adminService.createUser(userData, userRole, companyId);
    return {
      success: true,
      data: created,
    };
  }

  @Put('users/:id')
  @RequireRoles('super_admin', 'company_admin')
  @ApiOperation({ summary: 'Обновить пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь обновлен' })
  async updateUser(@Param('id') id: string, @Body() userData: any, @CurrentUser() user: any) {
    const userRole = user?.role || user?.roles?.[0];
    const companyId = user?.companyId;
    const updated = await this.adminService.updateUser(id, userData, userRole, companyId);
    return {
      success: true,
      data: updated,
    };
  }

  @Delete('users/:id')
  @RequireRoles('super_admin', 'company_admin')
  @ApiOperation({ summary: 'Удалить/деактивировать пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь удален' })
  async deleteUser(@Param('id') id: string, @CurrentUser() user: any) {
    const userRole = user?.role || user?.roles?.[0];
    const companyId = user?.companyId;
    const result = await this.adminService.deleteUser(id, userRole, companyId);
    return {
      success: true,
      data: result,
    };
  }

  @Get('companies')
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Получить список компаний' })
  @ApiResponse({ status: 200, description: 'Список компаний' })
  async getCompanies(@Query('page') page?: number, @Query('limit') limit?: number) {
    const companies = await this.adminService.getCompanies({
      page: page || 1,
      limit: limit || 20,
    });
    return {
      success: true,
      data: companies,
    };
  }

  @Get('companies/:id')
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Получить компанию по ID' })
  @ApiResponse({ status: 200, description: 'Компания' })
  async getCompanyById(@Param('id') id: string) {
    const company = await this.adminService.getCompanyById(id);
    return {
      success: true,
      data: company,
    };
  }

  @Get('companies/:id/users')
  @RequireRoles('super_admin', 'company_admin')
  @ApiOperation({ summary: 'Получить пользователей компании' })
  @ApiResponse({ status: 200, description: 'Пользователи компании' })
  async getUsersByCompany(@Param('id') id: string, @CurrentUser() user: any) {
    const userRole = user?.role || user?.roles?.[0];
    const companyId = user?.companyId;
    const result = await this.adminService.getUsersByCompany(id, userRole, companyId);
    return {
      success: true,
      data: result,
    };
  }

  @Post('companies')
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Создать компанию' })
  @ApiResponse({ status: 201, description: 'Компания создана' })
  async createCompany(@Body() companyData: any) {
    const company = await this.adminService.createCompany(companyData);
    return {
      success: true,
      data: company,
    };
  }

  @Put('companies/:id')
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Обновить компанию' })
  @ApiResponse({ status: 200, description: 'Компания обновлена' })
  async updateCompany(@Param('id') id: string, @Body() companyData: any) {
    const company = await this.adminService.updateCompany(id, companyData);
    return {
      success: true,
      data: company,
    };
  }

  // ===== Menu settings (Sidebar) =====

  @Get('menu-settings')
  @Public()
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Получить настройки меню (основной Sidebar)' })
  @ApiResponse({ status: 200, description: 'Настройки меню' })
  async getMenuSettings() {
    const MENU_ID = 'sidebar-main';
    const menu = await this.uiPermissionsService.getNavigationMenuConfig(MENU_ID);

    return {
      success: true,
      data: {
        items: menu?.items || [],
      },
    };
  }

  @Put('menu-settings')
  @Public()
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Обновить настройки меню (основной Sidebar)' })
  @ApiResponse({ status: 200, description: 'Настройки меню обновлены' })
  async updateMenuSettings(
    @CurrentUser() user: any,
    @Body() body: { items: any[] },
  ) {
    const MENU_ID = 'sidebar-main';
    const updated = await this.uiPermissionsService.updateNavigationMenuConfig(
      MENU_ID,
      body.items || [],
      user.userId,
    );

    return {
      success: true,
      data: {
        items: updated.items || [],
      },
    };
  }

  // ===== Auth flow (login/registration/factors) =====

  @Get('auth-flow')
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Получить алгоритм авторизации (login/registration/factors)' })
  @ApiResponse({ status: 200, description: 'Текущая конфигурация алгоритма авторизации' })
  async getAuthFlow() {
    const raw = await this.settingsService.getSetting('auth_flow_config');

    if (!raw) {
      return {
        success: true,
        data: {
          login: [],
          registration: [],
          factors: [],
          updatedAt: null,
        },
      };
    }

    try {
      const parsed = JSON.parse(raw);
      return {
        success: true,
        data: parsed,
      };
    } catch {
      return {
        success: true,
        data: {
          login: [],
          registration: [],
          factors: [],
          updatedAt: null,
        },
      };
    }
  }

  @Put('auth-flow')
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Обновить алгоритм авторизации (login/registration/factors)' })
  @ApiResponse({ status: 200, description: 'Алгоритм авторизации обновлён' })
  async updateAuthFlow(
    @CurrentUser() user: any,
    @Body() body: { methods: any[] },
  ) {
    const methods = body?.methods || [];

    const login = methods
      .filter((m) => m.flow === 'login')
      .map((m, index) => ({ ...m, order: m.order ?? index + 1 }));

    const registration = methods
      .filter((m) => m.flow === 'registration')
      .map((m, index) => ({ ...m, order: m.order ?? index + 1 }));

    const factors = methods
      .filter((m) => m.flow === 'factors')
      .map((m, index) => ({ ...m, order: m.order ?? index + 1 }));

    const payload = {
      login,
      registration,
      factors,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.userId || null,
    };

    await this.settingsService.setSetting(
      'auth_flow_config',
      JSON.stringify(payload),
      'Алгоритм авторизации (login/registration/factors)',
    );

    return {
      success: true,
      data: payload,
    };
  }

  @Post('auth-flow/test')
  @RequireRoles('super_admin')
  @ApiOperation({ summary: 'Протестировать текущий алгоритм авторизации' })
  @ApiResponse({ status: 200, description: 'Результат теста алгоритма авторизации' })
  async testAuthFlow() {
    const raw = await this.settingsService.getSetting('auth_flow_config');
    const hasConfig = !!raw;

    return {
      success: true,
      data: {
        result: hasConfig
          ? 'Алгоритм авторизации настроен и сохранён.'
          : 'Алгоритм авторизации ещё не настроен. Используются настройки по умолчанию.',
      },
    };
  }
}

