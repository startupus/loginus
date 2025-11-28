import { Controller, Post, Get, Body, UseGuards, UnauthorizedException, Req, Res, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SmartAuthDto, SmartAuthResponseDto } from './dto/smart-auth.dto';
import { BindPhoneDto, VerifyPhoneDto, BindPhoneResponseDto } from './dto/bind-phone.dto';
import { SendEmailVerificationDto, VerifyEmailDto, EmailVerificationResponseDto } from './dto/email-verification.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { RequirePermissions } from './decorators/permissions.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { UsersService } from '../users/users.service';
import { EmailCodeService } from './micro-modules/email-code/email-code.service';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';
import { UserAdapter } from '../common/adapters/user.adapter';
import { TwoFactorCode, TwoFactorType, TwoFactorStatus } from './entities/two-factor-code.entity';
import { AuditService } from '../audit/audit.service';
import { SettingsService } from '../settings/settings.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private emailCodeService: EmailCodeService,
    private smsService: SmsService,
    private emailService: EmailService,
    private auditService: AuditService,
    private readonly settingsService: SettingsService,
    @InjectRepository(TwoFactorCode)
    private twoFactorCodesRepo: Repository<TwoFactorCode>,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Регистрация нового пользователя (первый пользователь становится админом)' })
  @ApiResponse({ status: 201, description: 'Пользователь создан' })
  @ApiResponse({ status: 409, description: 'Email уже существует' })
  async register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userAgent = req.get('User-Agent') || undefined;
    const ipAddress = req.ip || req.socket?.remoteAddress || undefined;
    const result = await this.authService.register(dto, userAgent, ipAddress);
    
    // ✅ ПРОВЕРКА OAuth FLOW: Если это OAuth flow, устанавливаем temp_access_token cookie (как в login)
    const oauthFlowActive = req.cookies?.oauth_flow_active === 'true';
    const oauthClientId = req.cookies?.oauth_client_id;
    const oauthRedirectUri = req.cookies?.oauth_redirect_uri;
    
    // Проверяем, что это успешная регистрация и есть OAuth cookies
    if (result && 'accessToken' in result && oauthFlowActive && oauthClientId && oauthRedirectUri) {
      console.log(`✅ [Auth] OAuth flow detected in registration, setting temp_access_token cookie`);
      console.log(`🔍 [Auth] OAuth params: client_id=${oauthClientId}, redirect_uri=${oauthRedirectUri}`);
      
      // Устанавливаем temp_access_token cookie для /oauth/authorize
      res.cookie('temp_access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60000, // 1 минута
      });
      
      console.log(`✅ [Auth] temp_access_token cookie set for OAuth flow`);
    }
    
    // Адаптируем ответ для фронтенда
    return {
      user: UserAdapter.toFrontendFormat(result.user),
      tokens: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: 3600,
      },
    };
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({ status: 200, description: 'Успешная авторизация' })
  @ApiResponse({ status: 401, description: 'Неверные credentials' })
  @ApiResponse({ status: 202, description: 'Требуется 2FA' })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userAgent = req.get('User-Agent') || undefined;
    const ipAddress = req.ip || req.socket?.remoteAddress || undefined;
    const result = await this.authService.login(dto, userAgent, ipAddress);
    
    // Если требуется 2FA или nFA, возвращаем как есть
    if ('requires2FA' in result || 'requiresNFA' in result) {
      return result;
    }
    
    // ✅ ПРОВЕРКА OAuth FLOW: Если это OAuth flow, устанавливаем temp_access_token cookie
    const oauthFlowActive = req.cookies?.oauth_flow_active === 'true';
    const oauthClientId = req.cookies?.oauth_client_id;
    const oauthRedirectUri = req.cookies?.oauth_redirect_uri;
    
    // Проверяем, что это успешная авторизация (не 2FA/nFA) и есть OAuth cookies
    if (result && 'accessToken' in result && oauthFlowActive && oauthClientId && oauthRedirectUri) {
      console.log(`✅ [Auth] OAuth flow detected in email login, setting temp_access_token cookie`);
      console.log(`🔍 [Auth] OAuth params: client_id=${oauthClientId}, redirect_uri=${oauthRedirectUri}`);
      
      // Устанавливаем temp_access_token cookie для /oauth/authorize
      res.cookie('temp_access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60000, // 1 минута
      });
      
      console.log(`✅ [Auth] temp_access_token cookie set for OAuth flow`);
    }
    
    // Адаптируем ответ для фронтенда
    return {
      user: UserAdapter.toFrontendFormat(result.user),
      tokens: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: 3600,
      },
    };
  }

  @Post('2fa/complete')
  @Public()
  @ApiOperation({ summary: 'Завершение входа с 2FA' })
  @ApiResponse({ status: 200, description: '2FA успешно пройден' })
  @ApiResponse({ status: 400, description: 'Неверный код 2FA' })
  async complete2FALogin(@Body() dto: { userId: string; code: string }, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.complete2FALogin(dto.userId, dto.code);
    
    // ✅ ПРОВЕРКА OAuth FLOW: Если это OAuth flow, устанавливаем temp_access_token cookie
    const oauthFlowActive = req.cookies?.oauth_flow_active === 'true';
    const oauthClientId = req.cookies?.oauth_client_id;
    const oauthRedirectUri = req.cookies?.oauth_redirect_uri;
    
    if (result && 'accessToken' in result && oauthFlowActive && oauthClientId && oauthRedirectUri) {
      console.log(`✅ [Auth] OAuth flow detected in 2FA completion, setting temp_access_token cookie`);
      
      res.cookie('temp_access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60000,
      });
    }
    
    return result;
  }

  @Post('nfa/complete')
  @Public()
  @ApiOperation({ summary: 'Завершение входа с nFA (после подтверждения всех методов)' })
  @ApiResponse({ status: 200, description: 'nFA успешно пройдена, токены выданы' })
  @ApiResponse({ status: 400, description: 'Не все методы подтверждены' })
  async completeNFALogin(@Body() dto: { userId: string }, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.completeNFALogin(dto.userId);
    
    // ✅ ПРОВЕРКА OAuth FLOW: Если это OAuth flow, устанавливаем temp_access_token cookie
    const oauthFlowActive = req.cookies?.oauth_flow_active === 'true';
    const oauthClientId = req.cookies?.oauth_client_id;
    const oauthRedirectUri = req.cookies?.oauth_redirect_uri;
    
    if (result && 'accessToken' in result && oauthFlowActive && oauthClientId && oauthRedirectUri) {
      console.log(`✅ [Auth] OAuth flow detected in nFA completion, setting temp_access_token cookie`);
      
      res.cookie('temp_access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60000,
      });
    }
    
    return result;
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Обновление access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const accessToken = await this.authService.refreshAccessToken(dto.refreshToken);
    return {
      accessToken,
      refreshToken: dto.refreshToken, // Возвращаем тот же refresh token
      expiresIn: 3600,
    };
  }

  @Post('logout')
  @Public()
  @ApiOperation({ summary: 'Выход из системы' })
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить текущего пользователя' })
  async getMe(@CurrentUser() user: any) {
    console.log('🔍 [getMe] Called with user object:', user);
    console.log('🔍 [getMe] user.userId:', user?.userId);
    console.log('🔍 [getMe] user.id:', user?.id);
    console.log('🔍 [getMe] user.sub:', user?.sub);
    
    const userId = user?.userId || user?.id || user?.sub;
    if (!userId) {
      console.error('❌ [getMe] User ID not found in token');
      throw new UnauthorizedException('User ID not found in token');
    }
    
    console.log('✅ [getMe] User ID extracted:', userId);
    
    try {
      const result = await this.authService.getCurrentUser(userId);
      console.log('✅ [getMe] getCurrentUser returned data, result keys:', Object.keys(result || {}));
      console.log('✅ [getMe] Returning result to client');
      return result;
    } catch (error) {
      console.error('❌ [getMe] Error in getCurrentUser:', error);
      console.error('❌ [getMe] Error message:', error?.message);
      throw error;
    }
  }

  @Post('smart-auth')
  @Public()
  @ApiOperation({ 
    summary: 'Умная авторизация', 
    description: 'Автоматически определяет, нужно ли регистрировать или авторизовать пользователя. Если пользователь не существует, создает его. Если не хватает данных, запрашивает их.' 
  })
  @ApiResponse({ status: 200, description: 'Успешная авторизация или запрос дополнительных данных', type: SmartAuthResponseDto })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  async smartAuth(@Body() dto: SmartAuthDto) {
    return this.authService.smartAuth(dto);
  }

  @Post('complete-info')
  @Public()
  @ApiOperation({ 
    summary: 'Дополнение информации о пользователе', 
    description: 'Дополняет недостающую информацию о пользователе (имя, фамилия)' 
  })
  @ApiResponse({ status: 200, description: 'Информация дополнена успешно', type: SmartAuthResponseDto })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  async completeUserInfo(@Body() dto: { userId: string; firstName: string; lastName: string; referralCode?: string }) {
    return this.authService.completeUserInfo(dto.userId, dto.firstName, dto.lastName, dto.referralCode);
  }

  @Get('flow')
  @Public()
  @ApiOperation({ summary: 'Получить публичную конфигурацию алгоритма авторизации' })
  @ApiResponse({ status: 200, description: 'Текущая конфигурация алгоритма авторизации (для клиентских форм)' })
  async getPublicAuthFlow() {
    try {
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
      } catch (parseError) {
        console.error('❌ [AuthController] Error parsing auth_flow_config:', parseError);
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
    } catch (error) {
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

  @Post('bind-phone/send-code')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Отправить SMS код для привязки телефона', 
    description: 'Отправляет SMS с кодом подтверждения на указанный номер телефона' 
  })
  @ApiResponse({ status: 200, description: 'SMS код отправлен', type: BindPhoneResponseDto })
  @ApiResponse({ status: 400, description: 'Неверный формат номера телефона' })
  @ApiResponse({ status: 409, description: 'Номер уже привязан к другому аккаунту' })
  async sendPhoneVerificationCode(@Body() dto: BindPhoneDto, @CurrentUser() user: any) {
    return this.authService.sendPhoneVerificationCode(dto, user.userId);
  }

  @Post('bind-phone/verify')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Подтвердить привязку телефона', 
    description: 'Подтверждает привязку номера телефона с помощью SMS кода' 
  })
  @ApiResponse({ status: 200, description: 'Телефон успешно привязан', type: BindPhoneResponseDto })
  @ApiResponse({ status: 400, description: 'Неверный код подтверждения' })
  async verifyPhoneCode(@Body() dto: VerifyPhoneDto, @CurrentUser() user: any) {
    return this.authService.verifyPhoneCode(dto, user.userId);
  }

  @Post('bind-phone/unbind')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Отвязать номер телефона', 
    description: 'Отвязывает номер телефона от аккаунта пользователя' 
  })
  @ApiResponse({ status: 200, description: 'Телефон отвязан успешно' })
  async unbindPhone(@CurrentUser() user: any) {
    return this.authService.unbindPhone(user.userId);
  }

  @Post('email-verification/send')
  @Public()
  @ApiOperation({ 
    summary: 'Отправить письмо подтверждения email', 
    description: 'Отправляет письмо с ссылкой для подтверждения email адреса' 
  })
  @ApiResponse({ status: 200, description: 'Письмо отправлено', type: EmailVerificationResponseDto })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 400, description: 'Email уже подтвержден' })
  async sendEmailVerification(@Body() dto: SendEmailVerificationDto) {
    return this.authService.sendEmailVerification(dto);
  }

  @Post('email-verification/verify')
  @Public()
  @ApiOperation({ 
    summary: 'Подтвердить email по токену', 
    description: 'Подтверждает email адрес по токену из письма и повышает роль пользователя' 
  })
  @ApiResponse({ status: 200, description: 'Email подтвержден', type: EmailVerificationResponseDto })
  @ApiResponse({ status: 400, description: 'Неверный или истекший токен' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('telegram-login')
  @Public()
  @ApiOperation({ summary: 'Обработка Telegram Login Widget' })
  @ApiResponse({ status: 200, description: 'Успешная авторизация через Telegram' })
  @ApiResponse({ status: 401, description: 'Неверные данные от Telegram' })
  async handleTelegramLogin(@Body() telegramUser: any) {
    const result = await this.authService.handleTelegramLogin(telegramUser);
    return {
      user: UserAdapter.toFrontendFormat(result.user),
      tokens: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: 3600,
      },
    };
  }

  @Post('check')
  @Public()
  @ApiOperation({ summary: 'Проверка существования аккаунта по телефону или email' })
  @ApiResponse({ status: 200, description: 'Результат проверки' })
  async checkAccount(@Body() dto: { contact: string; type: 'phone' | 'email' }) {
    try {
      console.log(`🔍 Проверка аккаунта: contact=${dto.contact}, type=${dto.type}`);
      let user: any = null as any;
      
      if (dto.type === 'phone') {
        user = await this.usersService.findByPhone(dto.contact);
      } else {
        user = await this.usersService.findByEmail(dto.contact);
      }

      const exists = !!user;
      if (exists) {
        console.log(`✅ Пользователь найден: id=${user.id}, email=${user.email}, phone=${user.phone}, primaryAuthMethod=${user?.primaryAuthMethod}, emailAuthType=${(user as any)?.emailAuthType}, hasEmailCode=${(user as any)?.hasEmailCode}`);
      } else {
        console.log(`❌ Пользователь не найден для ${dto.contact}`);
      }

      const methods: Array<'sms' | 'call' | 'telegram'> = exists 
        ? ['sms', 'call'] // Для существующих пользователей доступны SMS и звонок
        : ['sms']; // Для новых - только SMS

      return {
        exists,
        userId: user?.id,
        methods,
        primaryAuthMethod: user?.primaryAuthMethod || 'EMAIL', // Возвращаем основной способ входа
        emailAuthType: (user as any)?.emailAuthType || 'password', // Возвращаем тип аутентификации для EMAIL
        hasEmailCode: (user as any)?.hasEmailCode || false, // Возвращаем информацию о том, включен ли email-code как дополнительный фактор
      };
    } catch (error) {
      console.error('❌ Error in checkAccount:', error);
      // В случае ошибки считаем, что пользователь не существует
      return {
        exists: false,
        userId: null,
        methods: ['sms'],
      };
    }
  }

  @Post('check-and-send-code')
  @Public()
  @ApiOperation({ summary: 'Проверка аккаунта и отправка кода за один запрос' })
  @ApiResponse({ status: 200, description: 'Код отправлен' })
  async checkAndSendCode(@Body() dto: { contact: string; type: 'phone' | 'email'; method?: 'sms' | 'call' | 'telegram' }) {
    try {
      // Проверяем существование аккаунта через метод контроллера
      const checkResult = await this.checkAccount({ contact: dto.contact, type: dto.type });
      const { exists, methods: availableMethods, primaryAuthMethod } = checkResult;
      
      // Для email не используем метод 'sms', 'call' или 'telegram' - отправляем email код напрямую
      // Для phone используем переданный метод или первый доступный
      let selectedMethod: 'sms' | 'call' | 'telegram' | undefined;
      if (dto.type === 'email') {
        // Для email метод не нужен, код отправляется на email
        selectedMethod = undefined;
      } else {
        // Для phone используем переданный метод или первый доступный
        selectedMethod = (dto.method || availableMethods[0] || 'sms') as 'sms' | 'call' | 'telegram';
      }
      
      // Отправляем код
      // Для email метод не передаем (undefined), для phone передаем выбранный метод
      const sendCodeResult = await this.sendCode({
        contact: dto.contact,
        type: dto.type,
        method: selectedMethod, // undefined для email, 'sms'/'call'/'telegram' для phone
      });
      
      return {
        exists,
        methods: availableMethods,
        primaryAuthMethod, // Возвращаем primaryAuthMethod
        ...sendCodeResult,
      };
    } catch (error) {
      console.error('❌ Error in check-and-send-code:', error);
      console.error('❌ Error stack:', error?.stack);
      console.error('❌ Error message:', error?.message);
      throw new BadRequestException(error.message || 'Ошибка при проверке аккаунта и отправке кода');
    }
  }

  @Post('send-code')
  @Public()
  @ApiOperation({ summary: 'Отправка кода подтверждения' })
  @ApiResponse({ status: 200, description: 'Код отправлен' })
  async sendCode(@Body() dto: { contact: string; type: 'phone' | 'email'; method?: 'sms' | 'call' | 'telegram'; sessionId?: string }) {
    try {
      // Генерируем 6-значный код
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Создаем sessionId
      const sessionId = dto.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresIn = 300; // 5 минут в секундах
      const canResendIn = 60; // 60 секунд до повторной отправки

      // Находим пользователя по типу контакта
      const user = dto.type === 'email' 
        ? await this.usersService.findByEmail(dto.contact)
        : await this.usersService.findByPhone(dto.contact);
      
      if (dto.type === 'email') {
        // Сохраняем код в БД для проверки
        try {
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут
          const twoFactorCode = this.twoFactorCodesRepo.create({
            userId: user?.id || null, // Для новых пользователей userId = null
            code: code,
            type: TwoFactorType.EMAIL,
            contact: dto.contact,
            status: TwoFactorStatus.PENDING,
            expiresAt: expiresAt,
            attempts: 0,
            maxAttempts: 3,
          });
          
          await this.twoFactorCodesRepo.save(twoFactorCode);
          console.log(`✅ Код сохранен в БД для ${dto.contact}: код=${code}, userId=${user?.id || 'null'}, expiresAt=${expiresAt.toISOString()}`);
        } catch (error) {
          console.error('❌ Ошибка сохранения кода в БД:', error);
          throw error; // Пробрасываем ошибку, чтобы не продолжать без сохранения кода
        }

        // Отправляем код на email (используем один и тот же код для всех)
        try {
          await this.emailService.sendEmail({
            to: dto.contact,
            subject: 'Код подтверждения Loginus',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">Код подтверждения Loginus</h2>
                <p>${user ? `Здравствуйте, ${user.firstName || 'Пользователь'}!` : 'Здравствуйте!'}</p>
                <p>Ваш код для подтверждения:</p>
                <div style="background: #f8fafc; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                  <h1 style="color: #667eea; font-size: 32px; margin: 0;">${code}</h1>
                </div>
                <p>Код действителен 5 минут.</p>
                ${!user ? '<p>Если вы не запрашивали код для входа, проигнорируйте это письмо.</p>' : ''}
              </div>
            `,
          });
          console.log(`✅ Код отправлен на email ${dto.contact}`);
        } catch (error) {
          console.warn('Ошибка отправки кода на email:', error.message);
          // В dev режиме продолжаем, даже если email не отправился
        }
      } else if (dto.type === 'phone') {
        // Сохраняем код в БД для проверки
        try {
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут
          const twoFactorCode = this.twoFactorCodesRepo.create({
            userId: user?.id || null, // Для новых пользователей userId = null
            code: code,
            type: TwoFactorType.SMS,
            contact: dto.contact,
            status: TwoFactorStatus.PENDING,
            expiresAt: expiresAt,
            attempts: 0,
            maxAttempts: 3,
          });
          
          await this.twoFactorCodesRepo.save(twoFactorCode);
          console.log(`✅ Код сохранен в БД для ${dto.contact}: код=${code}, userId=${user?.id || 'null'}, expiresAt=${expiresAt.toISOString()}`);
        } catch (error) {
          console.error('❌ Ошибка сохранения кода в БД:', error);
          throw error; // Пробрасываем ошибку, чтобы не продолжать без сохранения кода
        }

        // Отправляем код на телефон
        try {
          await this.smsService.sendVerificationCode(dto.contact, code);
        } catch (error) {
          console.warn('Ошибка отправки SMS кода:', error.message);
          // В dev режиме продолжаем, даже если SMS не отправилось
        }
      }

      return {
        sessionId,
        expiresIn,
        canResendIn,
        // В dev режиме возвращаем код для тестирования
        ...(process.env.NODE_ENV !== 'production' && { code }),
      };
    } catch (error) {
      console.error('Error in send-code:', error);
      throw new BadRequestException(error.message || 'Ошибка отправки кода');
    }
  }

  @Post('verify-code')
  @Public()
  @ApiOperation({ summary: 'Проверка кода подтверждения' })
  @ApiResponse({ status: 200, description: 'Код подтвержден' })
  @ApiResponse({ status: 400, description: 'Неверный код' })
  async verifyCode(@Body() dto: { sessionId: string; code: string; contact?: string; type?: 'phone' | 'email' }, @Req() req?: Request) {
    // Технический код для dev режима - работает для любых номеров
    const DEV_CODE = '123456';
    const isDevMode = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';
    
    if (isDevMode && dto.code === DEV_CODE) {
      // В dev режиме код 123456 работает для любого контакта
      // Находим пользователя по контакту, если указан
      let user: any = null;
      if (dto.contact && dto.type) {
        if (dto.type === 'phone') {
          user = await this.usersService.findByPhone(dto.contact);
        } else {
          user = await this.usersService.findByEmail(dto.contact);
        }
      }

      const isNewUser = !user;
      const userId = user?.id || (isNewUser ? `new_user_${Date.now()}` : null);

      // Генерируем токены (в dev режиме используем мок-токены)
      const tokens = {
        accessToken: `mock_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
        expiresIn: 3600,
      };

      return {
        verified: true,
        token: tokens.accessToken,
        userId,
        isNewUser,
        tokens,
      };
    }

    // Если contact и type не переданы, ищем код в БД и извлекаем их оттуда
    let contact = dto.contact;
    let type = dto.type;
    
    if (!contact || !type) {
      // Ищем код в БД по коду и статусу PENDING
      const codeRecord = await this.twoFactorCodesRepo.findOne({
        where: {
          code: dto.code,
          status: TwoFactorStatus.PENDING,
        },
        order: { createdAt: 'DESC' }, // Берем самый свежий код
      });

      if (!codeRecord) {
        throw new BadRequestException('Неверный код или код истек');
      }

      // Извлекаем contact и type из найденной записи
      contact = codeRecord.contact || contact;
      type = codeRecord.type === TwoFactorType.EMAIL ? 'email' : 'phone';
      
      console.log(`📋 Извлечены из БД: contact=${contact}, type=${type}`);
    }

    // Проверяем код в БД
    if (!type || !contact) {
      throw new BadRequestException('Не указан тип контакта или контакт');
    }

    try {
      const contactType = type as 'phone' | 'email';
      
      // Логируем попытку проверки
      console.log(`🔍 Проверка кода для ${contact}, тип: ${contactType}, код: ${dto.code}`);
      
      // Ищем код в БД по contact и code (без проверки expiresAt в where, проверим отдельно)
      const twoFactorCode = await this.twoFactorCodesRepo.findOne({
        where: {
          contact: contact,
          code: dto.code,
          type: contactType === 'email' ? TwoFactorType.EMAIL : TwoFactorType.SMS,
          status: TwoFactorStatus.PENDING,
        },
        relations: ['user'], // Загружаем пользователя, если он есть
        order: { createdAt: 'DESC' }, // Берем самый свежий код
      });

      if (!twoFactorCode) {
        // Проверим, есть ли вообще коды для этого контакта
        const allCodes = await this.twoFactorCodesRepo.find({
          where: { contact: contact },
          order: { createdAt: 'DESC' },
          take: 5,
        });
        console.log(`❌ Код не найден. Всего кодов для ${contact}: ${allCodes.length}`);
        if (allCodes.length > 0) {
          console.log(`Последние коды:`, allCodes.map(c => ({ code: c.code, status: c.status, expiresAt: c.expiresAt })));
        }
        throw new BadRequestException('Неверный код или код истек');
      }

      // Проверяем срок действия отдельно
      if (twoFactorCode.expiresAt < new Date()) {
        console.log(`⏰ Код истек. Истек: ${twoFactorCode.expiresAt}, сейчас: ${new Date()}`);
        twoFactorCode.status = TwoFactorStatus.EXPIRED;
        await this.twoFactorCodesRepo.save(twoFactorCode);
        throw new BadRequestException('Код истек');
      }

      console.log(`✅ Код найден в БД: ${twoFactorCode.code}, статус: ${twoFactorCode.status}, истекает: ${twoFactorCode.expiresAt}`);

      // Проверяем количество попыток
      if (twoFactorCode.attempts >= twoFactorCode.maxAttempts) {
        twoFactorCode.status = TwoFactorStatus.EXPIRED;
        await this.twoFactorCodesRepo.save(twoFactorCode);
        throw new BadRequestException('Превышено количество попыток');
      }

      // Увеличиваем счетчик попыток
      twoFactorCode.attempts += 1;
      await this.twoFactorCodesRepo.save(twoFactorCode);

      // Код верный - помечаем как использованный
      twoFactorCode.status = TwoFactorStatus.USED;
      twoFactorCode.verifiedAt = new Date();
      await this.twoFactorCodesRepo.save(twoFactorCode);

      // Находим или создаем пользователя
      let user = twoFactorCode.user;
      let isNewUser = false;

      if (!user) {
        // Если пользователя нет, значит это регистрация нового пользователя
        // Создаем пользователя
        console.log(`👤 Создание нового пользователя: contact=${contact}, type=${contactType}`);
        const newUser = await this.usersService.create({
          email: contactType === 'email' ? contact : undefined,
          phone: contactType === 'phone' ? contact : undefined,
          emailVerified: contactType === 'email' ? true : false,
          phoneVerified: contactType === 'phone' ? true : false,
          isActive: true, // Активируем пользователя
          // Пароль будет установлен позже при регистрации
          passwordHash: null, 
        });
        console.log(`✅ Пользователь создан: id=${newUser.id}, email=${newUser.email}, phone=${newUser.phone}`);
        user = newUser;
        isNewUser = true;

        // Обновляем userId в TwoFactorCode
        twoFactorCode.userId = newUser.id;
        await this.twoFactorCodesRepo.save(twoFactorCode);
        console.log(`✅ TwoFactorCode обновлен: userId=${newUser.id}`);
      } else {
        // Если пользователь существует, обновляем статус верификации
        console.log(`👤 Пользователь существует: id=${user.id}, email=${user.email}, phone=${user.phone}`);
        if (contactType === 'email') {
          await this.usersService.update(user.id, { emailVerified: true });
          console.log(`✅ Email верифицирован для пользователя ${user.id}`);
        } else if (contactType === 'phone') {
          await this.usersService.update(user.id, { phoneVerified: true });
          console.log(`✅ Телефон верифицирован для пользователя ${user.id}`);
        }
      }

      // Генерируем токены (теперь user всегда существует, так как мы его создали)
      const userAgent = req?.get('User-Agent') || undefined;
      const ipAddress = req?.ip || req?.socket?.remoteAddress || undefined;
      const accessToken = await this.authService.generateAccessToken(user);
      const refreshToken = await this.authService.generateRefreshToken(user, userAgent, ipAddress);

      // Логируем вход в аккаунт
      try {
        await this.auditService.log({
          userId: user.id,
          service: 'Auth',
          action: 'login',
          resource: 'user',
          requestData: {
            contact: contact,
            type: contactType,
            method: 'code',
          },
          statusCode: 200,
          ipAddress: ipAddress || 'unknown',
          userAgent: userAgent || 'unknown',
          userRoles: [],
          userPermissions: [],
        });
      } catch (auditError) {
        console.error('Error logging login event:', auditError);
        // Не прерываем процесс входа из-за ошибки логирования
      }

      return {
        verified: true,
        token: accessToken,
        userId: user.id,
        isNewUser,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in verify-code:', error);
      throw new BadRequestException('Неверный код или код истек');
    }
  }

  /**
   * Завершение онбординга - установка пароля и обновление данных пользователя
   */
  @Post('complete-onboarding')
  @Public()
  @ApiOperation({ summary: 'Завершение онбординга' })
  @ApiResponse({ status: 200, description: 'Онбординг завершен успешно' })
  async completeOnboarding(
    @Body() dto: { userId: string; firstName?: string; lastName?: string; password?: string }
  ) {
    return this.authService.completeOnboarding(dto.userId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: dto.password,
    });
  }
}
