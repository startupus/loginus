import { Injectable } from '@nestjs/common';

@Injectable()
export class FamilyService {
  // Mock data - преднаполнение данными для тестирования
  private members = [
    {
      id: '1',
      name: 'Дмитрий Лукьян',
      email: 'dmitriy-ldm@yandex.ru',
      role: 'admin',
      avatar: 'https://avatars.mds.yandex.net/get-yapic/61207/GaeuVsWBWIontTCdl4NmEJGF3k-1/islands-200',
      joinedAt: '2024-01-01',
      isOnline: true,
    },
    {
      id: '2',
      name: 'Артемий Л.',
      email: 'temik.lukyan@yandex.ru',
      role: 'member',
      avatar: 'https://avatars.mds.yandex.net/get-yapic/47747/0l-1/islands-200',
      joinedAt: '2024-01-15',
      isOnline: false,
    },
    {
      id: '3',
      name: 'Оксана Л.',
      email: 'lukyan.oxana@yandex.ru',
      role: 'member',
      avatar: 'https://avatars.mds.yandex.net/get-yapic/47747/0f-6/islands-200',
      joinedAt: '2024-02-01',
      isOnline: false,
    },
    {
      id: '4',
      name: 'Настя Лукьян',
      email: 'anastalukyan@yandex.ru',
      role: 'member',
      avatar: 'https://avatars.mds.yandex.net/get-yapic/37154/0d-1/islands-200',
      joinedAt: '2024-02-15',
      isOnline: true,
    },
    {
      id: '5',
      name: 'Аня',
      email: null,
      role: 'child',
      avatar: 'https://avatars.mds.yandex.net/get-yapic/0/0-0/islands-200',
      joinedAt: '2024-03-01',
      isOnline: false,
      age: 8,
    },
  ];

  // Pending invites (приглашения в ожидании)
  private pendingInvites = [
    {
      id: 'pending-1',
      name: 'Ждём ответ',
      email: null,
      role: 'pending' as const,
      avatar: null,
      invitedAt: '2024-03-15',
    },
  ];

  getMembers() {
    // Возвращаем всех участников + pending invites
    return {
      success: true,
      data: {
        members: [...this.members, ...this.pendingInvites],
      },
    };
  }

  inviteMember(inviteDto: { email: string; role: 'member' | 'child' }) {
    const newMember = {
      id: String(this.members.length + 1),
      email: inviteDto.email,
      role: inviteDto.role,
      name: inviteDto.email.split('@')[0], // Используем часть email как имя для демо
      avatar: null,
      joinedAt: new Date().toISOString(),
      isOnline: false,
    };
    
    // Добавляем нового члена в список для отображения
    this.members.push(newMember);
    
    return {
      success: true,
      message: 'Invitation sent successfully',
      data: newMember,
    };
  }

  createChildAccount(childDto: { name: string; birthDate: string }) {
    const newChild = {
      id: String(this.members.length + 1),
      name: childDto.name,
      email: `${childDto.name.toLowerCase().replace(' ', '.')}@family.local`,
      role: 'child',
      age: new Date().getFullYear() - new Date(childDto.birthDate).getFullYear(),
      avatar: null,
      joinedAt: new Date().toISOString(),
      isOnline: false,
    };
    this.members.push(newChild);
    
    return {
      success: true,
      data: newChild,
    };
  }

  loginAs(memberId: string) {
    // Находим члена семьи по ID
    const member = this.members.find(m => m.id === memberId);
    
    if (!member) {
      throw new Error('Family member not found');
    }

    // Генерируем токены для входа под аккаунтом члена семьи
    const tokens = {
      accessToken: `mock_access_token_${memberId}_${Date.now()}`,
      refreshToken: `mock_refresh_token_${memberId}_${Date.now()}`,
      expiresIn: 3600,
    };

    // Возвращаем данные пользователя и токены
    return {
      success: true,
      data: {
        user: {
          id: member.id,
          name: member.name,
          email: member.email || null,
          phone: null,
          avatar: member.avatar || null,
          role: member.role === 'child' ? 'user' : 'user', // Дети тоже имеют роль user
          companyId: null,
          permissions: [],
        },
        tokens,
      },
    };
  }
}
