import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkService } from './work.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('work')
@Controller('work')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkController {
  constructor(private readonly workService: WorkService) {}

  @Get('groups')
  @ApiOperation({ summary: 'Получить список рабочих групп' })
  @ApiResponse({ status: 200, description: 'Список групп' })
  async getGroups(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.workService.getGroups(userId);
  }

  @Post('groups')
  @ApiOperation({ summary: 'Создать рабочую группу' })
  @ApiResponse({ status: 201, description: 'Группа создана' })
  async createGroup(
    @CurrentUser() user: any,
    @Body() dto: { name: string; description?: string }
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    return this.workService.createGroup(userId, dto);
  }

  @Post('groups/:groupId/invite')
  @ApiOperation({ summary: 'Пригласить участника в группу' })
  @ApiResponse({ status: 201, description: 'Приглашение отправлено' })
  async inviteMember(
    @Param('groupId') groupId: string,
    @Body() dto: { email: string; role?: 'admin' | 'member' }
  ) {
    return this.workService.inviteMember(groupId, dto);
  }

  @Get('groups/:groupId/events')
  @ApiOperation({ summary: 'Получить события группы' })
  @ApiResponse({ status: 200, description: 'События группы' })
  async getGroupEvents(@Param('groupId') groupId: string) {
    return this.workService.getGroupEvents(groupId);
  }

  @Get('events')
  @ApiOperation({ summary: 'Получить все события' })
  @ApiResponse({ status: 200, description: 'Все события' })
  async getEvents() {
    return this.workService.getGroupEvents();
  }
}

