import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DataPreloaderService } from '../data/data-preloader.service';

@Injectable()
export class ProfileService {
  // Кэш данных профиля в памяти для быстрого доступа
  private profileCache: any | null = null;
  private profileCacheTime: number = 0;
  private readonly CACHE_TTL = 60000; // 1 минута кэширования

  constructor(private readonly preloader: DataPreloaderService) {}

  private getProfileData() {
    const now = Date.now();
    
    // Если кэш валиден, возвращаем его
    if (this.profileCache && (now - this.profileCacheTime) < this.CACHE_TTL) {
      return this.profileCache;
    }

    // Сначала пытаемся взять предзагруженные данные
    const preloaded = this.preloader.getPreloadedData<any>('profile.json');
    if (preloaded) {
      this.profileCache = preloaded;
      this.profileCacheTime = now;
      return this.profileCache;
    }

    // Fallback: читаем файл и обновляем кэш (первый запрос без предзагрузки)
    const profilePath = path.join(__dirname, '../../data/profile.json');
    const profileData = fs.readFileSync(profilePath, 'utf-8');
    this.profileCache = JSON.parse(profileData);
    this.profileCacheTime = now;
    
    return this.profileCache;
  }

  getProfile() {
    const profileData = this.getProfileData();
    return {
      success: true,
      data: profileData.user,
    };
  }

  getDashboard() {
    const profileData = this.getProfileData();
    return {
      success: true,
      data: {
        user: profileData.user,
        dashboard: profileData.dashboard,
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

