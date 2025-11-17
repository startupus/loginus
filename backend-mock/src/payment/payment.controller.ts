import { Controller, Get, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('methods')
  getMethods() {
    return this.paymentService.getMethods();
  }

  @Post('methods')
  addMethod(@Body() methodDto: any) {
    return this.paymentService.addMethod(methodDto);
  }

  @Get('history')
  getHistory() {
    return this.paymentService.getHistory();
  }
}

