import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { AuthMethodType } from '../auth/enums/auth-method-type.enum';
import { EmailService } from '../auth/email.service';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokensRepo: Repository<RefreshToken>,
    private usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async getDevices(userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // Получаем все активные сессии (refresh tokens) пользователя
      const tokens = await this.refreshTokensRepo.find({
        where: { userId, isRevoked: false },
        order: { createdAt: 'DESC' },
      });

      return tokens.map((token, index) => {
        const deviceInfo = this.extractDeviceInfo(token.userAgent || '');
        
        return {
          id: token.id,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          ip: token.ipAddress || 'Unknown',
          location: 'Unknown', // Можно добавить геолокацию позже
          lastActivity: token.createdAt.toISOString(),
          current: index === 0, // Первая сессия считается текущей
        };
      });
    } catch (error) {
      console.error('Error in getDevices:', error);
      throw error;
    }
  }

  private extractDeviceInfo(userAgent: string): { device: string; browser: string } {
    if (!userAgent) {
      return { device: 'Unknown Device', browser: 'Unknown' };
    }

    // Определяем браузер
    let browser = 'Unknown';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
    } else if (userAgent.includes('Edg')) {
      browser = 'Edge';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      browser = 'Opera';
    }

    // Определяем устройство
    let device = 'Unknown Device';
    if (userAgent.includes('Mobile')) {
      if (userAgent.includes('iPhone')) {
        device = 'iPhone';
      } else if (userAgent.includes('Android')) {
        device = 'Android Phone';
      } else {
        device = 'Mobile Device';
      }
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      device = 'iPad';
    } else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) {
      device = 'Mac';
    } else if (userAgent.includes('Windows')) {
      device = 'Windows PC';
    } else if (userAgent.includes('Linux')) {
      device = 'Linux PC';
    } else {
      device = 'Desktop';
    }

    return { device, browser };
  }

  async deleteDevice(userId: string, deviceId: string) {
    const token = await this.refreshTokensRepo.findOne({
      where: { id: deviceId, userId },
    });

    if (!token) {
      throw new Error('Device not found');
    }

    token.isRevoked = true;
    await this.refreshTokensRepo.save(token);

    return { message: 'Device deleted successfully' };
  }

  async getActivity(userId: string) {
    try {
      // Получаем события из audit log за последние 180 дней
      // Не фильтруем по сервису, чтобы получить все события (Auth, security и т.д.)
      const auditHistory = await this.auditService.getUserAuditHistory(
        userId,
        1,
        100, // Получаем последние 100 событий
        undefined, // Не фильтруем по сервису
      );

      // Преобразуем audit logs в формат для отображения
      const activities = auditHistory.data
        .filter(log => {
          // Фильтруем только релевантные события безопасности
          const relevantActions = [
            'login',
            'logout',
            'password-reset',
            'password-reset-request',
            'PASSWORD_RESET_REQUESTED',
            'PASSWORD_RESET_COMPLETED',
            'auth-method-change',
          ];
          // Проверяем, что сервис связан с безопасностью (Auth, security)
          const isSecurityService = log.service === 'Auth' || log.service === 'security' || log.service === 'auth';
          return isSecurityService && relevantActions.includes(log.action);
        })
        .map(log => {
          // Определяем описание действия на русском
          let actionDescription = '';
          switch (log.action) {
            case 'login':
              actionDescription = 'Вход в систему';
              break;
            case 'logout':
              actionDescription = 'Выход из системы';
              break;
            case 'password-reset':
              actionDescription = 'Восстановление пароля';
              break;
            case 'password-reset-request':
              actionDescription = 'Запрос восстановления пароля';
              break;
            case 'auth-method-change':
              actionDescription = 'Изменение способа входа';
              break;
            default:
              actionDescription = log.action;
          }

          // Извлекаем информацию об устройстве из userAgent
          const deviceInfo = this.extractDeviceInfoForActivity(log.userAgent || '');
          
          return {
            id: log.id,
            action: actionDescription,
            date: log.createdAt.toISOString(),
            ip: log.ipAddress || 'Unknown',
            device: deviceInfo.device,
            location: 'Unknown', // Можно добавить геолокацию позже
          };
        });

      return {
        activity: activities,
      };
    } catch (error) {
      console.error('Error in getActivity:', error);
      return {
        activity: [],
      };
    }
  }

  private extractDeviceInfoForActivity(userAgent: string): { device: string; browser: string } {
    if (!userAgent) {
      return { device: 'Unknown Device', browser: 'Unknown' };
    }

    // Определяем браузер
    let browser = 'Unknown';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
    } else if (userAgent.includes('Edg')) {
      browser = 'Edge';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      browser = 'Opera';
    }

    // Определяем устройство
    let device = 'Unknown Device';
    if (userAgent.includes('Mobile')) {
      if (userAgent.includes('iPhone')) device = 'iPhone';
      else if (userAgent.includes('Android')) device = 'Android Phone';
      else device = 'Mobile Device';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      device = 'Tablet';
    } else {
      device = 'Desktop';
    }

    return { device, browser };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    // Используем AuthService для смены пароля
    const user = await this.usersService.findById(userId, {
      select: ['id', 'email', 'phone', 'passwordHash'],
    });
    if (!user) {
      throw new Error('User not found');
    }

    // Проверяем старый пароль напрямую через bcrypt
    if (!user.passwordHash) {
      throw new Error('User password hash is required');
    }
    
    // Проверяем, что oldPassword не пустой
    if (!oldPassword || oldPassword.trim() === '') {
      throw new Error('Текущий пароль обязателен');
    }
    
    // Проверяем, что newPassword не пустой
    if (!newPassword || newPassword.trim() === '') {
      throw new Error('Новый пароль обязателен');
    }
    
    // Проверяем минимальную длину нового пароля
    if (newPassword.length < 6) {
      throw new Error('Новый пароль должен содержать минимум 6 символов');
    }
    
    console.log('🔍 [changePassword] Checking password for user:', userId);
    console.log('🔍 [changePassword] Password hash exists:', !!user.passwordHash);
    console.log('🔍 [changePassword] Old password provided:', !!oldPassword);
    
    // Проверяем, что passwordHash валидный (не null, не undefined, строка)
    if (typeof user.passwordHash !== 'string' || user.passwordHash.trim() === '') {
      throw new Error('Invalid password hash format');
    }
    
    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    console.log('🔍 [changePassword] Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      throw new Error('Invalid old password');
    }

    // Обновляем пароль
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    await this.usersService.update(userId, { passwordHash });

    return { message: 'Password changed successfully' };
  }

  async updateAuthMethod(userId: string, primaryAuthMethod: string, emailAuthType?: 'password' | 'code', hasEmailCode?: boolean, req?: Request) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Сохраняем старые значения для логирования
    const oldPrimaryAuthMethod = user.primaryAuthMethod;
    const oldEmailAuthType = user.emailAuthType;

    // Проверяем, что переданный метод валиден
    if (!Object.values(AuthMethodType).includes(primaryAuthMethod as AuthMethodType)) {
      throw new Error('Invalid auth method');
    }

    const updateData: any = { primaryAuthMethod: primaryAuthMethod as AuthMethodType };
    
    // Если primaryAuthMethod === 'EMAIL', сохраняем также emailAuthType
    if (primaryAuthMethod === AuthMethodType.EMAIL && emailAuthType) {
      updateData.emailAuthType = emailAuthType;
    }

    // Сохраняем информацию о том, включен ли email-code как дополнительный фактор
    if (hasEmailCode !== undefined) {
      updateData.hasEmailCode = hasEmailCode;
    }

    await this.usersService.update(userId, updateData);

    // Логируем событие изменения способа входа
    try {
      const ipAddress = req?.ip || req?.socket?.remoteAddress || 'unknown';
      const userAgent = req?.get('User-Agent') || 'unknown';
      await this.auditService.log({
        userId,
        service: 'security',
        action: 'auth-method-change',
        resource: 'auth-method',
        requestData: {
          oldPrimaryAuthMethod,
          oldEmailAuthType,
          newPrimaryAuthMethod: primaryAuthMethod,
          newEmailAuthType: emailAuthType,
        },
        statusCode: 200,
        ipAddress,
        userAgent,
        userRoles: [],
        userPermissions: [],
      });
    } catch (auditError) {
      console.error('Error logging auth method change:', auditError);
    }

    return { message: 'Auth method updated successfully', primaryAuthMethod, emailAuthType: updateData.emailAuthType };
  }

  async getAuthMethod(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Проверяем, есть ли email-code в настройках пользователя
    // Если primaryAuthMethod === 'EMAIL' и emailAuthType === 'password',
    // но пользователь выбрал оба метода (пароль и код), то hasEmailCode = true
    // Для этого нужно проверить, есть ли в availableAuthMethods информация о email-code
    // Или можно использовать отдельное поле hasEmailCode
    
    // Временно: если primaryAuthMethod === 'EMAIL' и emailAuthType === 'password',
    // но в availableAuthMethods есть информация о том, что email-code включен,
    // то hasEmailCode = true
    // Но для этого нужно сохранять информацию о том, какие факторы включены
    
    // Пока что просто возвращаем primaryAuthMethod и emailAuthType
    // hasEmailCode будет определяться на фронтенде на основе authPath
    
    return { 
      primaryAuthMethod: user.primaryAuthMethod || AuthMethodType.EMAIL,
      emailAuthType: user.emailAuthType || 'password',
      hasEmailCode: user.hasEmailCode || false,
    };
  }

  async getAvailableRecoveryMethods(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Определяем primaryRecoveryMethod по умолчанию, если его нет
    // Используем безопасный доступ к полю, так как оно может отсутствовать в БД
    let primaryRecoveryMethod: 'email' | 'phone' | null = null;
    try {
      primaryRecoveryMethod = (user as any).primaryRecoveryMethod;
    } catch (e) {
      // Поле может отсутствовать в БД
    }
    
    if (!primaryRecoveryMethod) {
      // Устанавливаем по умолчанию на основе доступных контактов
      if (user.email) {
        primaryRecoveryMethod = 'email';
      } else if (user.phone) {
        primaryRecoveryMethod = 'phone';
      } else {
        primaryRecoveryMethod = 'email'; // По умолчанию email
      }
    }
    
    const methods: Array<{
      type: string;
      contact: string;
      verified: boolean;
      primary: boolean;
      icon: string;
    }> = [];
    
    // Email
    if (user.email) {
      methods.push({
        type: 'email',
        contact: user.email,
        verified: user.emailVerified,
        primary: primaryRecoveryMethod === 'email' || (!primaryRecoveryMethod && user.primaryAuthMethod === 'EMAIL'),
        icon: 'mail'
      });
    }
    
    // Phone / Telegram
    if (user.phone || user.messengerMetadata?.telegram) {
      methods.push({
        type: 'phone_telegram',
        contact: user.phone || user.messengerMetadata?.telegram?.username || 'Telegram',
        verified: user.phoneVerified,
        primary: primaryRecoveryMethod === 'phone' || (!primaryRecoveryMethod && user.primaryAuthMethod === 'PHONE_TELEGRAM'),
        icon: 'message-circle'
      });
    }
    
    // GitHub
    if (user.githubId) {
      methods.push({
        type: 'github',
        contact: user.githubUsername || 'GitHub Account',
        verified: user.githubVerified,
        primary: user.primaryAuthMethod === 'GITHUB',
        icon: 'github'
      });
    }
    
    // VKontakte
    if (user.vkontakteId) {
      methods.push({
        type: 'vkontakte',
        contact: 'VK Account',
        verified: user.vkontakteVerified,
        primary: false,
        icon: 'user'
      });
    }
    
    // Gosuslugi
    if (user.gosuslugiId) {
      methods.push({
        type: 'gosuslugi',
        contact: 'Gosuslugi Account',
        verified: user.gosuslugiVerified,
        primary: false,
        icon: 'shield'
      });
    }
    
    // Возвращаем методы с правильной структурой
    return {
      success: true,
      methods: methods.map(m => ({
        type: m.type,
        contact: m.contact,
        verified: m.verified,
        primary: m.primary,
        icon: m.icon,
      }))
    };
  }

  async setupRecoveryMethod(userId: string, method: 'email' | 'phone') {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (method === 'email' && !user.email) {
      throw new Error('Email not found');
    }

    if (method === 'phone' && !user.phone) {
      throw new Error('Phone not found');
    }

    // Сохраняем выбранный способ восстановления
    // Используем безопасное обновление, так как поле может отсутствовать в БД
    try {
      await this.usersService.update(userId, { primaryRecoveryMethod: method });
    } catch (error: any) {
      // Если поле отсутствует в БД, просто логируем ошибку
      if (error?.message?.includes('primaryRecoveryMethod')) {
        console.warn('⚠️ [setupRecoveryMethod] Поле primaryRecoveryMethod отсутствует в БД, пропускаем сохранение');
      } else {
        throw error;
      }
    }

    // Отправляем уведомление на email
    if (user.email) {
      try {
        await this.emailService.sendRecoveryMethodSetupEmail(user.email, method);
      } catch (error) {
        console.error('Error sending recovery method setup email:', error);
        // Не прерываем выполнение, если email не отправился
      }
    }

    return {
      message: `Recovery method ${method} setup successfully`,
      method,
      contact: method === 'email' ? user.email : user.phone,
    };
  }

  private extractBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * Выход со всех устройств
   * Помечает все refresh tokens пользователя как revoked
   * @param userId - ID пользователя
   * @param currentTokenId - ID текущего токена (опционально, чтобы не отзывать текущую сессию)
   * @param req - Request объект для логирования
   */
  async logoutFromAllDevices(
    userId: string,
    currentTokenId?: string,
    req?: Request,
  ): Promise<{ success: boolean; message: string; revokedCount: number }> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // 1. Получить все активные токены пользователя
      const tokens = await this.refreshTokensRepo.find({
        where: { userId, isRevoked: false },
      });

      // 2. Отметить все токены как revoked (кроме текущего, если указан)
      let revokedCount = 0;
      for (const token of tokens) {
        // Если передан currentTokenId и это текущий токен, пропускаем
        if (currentTokenId && token.id === currentTokenId) {
          continue;
        }
        
        token.isRevoked = true;
        await this.refreshTokensRepo.save(token);
        revokedCount++;
      }

      // 3. Залогировать событие в audit
      const ipAddress = req?.ip || req?.socket?.remoteAddress || 'system';
      const userAgent = req?.get('User-Agent') || 'system';
      
      await this.auditService.log({
        userId,
        service: 'security',
        action: 'logout-all-devices',
        resource: 'sessions',
        requestData: {
          totalTokens: tokens.length,
          revokedCount,
          keepCurrentSession: !!currentTokenId,
        },
        statusCode: 200,
        ipAddress,
        userAgent,
        userRoles: [],
        userPermissions: [],
      });

      return {
        success: true,
        message: 'Successfully logged out from all devices',
        revokedCount,
      };
    } catch (error) {
      console.error('Error in logoutFromAllDevices:', error);
      throw error;
    }
  }
}

