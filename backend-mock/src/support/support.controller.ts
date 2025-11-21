import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('chats')
  getChatHistory() {
    return this.supportService.getChatHistory();
  }

  @Get('chats/:chatId/messages')
  getChatMessages(@Param('chatId') chatId: string) {
    return this.supportService.getChatMessages(chatId);
  }

  @Post('chats/:chatId/messages')
  sendMessage(@Param('chatId') chatId: string, @Body() body: { message: string }) {
    return this.supportService.sendMessage(chatId, body.message);
  }

  @Get('services')
  getServices() {
    return this.supportService.getServices();
  }

  @Post('chats')
  createChat(@Body() body: { serviceId: string }) {
    return this.supportService.createChat(body.serviceId);
  }
}

