import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payment')
@Controller('payment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('methods')
  @ApiOperation({ summary: 'Получить способы оплаты' })
  @ApiResponse({ status: 200, description: 'Список способов оплаты' })
  async getMethods() {
    return this.paymentService.getMethods();
  }

  @Post('methods')
  @ApiOperation({ summary: 'Добавить способ оплаты' })
  @ApiResponse({ status: 201, description: 'Способ оплаты добавлен' })
  async addMethod(@Body() methodDto: any) {
    return this.paymentService.addMethod(methodDto);
  }

  @Patch('methods/:id/toggle')
  @ApiOperation({ summary: 'Переключить статус способа оплаты' })
  @ApiResponse({ status: 200, description: 'Статус способа оплаты обновлен' })
  async toggleMethod(@Param('id') id: string) {
    return this.paymentService.toggleMethod(id);
  }

  @Patch('methods/reorder')
  @ApiOperation({ summary: 'Изменить порядок способов оплаты' })
  @ApiResponse({ status: 200, description: 'Порядок способов оплаты обновлен' })
  async reorder(@Body() body: { ids: string[] }) {
    return this.paymentService.reorder(body?.ids || []);
  }

  @Get('history')
  @ApiOperation({ summary: 'Получить историю платежей' })
  @ApiResponse({ status: 200, description: 'История платежей' })
  async getHistory() {
    return this.paymentService.getHistory();
  }
}

