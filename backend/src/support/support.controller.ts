import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('support')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('chats')
  @ApiOperation({ summary: 'Получить историю чатов' })
  @ApiResponse({ status: 200, description: 'История чатов' })
  getChatHistory() {
    return this.supportService.getChatHistory();
  }

  @Get('chats/:chatId/messages')
  @ApiOperation({ summary: 'Получить сообщения чата' })
  @ApiResponse({ status: 200, description: 'Сообщения чата' })
  getChatMessages(@Param('chatId') chatId: string) {
    return this.supportService.getChatMessages(chatId);
  }

  @Post('chats/:chatId/messages')
  @ApiOperation({ summary: 'Отправить сообщение' })
  @ApiResponse({ status: 201, description: 'Сообщение отправлено' })
  sendMessage(@Param('chatId') chatId: string, @Body() body: { message: string }) {
    return this.supportService.sendMessage(chatId, body.message);
  }

  @Get('services')
  @ApiOperation({ summary: 'Получить список сервисов' })
  @ApiResponse({ status: 200, description: 'Список сервисов' })
  getServices() {
    return this.supportService.getServices();
  }

  @Post('chats')
  @ApiOperation({ summary: 'Создать новый чат' })
  @ApiResponse({ status: 201, description: 'Чат создан' })
  createChat(@Body() body: { serviceId: string }) {
    return this.supportService.createChat(body.serviceId);
  }

  @Patch('chats/:chatId/messages/:messageId')
  @ApiOperation({ summary: 'Редактировать сообщение' })
  @ApiResponse({ status: 200, description: 'Сообщение отредактировано' })
  editMessage(
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @Body() body: { message: string }
  ) {
    return this.supportService.editMessage(chatId, messageId, body.message);
  }
}

