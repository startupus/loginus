import { Injectable } from '@nestjs/common';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class WorkService {
  constructor(private readonly teamsService: TeamsService) {}

  async getGroups(userId: string) {
    // Используем TeamsService для получения групп
    const teams = await this.teamsService.getUserTeams(userId);
    return {
      groups: teams.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
        membersCount: team.members?.length || 0,
      })),
    };
  }

  async createGroup(userId: string, dto: { name: string; description?: string }) {
    // Создаем команду через TeamsService
    // Временно возвращаем мок-данные, так как для создания команды нужна организация
    return {
      id: `group_${Date.now()}`,
      name: dto.name,
      description: dto.description,
      createdAt: new Date().toISOString(),
    };
  }

  async inviteMember(groupId: string, dto: { email: string; role?: 'admin' | 'member' }) {
    // Используем систему приглашений
    // Временно возвращаем мок-данные
    return {
      id: `invite_${Date.now()}`,
      email: dto.email,
      role: dto.role || 'member',
      status: 'pending',
    };
  }

  async getGroupEvents(groupId?: string) {
    // Временно возвращаем пустой массив
    return {
      events: [],
    };
  }
}

