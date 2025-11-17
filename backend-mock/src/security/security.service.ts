import { Injectable } from '@nestjs/common';

@Injectable()
export class SecurityService {
  // Mock data
  private devices = [
    {
      id: '1',
      name: 'MacBook Pro',
      type: 'desktop',
      browser: 'Chrome 120',
      ip: '192.168.1.10',
      location: 'Москва, Россия',
      lastActive: new Date().toISOString(),
      isCurrent: true,
    },
    {
      id: '2',
      name: 'iPhone 14',
      type: 'mobile',
      browser: 'Safari 17',
      ip: '192.168.1.20',
      location: 'Москва, Россия',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isCurrent: false,
    },
  ];

  private activityLog = [
    { id: '1', action: 'login', device: 'MacBook Pro', timestamp: new Date().toISOString(), ip: '192.168.1.10' },
    { id: '2', action: 'password_change', device: 'MacBook Pro', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), ip: '192.168.1.10' },
  ];

  getDevices() {
    return {
      success: true,
      data: this.devices,
    };
  }

  deleteDevice(deviceId: string) {
    this.devices = this.devices.filter((d) => d.id !== deviceId);
    return {
      success: true,
      message: 'Device removed successfully',
    };
  }

  getActivity() {
    return {
      success: true,
      data: this.activityLog,
    };
  }

  changePassword(passwordDto: { oldPassword: string; newPassword: string }) {
    // Mock password change
    const newActivity = {
      id: String(this.activityLog.length + 1),
      action: 'password_change',
      device: 'Current device',
      timestamp: new Date().toISOString(),
      ip: '192.168.1.10',
    };
    this.activityLog.unshift(newActivity);
    
    return {
      success: true,
      message: 'Password changed successfully',
    };
  }
}

