import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getStats() {
    return {
      success: true,
      data: {
        totalUsers: 1250,
        activeUsers: 890,
        newUsersToday: 45,
        totalSessions: 3400,
      },
    };
  }

  getUsers() {
    return {
      success: true,
      data: {
        users: [
          {
            id: '1',
            name: 'Дмитрий Лукьян',
            email: 'lukyan.dmitriy@ya.ru',
            phone: '+79091503444',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1250,
        page: 1,
        limit: 20,
      },
    };
  }

  getAuditLogs() {
    return {
      success: true,
      data: {
        logs: [
          {
            id: '1',
            userId: '1',
            action: 'login',
            ip: '192.168.1.100',
            timestamp: new Date().toISOString(),
          },
        ],
        total: 5420,
        page: 1,
        limit: 50,
      },
    };
  }
}

