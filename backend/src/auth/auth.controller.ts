import { Controller, Post, Get, Delete, Body, Param, UseGuards, UnauthorizedException, Req, Res, BadRequestException, NotFoundException } from '@nestjs/common';
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
import { LoginStepDto, RegisterStepDto, AuthStepResponseDto } from './dto/auth-step.dto';
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
import { AuthFlowService } from './services/auth-flow.service';
import * as bcrypt from 'bcrypt';

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
    private readonly authFlowService: AuthFlowService,
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
      console.log('✅ [AuthController] getPublicAuthFlow called');
      if (!this.authFlowService) {
        console.error('❌ [AuthController] AuthFlowService is not initialized');
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

      console.log('✅ [AuthController] AuthFlowService is initialized, calling getAuthFlowConfig...');
      const config = await this.authFlowService.getAuthFlowConfig();
      console.log('✅ [AuthController] getAuthFlowConfig returned:', config ? 'has config' : 'null');

      return {
        success: true,
        data: config || {
          login: [],
          registration: [],
          factors: [],
          updatedAt: null,
        },
      };
    } catch (error) {
      console.error('❌ [AuthController] Error in getPublicAuthFlow:', error);
      console.error('❌ [AuthController] Error stack:', error?.stack);
      // Возвращаем дефолтную конфигурацию через AuthFlowService
      try {
        const defaultConfig = await this.authFlowService?.getAuthFlowConfig();
        return {
          success: true,
          data: defaultConfig || {
            login: [],
            registration: [],
            factors: [],
            updatedAt: null,
          },
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
  }

  @Get('user-flow-settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить настройки Auth Flow для текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Настройки авторизации (обязательные + дополнительные факторы)' })
  async getUserFlowSettings(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id || user?.sub;
    
    try {
      // 1. Получить обязательные настройки из auth_flow_config
      const configRaw = await this.settingsService.getSetting('auth_flow_config');
      let config = { login: [], registration: [], factors: [] };
      
      if (configRaw) {
        try {
          config = JSON.parse(configRaw);
        } catch (parseError) {
          console.error('Error parsing auth_flow_config:', parseError);
        }
      }
      
      // 2. Получить индивидуальные настройки пользователя
      const userEntity = await this.usersService.findById(userId);
      
      if (!userEntity) {
        throw new NotFoundException('User not found');
      }
      
      // 3. Получить дополнительные факторы из mfaSettings
      const additionalFactors = userEntity.mfaSettings?.methods || [];
      const mandatoryFactors = config.factors || [];
      
      // 4. Отфильтровать дополнительные факторы (только те, которых нет в обязательных)
      const mandatoryFactorIds = mandatoryFactors.map((f: any) => f.id || f);
      const userOnlyFactors = additionalFactors.filter(
        (method: string) => !mandatoryFactorIds.includes(method)
      );
      
      return {
        success: true,
        data: {
          mandatory: {
            login: config.login || [],
            registration: config.registration || [],
            factors: mandatoryFactors
          },
          user: {
            additionalFactors: userOnlyFactors.map((method: string) => ({
              id: method,
              name: method,
              enabled: true,
              type: 'user-added'
            })),
            availableAuthMethods: userEntity.availableAuthMethods || []
          }
        }
      };
    } catch (error) {
      console.error('Error in getUserFlowSettings:', error);
      throw error;
    }
  }

  @Post('user-additional-factors')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Добавить дополнительный фактор аутентификации' })
  @ApiResponse({ status: 200, description: 'Фактор добавлен' })
  @ApiResponse({ status: 400, description: 'Метод недоступен' })
  async addUserAdditionalFactor(
    @CurrentUser() user: any,
    @Body() body: { method: string }
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    const userEntity = await this.usersService.findById(userId);
    
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }
    
    // Проверяем, что метод доступен пользователю
    const availableMethods = userEntity.availableAuthMethods || [];
    if (!availableMethods.includes(body.method as any)) {
      throw new BadRequestException('Method not available for this user');
    }
    
    // Инициализируем mfaSettings если нет
    if (!userEntity.mfaSettings) {
      userEntity.mfaSettings = {
        enabled: true,
        methods: [body.method],
        backupCodes: [],
        backupCodesUsed: [],
        requiredMethods: 1
      };
    } else {
      // Добавляем метод если его еще нет
      if (!userEntity.mfaSettings.methods.includes(body.method)) {
        userEntity.mfaSettings.methods.push(body.method);
        userEntity.mfaSettings.enabled = true;
      } else {
        throw new BadRequestException('Method already added');
      }
    }
    
    await this.usersService.update(userId, { mfaSettings: userEntity.mfaSettings });
    
    return {
      success: true,
      message: 'Additional factor added successfully',
      method: body.method
    };
  }

  @Delete('user-additional-factors/:method')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Удалить дополнительный фактор аутентификации' })
  @ApiResponse({ status: 200, description: 'Фактор удален' })
  async removeUserAdditionalFactor(
    @CurrentUser() user: any,
    @Param('method') method: string
  ) {
    const userId = user?.userId || user?.id || user?.sub;
    const userEntity = await this.usersService.findById(userId);
    
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }
    
    // Получаем обязательные факторы из конфигурации
    const configRaw = await this.settingsService.getSetting('auth_flow_config');
    let mandatoryFactors: string[] = [];
    
    if (configRaw) {
      try {
        const config = JSON.parse(configRaw);
        mandatoryFactors = (config.factors || []).map((f: any) => f.id || f);
      } catch (parseError) {
        console.error('Error parsing auth_flow_config:', parseError);
      }
    }
    
    // Проверяем, что метод не является обязательным
    if (mandatoryFactors.includes(method)) {
      throw new BadRequestException('Cannot remove mandatory factor');
    }
    
    // Удаляем метод из mfaSettings
    if (userEntity.mfaSettings) {
      userEntity.mfaSettings.methods = userEntity.mfaSettings.methods.filter(m => m !== method);
      
      // Если методов не осталось, отключаем MFA
      if (userEntity.mfaSettings.methods.length === 0) {
        userEntity.mfaSettings.enabled = false;
      }
    }
    
    await this.usersService.update(userId, { mfaSettings: userEntity.mfaSettings });
    
    return {
      success: true,
      message: 'Additional factor removed successfully',
      method
    };
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
          console.log(`📧 [sendCode] Начинаем отправку email на ${dto.contact}`);
          console.log(`📧 [sendCode] Код: ${code}`);
          console.log(`📧 [sendCode] EmailService доступен: ${this.emailService ? 'да' : 'нет'}`);
          
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
          console.log(`✅ [sendCode] Код отправлен на email ${dto.contact}`);
        } catch (error) {
          console.error('❌ [sendCode] Ошибка отправки кода на email:', error);
          console.error('❌ [sendCode] Детали ошибки:', {
            message: error?.message,
            stack: error?.stack,
            name: error?.name,
            code: error?.code
          });
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
          // Устанавливаем способ восстановления по умолчанию
          primaryRecoveryMethod: contactType === 'email' ? 'email' : (contactType === 'phone' ? 'phone' : 'email'),
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

  /**
   * ✅ НОВЫЙ ENDPOINT: Пошаговая аутентификация (вход)
   * Позволяет пройти каждый шаг Auth Flow отдельно
   */
  @Post('flow/login/step')
  @Public()
  @ApiOperation({ summary: 'Пошаговая аутентификация - выполнить один шаг входа' })
  @ApiResponse({ status: 200, description: 'Шаг выполнен', type: AuthStepResponseDto })
  @ApiResponse({ status: 400, description: 'Неверные данные шага' })
  async loginStep(
    @Body() dto: LoginStepDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthStepResponseDto> {
    const userAgent = req.get('User-Agent') || undefined;
    const ipAddress = req.ip || req.socket?.remoteAddress || undefined;

    try {
      // Валидация данных шага
      const validation = await this.authFlowService.validateStepData(dto.stepId, dto.data);
      if (!validation.valid) {
        throw new BadRequestException(validation.error);
      }

      // Получить следующий шаг (пока без информации о пользователе)
      let nextStep = await this.authFlowService.getNextStep(dto.stepId, 'login');
      let isLastStep = await this.authFlowService.isLastStep(dto.stepId, 'login');

      // Обработка в зависимости от типа шага
      switch (dto.stepId) {
        case 'phone-email': {
          // Фронтенд отправляет contact и type, но может быть и login для обратной совместимости
          const contact = (dto.data.contact || dto.data.login)?.trim();
          const contactType = dto.data.type || (contact?.includes('@') ? 'email' : 'phone');
          
          if (!contact) {
            throw new BadRequestException('Contact (email or phone) is required');
          }

          // Нормализуем email (приводим к нижнему регистру)
          const normalizedContact = contactType === 'email' ? contact.toLowerCase().trim() : contact.trim();
          
          const user = contactType === 'email' 
            ? await this.usersService.findByEmail(normalizedContact)
            : await this.usersService.findByPhone(normalizedContact);
          
          // Если пользователь не найден, возвращаем флаг для автоматической регистрации
          if (!user) {
            return {
              success: true,
              requiresRegistration: true,
              message: 'User not found, switching to registration',
              tempData: { contact: normalizedContact, type: contactType }
            };
          }

          const sessionId = dto.sessionId || `session-${Date.now()}-${Math.random()}`;
          
          // ✅ ИСПРАВЛЕНИЕ: Пересчитываем следующий шаг с учетом способа входа пользователя
          // Если пользователь входит через EMAIL (почта + пароль), исключаем GitHub/Telegram
          if (user) {
            nextStep = await this.authFlowService.getNextStep(dto.stepId, 'login', {
              primaryAuthMethod: user.primaryAuthMethod,
              availableAuthMethods: user.availableAuthMethods
            });
            // Пересчитываем isLastStep с учетом способа входа пользователя
            isLastStep = await this.authFlowService.isLastStep(dto.stepId, 'login', {
              primaryAuthMethod: user.primaryAuthMethod,
              availableAuthMethods: user.availableAuthMethods
            });
          }
          
          // Если следующий шаг - это код, отправляем код автоматически
          if (nextStep && (nextStep.id === 'sms-code' || nextStep.id === 'email-code' || nextStep.id === 'sms' || nextStep.id === 'email')) {
            try {
              console.log(`📧 [loginStep] Отправка кода для ${normalizedContact}, тип: ${contactType}`);
              console.log(`📧 [loginStep] nextStep.id: ${nextStep.id}`);
              const sendCodeResult = await this.sendCode({
                contact: normalizedContact,
                type: contactType,
                sessionId: sessionId,
              });
              console.log(`✅ [loginStep] Код отправлен успешно:`, sendCodeResult);
            } catch (error) {
              console.error('❌ [loginStep] Ошибка отправки кода:', error);
              console.error('❌ [loginStep] Детали ошибки:', {
                message: error?.message,
                stack: error?.stack,
                name: error?.name
              });
              // Не прерываем процесс, просто логируем ошибку
            }
          } else {
            console.log(`⚠️ [loginStep] Следующий шаг не требует отправки кода. nextStep:`, nextStep ? { id: nextStep.id, name: nextStep.name } : 'null');
          }
          
          return {
            success: true,
            sessionId,
            nextStep: nextStep ? {
              id: nextStep.id,
              name: nextStep.name,
              type: nextStep.type,
              requiresVerification: this.authFlowService.requiresVerification(nextStep.id)
            } : undefined,
            completed: false,
            message: 'User found, proceed to next step',
            tempData: { userId: user.id, contact: normalizedContact, type: contactType }
          };
        }

        case 'password': {
          if (!dto.data.userId) {
            throw new BadRequestException('User ID is required from previous step');
          }

          const userForPassword = await this.usersService.findById(dto.data.userId);
          if (!userForPassword) {
            throw new UnauthorizedException('User not found');
          }

          const loginResult = await this.authService.login({
            login: userForPassword.email || userForPassword.phone || '',
            password: dto.data.password
          }, userAgent, ipAddress);

          if ('requires2FA' in loginResult || 'requiresNFA' in loginResult) {
            return {
              success: true,
              sessionId: dto.sessionId,
              completed: false,
              message: loginResult.message,
              tempData: loginResult
            };
          }

          // ✅ ИСПРАВЛЕНИЕ: Пересчитываем следующий шаг с учетом способа входа пользователя
          // Если пользователь входит через EMAIL (почта + пароль), исключаем GitHub/Telegram
          nextStep = await this.authFlowService.getNextStep(dto.stepId, 'login', {
            primaryAuthMethod: userForPassword.primaryAuthMethod,
            availableAuthMethods: userForPassword.availableAuthMethods
          });
          isLastStep = await this.authFlowService.isLastStep(dto.stepId, 'login', {
            primaryAuthMethod: userForPassword.primaryAuthMethod,
            availableAuthMethods: userForPassword.availableAuthMethods
          });

          // Логируем информацию о следующем шаге
          console.log(`📋 [loginStep password] nextStep:`, nextStep ? { id: nextStep.id, name: nextStep.name } : 'null');
          console.log(`📋 [loginStep password] isLastStep:`, isLastStep);

          // Если это последний шаг и нет следующего шага, завершаем логин
          if (isLastStep && 'accessToken' in loginResult && !nextStep) {
            return {
              success: true,
              completed: true,
              accessToken: loginResult.accessToken,
              refreshToken: loginResult.refreshToken,
              user: loginResult.user,
              message: 'Login successful'
            };
          }

          // Если следующий шаг - это код (из конфигурации auth flow), отправляем код автоматически
          if (nextStep && (nextStep.id === 'sms-code' || nextStep.id === 'email-code' || nextStep.id === 'sms' || nextStep.id === 'email')) {
            const contact = userForPassword.email || userForPassword.phone || '';
            const contactType = userForPassword.email ? 'email' : 'phone';
            console.log(`📧 [loginStep password] Следующий шаг требует код. Отправка кода для ${contact}, тип: ${contactType}`);
            if (contact) {
              try {
                const sendCodeResult = await this.sendCode({
                  contact: contact,
                  type: contactType,
                  sessionId: dto.sessionId,
                });
                console.log(`✅ [loginStep password] Код отправлен успешно:`, sendCodeResult);
              } catch (error) {
                console.error('❌ [loginStep password] Ошибка отправки кода:', error);
                console.error('❌ [loginStep password] Детали ошибки:', {
                  message: error?.message,
                  stack: error?.stack,
                  name: error?.name
                });
                // Не прерываем процесс, просто логируем ошибку
              }
            } else {
              console.warn('⚠️ [loginStep password] Контакт не найден для отправки кода');
            }
          }
          
          return {
            success: true,
            sessionId: dto.sessionId,
            nextStep: nextStep ? {
              id: nextStep.id,
              name: nextStep.name,
              type: nextStep.type,
              requiresVerification: this.authFlowService.requiresVerification(nextStep.id)
            } : undefined,
            completed: false,
            tempData: { userId: userForPassword.id }
          };
        }

        case 'sms-code':
        case 'email-code':
        case 'sms': // Поддержка старого формата
        case 'email': { // Поддержка старого формата
          // Нормализуем stepId для обработки
          const normalizedStepId = dto.stepId === 'sms' ? 'sms-code' : 
                                   dto.stepId === 'email' ? 'email-code' : 
                                   dto.stepId;
          
          if (!dto.data.code) {
            throw new BadRequestException('Verification code is required');
          }

          // Используем verifyCode для проверки кода
          // Получаем контакт из данных (tempData передается через data в предыдущих шагах)
          const codeContact = dto.data.contact || (dto.data.tempData?.contact);
          const codeContactType = dto.data.type || (dto.data.tempData?.type) || (normalizedStepId === 'email-code' ? 'email' : 'phone');
          
          if (!codeContact) {
            throw new BadRequestException('Contact is required for code verification');
          }

          const verifyResult = await this.verifyCode({
            sessionId: dto.sessionId || '',
            code: dto.data.code,
            contact: codeContact,
            type: codeContactType as 'phone' | 'email',
          }, req);

          if (!verifyResult.verified) {
            throw new BadRequestException('Invalid verification code');
          }

          // Если это последний шаг, возвращаем токены
          if (isLastStep) {
            const user = await this.usersService.findById(verifyResult.userId || '');
            if (!user) {
              throw new UnauthorizedException('User not found');
            }

            const accessToken = await this.authService.generateAccessToken(user);
            const refreshToken = await this.authService.generateRefreshToken(user, userAgent, ipAddress);

            return {
              success: true,
              completed: true,
              accessToken,
              refreshToken,
              user: UserAdapter.toFrontendFormat(user),
              message: 'Login successful'
            };
          }

          // Если не последний шаг, возвращаем следующий
          const nextStepAfterCode = await this.authFlowService.getNextStep(normalizedStepId, 'login');
          return {
            success: true,
            sessionId: dto.sessionId,
            nextStep: nextStepAfterCode ? {
              id: nextStepAfterCode.id,
              name: nextStepAfterCode.name,
              type: nextStepAfterCode.type,
              requiresVerification: this.authFlowService.requiresVerification(nextStepAfterCode.id)
            } : undefined,
            completed: false,
            tempData: { userId: verifyResult.userId }
          };
        }

        default:
          throw new BadRequestException(`Unsupported step: ${dto.stepId}`);
      }
    } catch (error) {
      console.error('Error in loginStep:', error);
      throw error;
    }
  }

  /**
   * ✅ НОВЫЙ ENDPOINT: Получить первый шаг для входа
   */
  @Get('login/first-step')
  @Public()
  @ApiOperation({ summary: 'Получить первый шаг для входа согласно Auth Flow' })
  @ApiResponse({ status: 200, description: 'Первый шаг входа' })
  async getFirstLoginStep() {
    const steps = await this.authFlowService.getLoginFlow();
    const firstStep = steps.length > 0 ? steps[0] : null;

    return {
      success: true,
      data: {
        step: firstStep,
        totalSteps: steps.length
      }
    };
  }

  /**
   * ✅ НОВЫЙ ENDPOINT: Инициировать пошаговую регистрацию
   */
  @Post('flow/register/init')
  @Public()
  @ApiOperation({ summary: 'Инициировать пошаговую регистрацию' })
  @ApiResponse({ status: 200, description: 'Первый шаг регистрации', type: AuthStepResponseDto })
  async initRegisterFlow(
    @Body() dto: RegisterStepDto,
    @Req() req: Request,
  ): Promise<AuthStepResponseDto> {
    const userAgent = req.get('User-Agent') || undefined;
    const ipAddress = req.ip || req.socket?.remoteAddress || undefined;

    try {
      // Получаем первый шаг регистрации
      let steps = await this.authFlowService.getRegistrationFlow();
      
      // ✅ ИСПРАВЛЕНИЕ: Исключаем шаги для GitHub/Telegram при регистрации через EMAIL
      // При регистрации через phone-email это EMAIL способ, исключаем OAuth методы
      steps = steps.filter(step => 
        step.id !== 'github' && 
        step.id !== 'telegram' &&
        step.id !== 'oauth-github' &&
        step.id !== 'oauth-telegram'
      );
      
      if (steps.length === 0) {
        throw new BadRequestException('Registration flow is not configured');
      }

      const firstStep = steps[0];
      const sessionId = `register-session-${Date.now()}-${Math.random()}`;

      return {
        success: true,
        message: 'Registration flow initiated',
        sessionId,
        nextStep: {
          id: firstStep.id,
          name: firstStep.name,
          type: firstStep.type,
        },
        payload: {
          flowConfig: steps,
        },
      };
    } catch (error) {
      console.error('Error in initRegisterFlow:', error);
      throw error;
    }
  }

  /**
   * ✅ НОВЫЙ ENDPOINT: Обработать шаг пошаговой регистрации
   */
  @Post('flow/register/step')
  @Public()
  @ApiOperation({ summary: 'Обработать шаг пошаговой регистрации' })
  @ApiResponse({ status: 200, description: 'Следующий шаг или завершение', type: AuthStepResponseDto })
  async processRegisterStep(
    @Body() dto: RegisterStepDto,
    @Req() req: Request,
  ): Promise<AuthStepResponseDto> {
    const userAgent = req.get('User-Agent') || undefined;
    const ipAddress = req.ip || req.socket?.remoteAddress || undefined;

    try {
      // Создаем sessionId, если его нет (для первого шага)
      const sessionId = dto.sessionId || `register-session-${Date.now()}-${Math.random()}`;

      // Валидация данных шага
      console.log('🔍 [processRegisterStep] Before validation, dto.stepId:', dto.stepId, 'dto.data:', JSON.stringify(dto.data, null, 2));
      const validation = await this.authFlowService.validateStepData(dto.stepId, dto.data);
      console.log('🔍 [processRegisterStep] Validation result:', JSON.stringify(validation, null, 2));
      if (!validation.valid) {
        console.error('❌ [processRegisterStep] Validation failed:', validation.error);
        throw new BadRequestException(validation.error);
      }

      // Получить следующий шаг (пока без информации о пользователе, т.к. это регистрация)
      let nextStep = await this.authFlowService.getNextStep(dto.stepId, 'registration');
      let isLastStep = await this.authFlowService.isLastStep(dto.stepId, 'registration');

      // Обработка в зависимости от типа шага
      switch (dto.stepId) {
        case 'phone-email':
          const contact = dto.data.contact || dto.data.login;
          const contactType = dto.data.type || (contact?.includes('@') ? 'email' : 'phone');
          
          if (!contact) {
            throw new BadRequestException('Contact (email or phone) is required');
          }

          // Проверяем, не существует ли уже пользователь
          const existingUser = contactType === 'email' 
            ? await this.usersService.findByEmail(contact)
            : await this.usersService.findByPhone(contact);
          
          if (existingUser) {
            throw new BadRequestException('User with this contact already exists. Please login.');
          }

          // ВАЖНО: При регистрации пользователя еще нет, поэтому не передаем параметр user
          // GitHub/Telegram уже исключены в getRegistrationFlow(), последний шаг определяется на основе всех шагов из БД
          nextStep = await this.authFlowService.getNextStep(dto.stepId, 'registration');
          isLastStep = await this.authFlowService.isLastStep(dto.stepId, 'registration');

          // Если следующий шаг - это код, отправляем код автоматически
          if (nextStep && (nextStep.id === 'sms-code' || nextStep.id === 'email-code')) {
            try {
              console.log(`📧 [processRegisterStep] Отправка кода для ${contact}, тип: ${contactType}`);
              const sendCodeResult = await this.sendCode({
                contact: contact,
                type: contactType,
                sessionId: sessionId,
              });
              console.log(`✅ [processRegisterStep] Код отправлен успешно:`, sendCodeResult);
            } catch (error) {
              console.error('❌ [processRegisterStep] Ошибка отправки кода:', error);
              // Не прерываем процесс, просто логируем ошибку
            }
          }
          
          return {
            success: true,
            sessionId: sessionId,
            nextStep: nextStep ? {
              id: nextStep.id,
              name: nextStep.name,
              type: nextStep.type,
            } : undefined,
            completed: false,
            message: 'Contact verified, proceed to next step',
            tempData: { contact, type: contactType }
          };

        case 'first-name':
        case 'name':
          console.log('🔍 [processRegisterStep] first-name step, dto.data:', JSON.stringify(dto.data, null, 2));
          if (!dto.data.firstName) {
            console.error('❌ [processRegisterStep] firstName is missing in dto.data:', dto.data);
            throw new BadRequestException('First name is required');
          }
          
          // ВАЖНО: При регистрации пользователя еще нет, поэтому не передаем параметр user
          // GitHub/Telegram уже исключены в getRegistrationFlow(), последний шаг определяется на основе всех шагов из БД
          console.log('🔍 [processRegisterStep] name step - Getting registration flow...');
          console.log('🔍 [processRegisterStep] Current stepId from dto:', dto.stepId);
          
          const registrationSteps = await this.authFlowService.getRegistrationFlow();
          console.log('🔍 [processRegisterStep] name step - Got registration steps:', registrationSteps.length);
          console.log('🔍 [processRegisterStep] All registration steps:', registrationSteps.map(s => `${s.id}(order=${s.order})`).join(', '));
          
          console.log('🔍 [processRegisterStep] name step - Getting next step...');
          nextStep = await this.authFlowService.getNextStep(dto.stepId, 'registration');
          console.log('🔍 [processRegisterStep] name step - Got nextStep:', nextStep ? nextStep.id : 'null');
          
          console.log('🔍 [processRegisterStep] name step - Checking if last step...');
          isLastStep = await this.authFlowService.isLastStep(dto.stepId, 'registration');
          console.log('🔍 [processRegisterStep] name step - isLastStep result:', isLastStep);
          
          // Объединяем с предыдущими данными из tempData (фронтенд передает все в combinedData)
          const firstNameTempData = {
            ...(dto.data.contact && { contact: dto.data.contact }),
            ...(dto.data.type && { type: dto.data.type }),
            ...(dto.data.lastName && { lastName: dto.data.lastName }),
            firstName: dto.data.firstName
          };
          console.log('✅ [processRegisterStep] firstNameTempData:', JSON.stringify(firstNameTempData, null, 2));
          
          // Если это последний шаг, вызываем completeRegisterFlow
          if (isLastStep) {
            console.log('✅ [processRegisterStep] name step is last, calling completeRegisterFlow');
            // Собираем все данные из dto.data (они должны быть накоплены через tempData на фронтенде)
            const allData = {
              ...(dto.data.contact && { contact: dto.data.contact }),
              ...(dto.data.type && { type: dto.data.type }),
              ...(dto.data.firstName && { firstName: dto.data.firstName }),
              ...(dto.data.lastName && { lastName: dto.data.lastName }),
              ...(dto.data.password && { password: dto.data.password }),
              ...(dto.data.inn && { inn: dto.data.inn }),
            };
            
            return this.completeRegisterFlow(
              { ...dto, sessionId, data: allData },
              req as any,
            );
          }
          
          console.log('⚠️ [processRegisterStep] name step is NOT last, returning nextStep:', nextStep ? nextStep.id : 'null');
          return {
            success: true,
            sessionId: sessionId,
            nextStep: nextStep ? {
              id: nextStep.id,
              name: nextStep.name,
              type: nextStep.type,
            } : undefined,
            completed: false,
            message: 'First name saved',
            tempData: firstNameTempData
          };

        case 'last-name':
        case 'surname':
          if (!dto.data.lastName) {
            throw new BadRequestException('Last name is required');
          }
          
          // ВАЖНО: При регистрации пользователя еще нет, поэтому не передаем параметр user
          // GitHub/Telegram уже исключены в getRegistrationFlow(), последний шаг определяется на основе всех шагов из БД
          nextStep = await this.authFlowService.getNextStep(dto.stepId, 'registration');
          isLastStep = await this.authFlowService.isLastStep(dto.stepId, 'registration');
          
          // Объединяем с предыдущими данными из tempData
          const lastNameTempData = {
            ...(dto.data.contact && { contact: dto.data.contact }),
            ...(dto.data.type && { type: dto.data.type }),
            ...(dto.data.firstName && { firstName: dto.data.firstName }),
            lastName: dto.data.lastName
          };
          return {
            success: true,
            sessionId: sessionId,
            nextStep: nextStep ? {
              id: nextStep.id,
              name: nextStep.name,
              type: nextStep.type,
            } : undefined,
            completed: false,
            message: 'Last name saved',
            tempData: lastNameTempData
          };

        case 'inn':
          if (!dto.data.inn) {
            throw new BadRequestException('INN is required');
          }
          
          // ВАЖНО: При регистрации пользователя еще нет, поэтому не передаем параметр user
          // GitHub/Telegram уже исключены в getRegistrationFlow(), последний шаг определяется на основе всех шагов из БД
          nextStep = await this.authFlowService.getNextStep(dto.stepId, 'registration');
          isLastStep = await this.authFlowService.isLastStep(dto.stepId, 'registration');
          
          // Объединяем с предыдущими данными из tempData (фронтенд передает все в combinedData)
          const innTempData = {
            ...(dto.data.contact && { contact: dto.data.contact }),
            ...(dto.data.type && { type: dto.data.type }),
            ...(dto.data.firstName && { firstName: dto.data.firstName }),
            ...(dto.data.lastName && { lastName: dto.data.lastName }),
            ...(dto.data.password && { password: dto.data.password }),
            inn: dto.data.inn
          };
          
          // Если следующий шаг - это код, отправляем код автоматически
          if (nextStep && (nextStep.id === 'sms-code' || nextStep.id === 'email-code')) {
            const contact = dto.data.contact || '';
            const contactType = dto.data.type || (contact.includes('@') ? 'email' : 'phone');
            if (contact) {
              try {
                await this.sendCode({
                  contact: contact,
                  type: contactType,
                  sessionId: sessionId,
                });
              } catch (error) {
                console.error('Ошибка отправки кода:', error);
                // Не прерываем процесс, просто логируем ошибку
              }
            }
          }
          
          // Если это последний шаг, вызываем completeRegisterFlow
          if (isLastStep) {
            // Собираем все данные из dto.data (они должны быть накоплены через tempData на фронтенде)
            const allData = {
              ...(dto.data.contact && { contact: dto.data.contact }),
              ...(dto.data.type && { type: dto.data.type }),
              ...(dto.data.firstName && { firstName: dto.data.firstName }),
              ...(dto.data.lastName && { lastName: dto.data.lastName }),
              ...(dto.data.password && { password: dto.data.password }),
              inn: dto.data.inn,
            };
            
            return this.completeRegisterFlow(
              { ...dto, sessionId, data: allData },
              req as any,
            );
          }
          
          return {
            success: true,
            sessionId: sessionId,
            nextStep: nextStep ? {
              id: nextStep.id,
              name: nextStep.name,
              type: nextStep.type,
            } : undefined,
            completed: false,
            message: 'INN saved',
            tempData: innTempData
          };

        case 'password':
          if (!dto.data.password) {
            throw new BadRequestException('Password is required');
          }
          
          // Если это регистрация и есть подтверждение пароля, проверяем совпадение
          if (dto.data.passwordConfirm) {
            if (dto.data.passwordConfirm !== dto.data.password) {
              throw new BadRequestException('Passwords do not match');
            }
          }
          
          // ВАЖНО: При регистрации пользователя еще нет, поэтому не передаем параметр user
          // GitHub/Telegram уже исключены в getRegistrationFlow(), последний шаг определяется на основе всех шагов из БД
          nextStep = await this.authFlowService.getNextStep(dto.stepId, 'registration');
          isLastStep = await this.authFlowService.isLastStep(dto.stepId, 'registration');
          
          // Объединяем с предыдущими данными из tempData (фронтенд передает все в combinedData)
          const passwordTempData = {
            ...(dto.data.contact && { contact: dto.data.contact }),
            ...(dto.data.type && { type: dto.data.type }),
            ...(dto.data.firstName && { firstName: dto.data.firstName }),
            ...(dto.data.lastName && { lastName: dto.data.lastName }),
            ...(dto.data.inn && { inn: dto.data.inn }),
            password: dto.data.password
          };
          
          // Если следующий шаг - это код, отправляем код автоматически
          if (nextStep && (nextStep.id === 'sms-code' || nextStep.id === 'email-code')) {
            const contact = dto.data.contact || '';
            const contactType = dto.data.type || (contact.includes('@') ? 'email' : 'phone');
            if (contact) {
              try {
                await this.sendCode({
                  contact: contact,
                  type: contactType,
                  sessionId: sessionId,
                });
              } catch (error) {
                console.error('Ошибка отправки кода:', error);
                // Не прерываем процесс, просто логируем ошибку
              }
            }
          }
          
          // Если это последний шаг, вызываем completeRegisterFlow
          if (isLastStep) {
            // Собираем все данные из dto.data (они должны быть накоплены через tempData на фронтенде)
            const allData = {
              ...(dto.data.contact && { contact: dto.data.contact }),
              ...(dto.data.type && { type: dto.data.type }),
              ...(dto.data.firstName && { firstName: dto.data.firstName }),
              ...(dto.data.lastName && { lastName: dto.data.lastName }),
              ...(dto.data.inn && { inn: dto.data.inn }),
              password: dto.data.password, // Используем оригинальный пароль, не подтверждение
            };
            
            return this.completeRegisterFlow(
              { ...dto, sessionId, data: allData },
              req as any,
            );
          }
          
          return {
            success: true,
            sessionId: sessionId,
            nextStep: nextStep ? {
              id: nextStep.id,
              name: nextStep.name,
              type: nextStep.type,
            } : undefined,
            completed: false,
            message: 'Password saved',
            tempData: passwordTempData
          };

        default:
          throw new BadRequestException(`Unsupported registration step: ${dto.stepId}`);
      }
    } catch (error) {
      console.error('Error in processRegisterStep:', error);
      throw error;
    }
  }

  /**
   * ✅ НОВЫЙ ENDPOINT: Завершить регистрацию
   */
  @Post('flow/register/complete')
  @Public()
  @ApiOperation({ summary: 'Завершить регистрацию' })
  @ApiResponse({ status: 200, description: 'Регистрация завершена, выданы токены', type: AuthStepResponseDto })
  async completeRegisterFlow(
    @Body() dto: RegisterStepDto,
    @Req() req: Request,
  ): Promise<AuthStepResponseDto> {
    const userAgent = req.get('User-Agent') || undefined;
    const ipAddress = req.ip || req.socket?.remoteAddress || undefined;

    try {
      if (!dto.sessionId) {
        throw new BadRequestException('Session ID is required');
      }

      // Собираем все данные из dto.data (они должны быть накоплены через tempData)
      // Используем password, а не passwordConfirm
      const { contact, type, firstName, lastName, password, passwordConfirm, inn } = dto.data;
      
      // Используем password (не passwordConfirm) для создания пользователя
      const finalPassword = password || passwordConfirm;
      
      // Нормализуем contact
      const normalizedContact = type === 'email' ? contact?.toLowerCase().trim() : contact?.trim();

      if (!contact || !type || !finalPassword) {
        throw new BadRequestException('Missing required registration data: contact, type, and password are required');
      }

      // Проверяем, не существует ли уже пользователь
      const existingUser = type === 'email' 
        ? await this.usersService.findByEmail(normalizedContact)
        : await this.usersService.findByPhone(normalizedContact);
      
      if (existingUser) {
        throw new BadRequestException('User with this contact already exists');
      }

      // Создаем пользователя через UsersService напрямую, так как RegisterDto не поддерживает phone
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(finalPassword, salt);

      const newUser = await this.usersService.create({
        email: type === 'email' ? normalizedContact : undefined,
        phone: type === 'phone' ? normalizedContact : undefined,
        passwordHash,
        firstName: firstName || '',
        lastName: lastName || '',
        inn: inn || null,
        emailVerified: type === 'email',
        phoneVerified: type === 'phone',
      });

      // Генерируем токены
      const accessToken = await this.authService.generateAccessToken(newUser);
      const refreshToken = await this.authService.generateRefreshToken(newUser, userAgent, ipAddress);

      // Логируем регистрацию
      try {
        await this.auditService.log({
          userId: newUser.id,
          service: 'Auth',
          action: 'registration_completed',
          resource: 'user',
          requestData: { contact, type, hasInn: !!inn },
          statusCode: 200,
          ipAddress: ipAddress || 'unknown',
          userAgent: userAgent || 'unknown',
          userRoles: [],
          userPermissions: [],
        });
      } catch (auditError) {
        console.error('Error logging registration event:', auditError);
      }

      return {
        success: true,
        completed: true,
        accessToken,
        refreshToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
        message: 'Registration successful',
      };
    } catch (error) {
      console.error('Error in completeRegisterFlow:', error);
      throw error;
    }
  }
}
