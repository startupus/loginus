import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileService {
  getProfile() {
    return {
      success: true,
      data: {
        id: '1',
        firstName: 'Дмитрий',
        lastName: 'Лукьян',
        displayName: 'Дмитрий Лукьян',
        email: 'lukyan.dmitriy@ya.ru',
        phone: '+79091503444',
        birthDate: null,
        gender: 'male',
        city: null,
        timezone: 'Europe/Moscow',
        avatar: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
      },
    };
  }

  updateProfile(updateDto: any) {
    return {
      success: true,
      data: {
        ...this.getProfile().data,
        ...updateDto,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  getSecuritySettings() {
    return {
      success: true,
      data: {
        loginMethod: 'password',
        twoFactorEnabled: false,
        biometricEnabled: false,
        qrCodeEnabled: true,
        smsCodeEnabled: true,
        lastPasswordChange: '2023-10-15T10:30:00Z',
      },
    };
  }

  getSessions() {
    return {
      success: true,
      data: [
        {
          id: '1',
          device: 'iPhone',
          browser: 'Safari',
          ip: '192.168.1.100',
          location: 'Москва, Россия',
          lastActivity: new Date().toISOString(),
          current: true,
        },
      ],
    };
  }
}

