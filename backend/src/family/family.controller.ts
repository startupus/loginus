import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('family')
@Controller('family')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Get('members')
  @ApiOperation({ summary: 'Получить членов семьи' })
  @ApiResponse({ status: 200, description: 'Список членов семьи' })
  async getMembers(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.familyService.getMembers(userId);
  }

  @Post('invite')
  @ApiOperation({ summary: 'Пригласить члена семьи' })
  @ApiResponse({ status: 201, description: 'Приглашение отправлено' })
  async inviteMember(
    @CurrentUser() user: any,
    @Body() dto: { role: 'member' | 'child' }
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    console.log('[FamilyController] inviteMember called with:', { userId, dto });
    const result = await this.familyService.inviteMember(userId, dto);
    console.log('[FamilyController] inviteMember result:', { 
      token: result.token ? result.token.substring(0, 20) + '...' : 'null',
      invitationLink: result.invitationLink 
    });
    return result;
  }

  @Post('child-account')
  @ApiOperation({ summary: 'Создать детский аккаунт' })
  @ApiResponse({ status: 201, description: 'Детский аккаунт создан' })
  async createChildAccount(
    @CurrentUser() user: any,
    @Body() dto: { name: string; birthDate: string }
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.familyService.createChildAccount(userId, dto);
  }

  @Post('login-as')
  @ApiOperation({ summary: 'Войти под аккаунтом ребенка' })
  @ApiResponse({ status: 200, description: 'Успешный вход под аккаунтом ребенка' })
  async loginAs(
    @CurrentUser() user: any,
    @Body() dto: { memberId: string }
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.familyService.loginAs(userId, dto.memberId);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Удалить семейную группу' })
  @ApiResponse({ status: 200, description: 'Семейная группа удалена' })
  async deleteFamilyGroup(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.familyService.deleteFamilyGroup(userId);
  }

  @Post('update-member-avatar')
  @ApiOperation({ summary: 'Обновить аватар участника семейной группы' })
  @ApiResponse({ status: 200, description: 'Аватар обновлен' })
  async updateMemberAvatar(
    @CurrentUser() user: any,
    @Body() dto: { memberId: string; avatarUrl: string }
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.familyService.updateMemberAvatar(userId, dto.memberId, dto.avatarUrl);
  }
}

