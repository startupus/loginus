import { Injectable } from '@nestjs/common';

@Injectable()
export class FamilyService {
  // Mock data
  private members = [
    {
      id: '1',
      name: 'Анна Петрова',
      email: 'anna@example.com',
      role: 'admin',
      avatar: null,
      joinedAt: '2024-01-01',
    },
    {
      id: '2',
      name: 'Иван Петров',
      email: 'ivan@example.com',
      role: 'member',
      avatar: null,
      joinedAt: '2024-01-15',
    },
  ];

  getMembers() {
    return {
      success: true,
      data: this.members,
    };
  }

  inviteMember(inviteDto: { email: string; role: 'member' | 'child' }) {
    const newMember = {
      id: String(this.members.length + 1),
      email: inviteDto.email,
      role: inviteDto.role,
      name: 'Pending Invitation',
      avatar: null,
      joinedAt: new Date().toISOString(),
    };
    
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
    };
    this.members.push(newChild);
    
    return {
      success: true,
      data: newChild,
    };
  }
}
