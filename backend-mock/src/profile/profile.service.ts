import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProfileService {
  private getProfileData() {
    const profilePath = path.join(__dirname, '../../data/profile.json');
    const profileData = fs.readFileSync(profilePath, 'utf-8');
    return JSON.parse(profileData);
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

