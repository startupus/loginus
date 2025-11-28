import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthFlowService } from '../admin/auth-flow.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authFlowService: AuthFlowService,
  ) {
    console.log('[AuthController] Constructor called');
    console.log('[AuthController] authService:', this.authService ? 'exists' : 'undefined');
    console.log('[AuthController] authFlowService:', this.authFlowService ? 'exists' : 'undefined');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: { login: string; password: string }) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: { phone: string; email?: string; password: string }) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() refreshDto: { refreshToken: string }) {
    return this.authService.refresh(refreshDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return this.authService.logout();
  }

  @Post('check')
  @HttpCode(HttpStatus.OK)
  checkAccount(@Body() checkDto: { contact: string; type: 'phone' | 'email' }) {
    return this.authService.checkAccount(checkDto.contact, checkDto.type);
  }

  @Post('check-and-send-code')
  @HttpCode(HttpStatus.OK)
  checkAndSendCode(@Body() dto: { contact: string; type: 'phone' | 'email'; method?: 'sms' | 'call' | 'telegram' }) {
    return this.authService.checkAndSendCode(dto.contact, dto.type, dto.method);
  }

  @Post('send-code')
  @HttpCode(HttpStatus.OK)
  sendCode(@Body() sendCodeDto: { contact: string; type: 'phone' | 'email'; method: 'sms' | 'call' | 'telegram'; sessionId?: string }) {
    return this.authService.sendCode(sendCodeDto.contact, sendCodeDto.type, sendCodeDto.method);
  }

  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  verifyCode(@Body() verifyCodeDto: { sessionId: string; code: string }) {
    return this.authService.verifyCode(verifyCodeDto.sessionId, verifyCodeDto.code);
  }

  @Post('webauthn/challenge')
  @HttpCode(HttpStatus.OK)
  webauthnChallenge(@Body() challengeDto?: { userId?: string }) {
    return this.authService.webauthnChallenge(challengeDto?.userId);
  }

  @Post('webauthn/verify')
  @HttpCode(HttpStatus.OK)
  webauthnVerify(@Body() verifyDto: { credential: any; challenge: string }) {
    return this.authService.webauthnVerify(verifyDto.credential, verifyDto.challenge);
  }

  @Get('flow')
  getPublicAuthFlow() {
    try {
      console.log('[AuthController] getPublicAuthFlow called');
      console.log('[AuthController] authFlowService:', this.authFlowService ? 'exists' : 'undefined');
      if (!this.authFlowService) {
        console.error('❌ [AuthController] authFlowService is undefined!');
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
      const result = this.authFlowService.getAuthFlow();
      console.log('[AuthController] getAuthFlow result:', JSON.stringify(result).substring(0, 200));
      return result;
    } catch (error: any) {
      console.error('❌ [AuthController] Error in getPublicAuthFlow:', error);
      console.error('❌ [AuthController] Error stack:', error?.stack);
      // Возвращаем дефолтную конфигурацию вместо ошибки
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
}

