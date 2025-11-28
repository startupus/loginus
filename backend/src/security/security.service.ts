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
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Проверяем старый пароль
    if (!user.email) {
      throw new Error('User email is required');
    }
    try {
      await this.authService.validateUser(user.email, oldPassword);
    } catch (error) {
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
}

