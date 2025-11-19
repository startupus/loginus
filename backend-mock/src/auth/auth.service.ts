import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// Хранилище сессий для кодов (в реальности это будет в БД или Redis)
const sessions: Map<string, { code: string; expiresAt: number; contact: string; type: 'phone' | 'email' }> = new Map();

@Injectable()
export class AuthService {
  // Кэш пользователей в памяти для быстрого доступа
  private usersCache: any[] | null = null;
  private usersCacheTime: number = 0;
  private readonly CACHE_TTL = 60000; // 1 минута кэширования

  // Читаем пользователей из JSON с кэшированием
  private getUsers() {
    const now = Date.now();
    
    // Если кэш валиден, возвращаем его
    if (this.usersCache && (now - this.usersCacheTime) < this.CACHE_TTL) {
      return this.usersCache;
    }

    // Иначе читаем файл и обновляем кэш
    const usersPath = path.join(__dirname, '../../data/users.json');
    const usersData = fs.readFileSync(usersPath, 'utf-8');
    this.usersCache = JSON.parse(usersData);
    this.usersCacheTime = now;
    
    return this.usersCache;
  }

  login(loginDto: { login: string; password: string }) {
    // Mock login - в реальности здесь будет проверка в БД
    return {
      success: true,
      data: {
        user: {
          id: '1',
          name: 'Дмитрий Лукьян',
          email: 'lukyan.dmitriy@ya.ru',
          phone: '+79091503444',
          avatar: null,
        },
        tokens: {
          accessToken: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 3600,
        },
      },
    };
  }

  register(registerDto: { phone: string; email?: string; password: string }) {
    // Mock register
    return {
      success: true,
      data: {
        user: {
          id: '2',
          phone: registerDto.phone,
          email: registerDto.email || null,
        },
        tokens: {
          accessToken: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 3600,
        },
      },
    };
  }

  refresh(refreshDto: { refreshToken: string }) {
    // Mock refresh
    return {
      success: true,
      data: {
        accessToken: 'mock_new_access_token_' + Date.now(),
        refreshToken: 'mock_new_refresh_token_' + Date.now(),
        expiresIn: 3600,
      },
    };
  }

  logout() {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * Проверка существования аккаунта по телефону или email
   */
  checkAccount(contact: string, type: 'phone' | 'email') {
    const users = this.getUsers();
    
    // Нормализуем контакт для поиска
    const normalizedContact = type === 'phone' 
      ? contact.replace(/[^\d+]/g, '')
      : contact.toLowerCase().trim();

    // Ищем пользователя
    const user = users.find((u: any) => {
      if (type === 'phone') {
        const userPhone = u.phone?.replace(/[^\d+]/g, '');
        return userPhone === normalizedContact;
      } else {
        return u.email?.toLowerCase().trim() === normalizedContact;
      }
    });

    const exists = !!user;
    const methods: Array<'sms' | 'call' | 'telegram'> = exists 
      ? ['sms', 'call'] // В моке всегда доступны SMS и звонок
      : ['sms'];

    return {
      success: true,
      data: {
        exists,
        userId: user?.id,
        methods,
      },
    };
  }

  /**
   * Проверка аккаунта и отправка кода за один запрос (оптимизация)
   */
  checkAndSendCode(contact: string, type: 'phone' | 'email', method: 'sms' | 'call' | 'telegram' = 'sms') {
    // Проверяем существование аккаунта
    const checkResult = this.checkAccount(contact, type);
    const { exists, methods: availableMethods } = checkResult.data;
    
    // Используем переданный метод или первый доступный
    const selectedMethod = method || availableMethods[0] || 'sms';
    
    // Отправляем код
    const sendCodeResult = this.sendCode(contact, type, selectedMethod);
    
    return {
      success: true,
      data: {
        exists,
        methods: availableMethods,
        ...sendCodeResult.data,
      },
    };
  }

  /**
   * Отправка кода подтверждения
   */
  sendCode(contact: string, type: 'phone' | 'email', method: 'sms' | 'call' | 'telegram') {
    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Создаем сессию
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 минут
    
    sessions.set(sessionId, {
      code,
      expiresAt,
      contact,
      type,
    });

    // В реальности здесь будет отправка SMS/email/звонка
    // Для мока просто возвращаем данные

    return {
      success: true,
      data: {
        sessionId,
        expiresIn: 300, // 5 минут в секундах
        canResendIn: 60, // 60 секунд до повторной отправки
        // В dev режиме возвращаем код для тестирования
        ...(process.env.NODE_ENV !== 'production' && { code }),
      },
    };
  }

  /**
   * Проверка кода подтверждения
   */
  verifyCode(sessionId: string, code: string) {
    // Специальный номер для быстрого входа без регистрации
    const QUICK_ACCESS_PHONE = '+79091503444';
    
    // Технический код для dev режима - работает для любых номеров
    // ВАЖНО: Проверяем ДО проверки сессии, чтобы код работал даже без активной сессии
    const DEV_CODE = '123456';
    // Проверяем, что мы НЕ в production (безопасно для dev окружения)
    // Если NODE_ENV не установлен, считаем что это dev режим
    const isDevMode = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';
    
    // Логирование для отладки (только в dev режиме, чтобы не замедлять)
    if (isDevMode) {
      console.log('[AuthService] verifyCode called:', { sessionId, code, isDevMode, NODE_ENV: process.env.NODE_ENV });
    }
    
    // Проверяем специальный номер для быстрого доступа
    let currentSession = sessions.get(sessionId);
    if (currentSession) {
      const normalizedContact = currentSession.contact.replace(/[^\d+]/g, '');
      const normalizedQuickPhone = QUICK_ACCESS_PHONE.replace(/[^\d+]/g, '');
      
      // Если это специальный номер, сразу возвращаем существующего пользователя (любой код работает)
      if (normalizedContact === normalizedQuickPhone) {
        sessions.delete(sessionId);
        
        const checkResult = this.checkAccount(currentSession.contact, currentSession.type);
        const tokens = {
          accessToken: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 3600,
        };

        return {
          success: true,
          data: {
            verified: true,
            token: tokens.accessToken,
            userId: checkResult.data.userId || '1',
            isNewUser: false, // Всегда существующий пользователь
            tokens,
          },
        };
      }
    }
    
    // Проверяем технический код в dev режиме
    // Это позволяет использовать код 123456 для любых номеров, даже без активной сессии
    if (isDevMode && code === DEV_CODE) {
      console.log('[AuthService] DEV_CODE matched, bypassing session check');
      
      // Если сессия найдена, используем её данные
      if (currentSession) {
        sessions.delete(sessionId);
        
        const checkResult = this.checkAccount(currentSession.contact, currentSession.type);
        const isNewUser = !checkResult.data.exists;

        const tokens = {
          accessToken: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 3600,
        };

        return {
          success: true,
          data: {
            verified: true,
            token: tokens.accessToken,
            userId: checkResult.data.userId || (isNewUser ? 'new_user_' + Date.now() : null),
            isNewUser,
            tokens,
          },
        };
      }
      
      // Если сессия не найдена, ищем любую активную сессию
      const sessionsArray = Array.from(sessions.entries());
      const activeSession = sessionsArray.find(([_, s]) => Date.now() <= s.expiresAt);
      
      if (activeSession) {
        const [activeSessionId, activeSessionData] = activeSession;
        sessions.delete(activeSessionId);
        
        const checkResult = this.checkAccount(activeSessionData.contact, activeSessionData.type);
        const isNewUser = !checkResult.data.exists;

        const tokens = {
          accessToken: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 3600,
        };

        return {
          success: true,
          data: {
            verified: true,
            token: tokens.accessToken,
            userId: checkResult.data.userId || (isNewUser ? 'new_user_' + Date.now() : null),
            isNewUser,
            tokens,
          },
        };
      }
      
      // Если нет активных сессий вообще, создаем мок для любого номера
      // Это позволяет использовать код 123456 для любых номеров в dev режиме
      const mockContact = 'mock@dev.local';
      const mockType = 'email';
      
      const checkResult = this.checkAccount(mockContact, mockType);
      const isNewUser = !checkResult.data.exists;

      const tokens = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresIn: 3600,
      };

      return {
        success: true,
        data: {
          verified: true,
          token: tokens.accessToken,
          userId: checkResult.data.userId || (isNewUser ? 'new_user_' + Date.now() : null),
          isNewUser,
          tokens,
        },
      };
    }

    const session = sessions.get(sessionId);

    if (!session) {
      return {
        success: false,
        error: 'SESSION_NOT_FOUND',
        message: 'Сессия не найдена или истекла',
      };
    }

    if (Date.now() > session.expiresAt) {
      sessions.delete(sessionId);
      return {
        success: false,
        error: 'CODE_EXPIRED',
        message: 'Код истёк. Запросите новый',
      };
    }

    if (session.code !== code) {
      return {
        success: false,
        error: 'INVALID_CODE',
        message: 'Неправильный код, попробуйте ещё раз',
      };
    }

    // Код верный, удаляем сессию
    sessions.delete(sessionId);

    // Проверяем, существует ли аккаунт
    const checkResult = this.checkAccount(session.contact, session.type);
    const isNewUser = !checkResult.data.exists;

    // Генерируем токены
    const tokens = {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresIn: 3600,
    };

    return {
      success: true,
      data: {
        verified: true,
        token: tokens.accessToken,
        userId: checkResult.data.userId || (isNewUser ? 'new_user_' + Date.now() : null),
        isNewUser,
        tokens,
      },
    };
  }

  /**
   * WebAuthn Challenge для биометрической авторизации
   */
  webauthnChallenge(userId?: string) {
    // Генерируем challenge
    const challenge = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    return {
      success: true,
      data: {
        challenge,
        rpId: 'localhost', // В продакшене будет домен
        allowCredentials: userId ? [] : undefined, // Если userId известен, можно вернуть список credentials
      },
    };
  }

  /**
   * WebAuthn Verify - проверка биометрической авторизации
   */
  webauthnVerify(credential: any, challenge: string) {
    // В реальности здесь будет проверка credential через WebAuthn API
    // Для мока просто возвращаем успех

    // Проверяем challenge (в реальности он должен совпадать с отправленным)
    if (!challenge) {
      return {
        success: false,
        error: 'INVALID_CHALLENGE',
        message: 'Неверный challenge',
      };
    }

    // Генерируем токены
    const tokens = {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresIn: 3600,
    };

    return {
      success: true,
      data: {
        verified: true,
        token: tokens.accessToken,
        userId: '1', // В реальности из credential
        tokens,
      },
    };
  }
}

