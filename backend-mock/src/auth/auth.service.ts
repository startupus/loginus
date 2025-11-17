import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
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
}

