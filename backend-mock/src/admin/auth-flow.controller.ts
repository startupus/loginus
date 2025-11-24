import { Controller, Get, Put, Post, Body } from '@nestjs/common';
import { AuthFlowService } from './auth-flow.service';

@Controller('admin/auth-flow')
export class AuthFlowController {
  constructor(private readonly authFlowService: AuthFlowService) {}

  @Get()
  getAuthFlow() {
    return this.authFlowService.getAuthFlow();
  }

  @Put()
  updateAuthFlow(@Body() body: { methods: any[] }) {
    return this.authFlowService.updateAuthFlow(body.methods);
  }

  @Post('test')
  testAuthFlow() {
    return this.authFlowService.testAuthFlow();
  }
}

