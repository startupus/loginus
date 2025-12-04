import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamRole } from './entities/team-role.entity';
import { TeamMembership } from './entities/team-membership.entity';
import { User } from '../users/entities/user.entity';
import { OrganizationMembership } from '../organizations/entities/organization-membership.entity';
import { Role } from '../rbac/entities/role.entity';
import { RoleHierarchyService } from '../rbac/role-hierarchy.service';
import { InvitationsService } from '../auth/micro-modules/invitations/invitations.service';
import { InvitationType } from '../auth/micro-modules/invitations/entities/invitation.entity';
import * as crypto from 'crypto';

export interface CreateTeamDto {
  name: string;
  description?: string;
  organizationId?: string | null; // Опционально для команд без организации
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
}

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepo: Repository<Team>,
    @InjectRepository(TeamRole)
    private teamRoleRepo: Repository<TeamRole>,
    @InjectRepository(TeamMembership)
    private teamMembershipRepo: Repository<TeamMembership>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(OrganizationMembership)
    private orgMembershipRepo: Repository<OrganizationMembership>,
    @InjectRepository(Role)
    private rolesRepo: Repository<Role>,
    private roleHierarchyService: RoleHierarchyService,
    @Inject(forwardRef(() => InvitationsService))
    private invitationsService: InvitationsService,
  ) {}

  /**
   * Создать команду
   */
  async createTeam(
    dto: CreateTeamDto,
    creatorId: string,
  ): Promise<Team> {
    // Если указана организация, проверяем права на создание команды в организации
    if (dto.organizationId) {
      const canCreate = await this.roleHierarchyService.canCreateTeams(creatorId, dto.organizationId);
      if (!canCreate) {
        throw new ForbiddenException('Недостаточно прав для создания команды в этой организации');
      }
    }
    // Для команд без организации (organizationId === null) права не проверяем - любой пользователь может создать

    // Создаем команду
    const team = this.teamRepo.create({
      ...dto,
      organizationId: dto.organizationId || null, // Явно устанавливаем null, если не указано
      createdBy: creatorId,
    });

    const savedTeam = await this.teamRepo.save(team);
    console.log(`✅ Team created: ${savedTeam.name} (ID: ${savedTeam.id})${dto.organizationId ? ` in organization ${dto.organizationId}` : ' (without organization)'}`);

    // Создаем системные роли для команды
    // ✅ ВАЖНО: createSystemRoles уже синхронизирует права из глобальной таблицы roles
    console.log(`🔧 About to create system roles for team: ${savedTeam.id}`);
    await this.createSystemRoles(savedTeam.id);
    console.log(`✅ System roles creation completed for team: ${savedTeam.id}`);

    // Добавляем создателя в команду как admin напрямую (без проверки прав, так как он создатель)
    try {
      // Для команд без организации используем admin, для команд с организацией - owner
      const roleName = savedTeam.organizationId ? 'owner' : 'admin';
      
      // Находим роль
      const creatorRole = await this.teamRoleRepo.findOne({
        where: { name: roleName, teamId: savedTeam.id },
      });

      if (creatorRole) {
        // Создаем членство в новой системе (team_memberships)
        const membership = this.teamMembershipRepo.create({
          userId: creatorId,
          teamId: savedTeam.id,
          roleId: creatorRole.id,
          invitedBy: creatorId,
        });

        await this.teamMembershipRepo.save(membership);

        // Добавляем в старую систему (user_teams)
        await this.teamRepo
          .createQueryBuilder()
          .insert()
          .into('user_teams')
          .values({
            user_id: creatorId,
            team_id: savedTeam.id,
          })
          .orIgnore() // Игнорируем, если уже существует
          .execute();

        console.log(`✅ Added creator ${creatorId} as ${roleName} to team ${savedTeam.id}`);
      } else {
        console.warn(`⚠️ ${roleName} role not found for team ${savedTeam.id}, creator not added automatically`);
      }
    } catch (error) {
      console.error(`❌ Error adding creator to team:`, error);
      // Не прерываем создание команды, если не удалось добавить создателя
    }

    // Команда создается с создателем - остальные участники добавляются через приглашения
    console.log(`✅ Team created with creator as admin: ${savedTeam.name} (ID: ${savedTeam.id})`);

    return savedTeam;
  }

  /**
   * Создать системные роли для команды
   * Берет права из системных глобальных ролей
   */
  private async createSystemRoles(teamId: string): Promise<void> {
    console.log(`🔧 Creating system roles for team: ${teamId}`);
    
    // Проверяем, есть ли у команды организация
    const team = await this.teamRepo.findOne({ where: { id: teamId } });
    const isTeamWithoutOrg = !team?.organizationId;
    
    // Для команд без организации создаем только admin и viewer
    if (isTeamWithoutOrg) {
      console.log(`🔧 Creating simplified roles (admin, viewer) for team without organization: ${teamId}`);
      
      // Получаем глобальные роли admin и viewer
      const adminRole = await this.rolesRepo.findOne({
        where: { name: 'admin', isGlobal: true },
        relations: ['permissions'],
      });
      
      const viewerRole = await this.rolesRepo.findOne({
        where: { name: 'viewer', isGlobal: true },
        relations: ['permissions'],
      });
      
      const rolesToCreate = [adminRole, viewerRole].filter(Boolean);
      
      for (const globalRole of rolesToCreate) {
        if (!globalRole) continue;
        
        try {
          // Проверяем, нет ли уже такой роли
          const existingRole = await this.teamRoleRepo.findOne({
            where: { teamId, name: globalRole.name },
          });

          if (existingRole) {
            const newPermissionNames = globalRole.permissions?.map(p => p.name) || [];
            existingRole.permissions = newPermissionNames;
            existingRole.isSystem = globalRole.isSystem || false;
            existingRole.level = globalRole.name === 'admin' ? 80 : 20;
            await this.teamRoleRepo.save(existingRole);
            console.log(`✅ [TeamsService] Synced role ${globalRole.name} in team ${teamId}`);
            continue;
          }

          const teamRole = this.teamRoleRepo.create({
            name: globalRole.name,
            description: globalRole.description || '',
            teamId,
            permissions: globalRole.permissions?.map(p => p.name) || [],
            level: globalRole.name === 'admin' ? 80 : 20,
            isSystem: globalRole.isSystem || false,
          });

          const savedRole = await this.teamRoleRepo.save(teamRole);
          console.log(`✅ [TeamsService] Created role ${savedRole.name} (level ${savedRole.level}) for team ${teamId}`);
        } catch (error) {
          console.error(`❌ [TeamsService] Error creating role ${globalRole.name}:`, error);
          throw error;
        }
      }
      
      console.log(`✅ [TeamsService] Created ${rolesToCreate.length} roles for team without organization ${teamId}`);
      return;
    }
    
    // Для команд с организацией - копируем все глобальные роли
    const globalRoles = await this.rolesRepo.find({
      where: { isGlobal: true },
      relations: ['permissions'],
    });

    console.log(`🔧 Found ${globalRoles.length} global system roles to copy`);

    // Уровни ролей
    const ROLE_LEVELS: Record<string, number> = {
      super_admin: 100,
      admin: 80,
      manager: 60,
      editor: 40,
      viewer: 20,
    };

    // Копируем каждую роль в team_roles
    for (const globalRole of globalRoles) {
      try {
        // Проверяем, нет ли уже такой роли
        const existingRole = await this.teamRoleRepo.findOne({
          where: { teamId, name: globalRole.name },
        });

        if (existingRole) {
          // ✅ ВАЖНО: ВСЕГДА обновляем права из глобальной таблицы roles
          // Это гарантирует синхронизацию при создании новой команды
          const newPermissionNames = globalRole.permissions?.map(p => p.name) || [];
          const currentPermissionNames = existingRole.permissions || [];
          
          // Сравниваем массивы прав (приводим к отсортированным массивам для сравнения)
          const currentSorted = [...currentPermissionNames].sort().join(',');
          const newSorted = [...newPermissionNames].sort().join(',');
          
          // Обновляем права, даже если они кажутся одинаковыми (для гарантии синхронизации)
          existingRole.permissions = newPermissionNames;
          existingRole.isSystem = globalRole.isSystem || false;
          existingRole.level = ROLE_LEVELS[globalRole.name] || 0; // Обновляем level
          
          if (currentSorted !== newSorted) {
            console.log(`🔄 [TeamsService] Updating permissions for role ${globalRole.name} in team ${teamId}`);
            await this.teamRoleRepo.save(existingRole);
            console.log(`✅ [TeamsService] Updated role ${globalRole.name} permissions in team ${teamId}`);
          } else {
            // Сохраняем даже если права одинаковые, чтобы обновить level и isSystem
            await this.teamRoleRepo.save(existingRole);
            console.log(`✅ [TeamsService] Synced role ${globalRole.name} in team ${teamId} (permissions unchanged)`);
          }
          continue;
        }

        const teamRole = this.teamRoleRepo.create({
          name: globalRole.name,
          description: globalRole.description || '',
          teamId,
          permissions: globalRole.permissions?.map(p => p.name) || [],
          level: ROLE_LEVELS[globalRole.name] || 0,
          isSystem: globalRole.isSystem || false,
        });

        const savedRole = await this.teamRoleRepo.save(teamRole);
        console.log(`✅ [TeamsService] Copied role ${savedRole.name} (level ${savedRole.level}) for team ${teamId}`);
      } catch (error) {
        console.error(`❌ [TeamsService] Error copying role ${globalRole.name}:`, error);
        throw error;
      }
    }
    
    console.log(`✅ [TeamsService] All ${globalRoles.length} global roles copied to team ${teamId}`);
  }

  /**
   * Добавить участника в команду
   */
  async addMemberToTeam(
    teamId: string,
    userId: string,
    roleName: string,
    invitedBy: string,
  ): Promise<TeamMembership> {
    // Получаем команду для проверки организации
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ['organization'],
    });

    if (!team) {
      throw new NotFoundException('Команда не найдена');
    }

    // Проверяем права на приглашение
    const canInvite = await this.roleHierarchyService.canInviteUsers(invitedBy, { 
      organizationId: team.organizationId || undefined,
      teamId,
    });
    if (!canInvite) {
      throw new ForbiddenException('Недостаточно прав для приглашения в команду');
    }

    // Находим роль
    const role = await this.teamRoleRepo.findOne({
      where: { name: roleName, teamId },
    });

    if (!role) {
      throw new NotFoundException(`Роль ${roleName} не найдена в команде`);
    }

    // Проверяем, не является ли пользователь уже участником
    const existingMembership = await this.teamMembershipRepo.findOne({
      where: { userId, teamId },
    });

    if (existingMembership) {
      throw new ForbiddenException('Пользователь уже является участником команды');
    }

    // Создаем членство в новой системе (team_memberships)
    const membership = this.teamMembershipRepo.create({
      userId,
      teamId,
      roleId: role.id,
      invitedBy,
    });

    const savedMembership = await this.teamMembershipRepo.save(membership);

    // Добавляем в старую систему (user_teams)
    await this.teamRepo
      .createQueryBuilder()
      .insert()
      .into('user_teams')
      .values({
        user_id: userId,
        team_id: teamId,
      })
      .execute();

    console.log(`✅ Added user ${userId} to team ${teamId} in both systems`);
    
    return savedMembership;
  }

  /**
   * Изменить роль участника команды
   */
  async changeMemberRole(
    teamId: string,
    userId: string,
    newRoleName: string,
    changedBy: string,
  ): Promise<TeamMembership | null> {
    // Получаем команду для проверки организации
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ['organization'],
    });

    if (!team) {
      throw new NotFoundException('Команда не найдена');
    }

    // Проверяем права на изменение роли
    const canManage = await this.roleHierarchyService.canManageUser(changedBy, userId, { 
      organizationId: team.organizationId || undefined,
      teamId,
    });
    if (!canManage) {
      throw new ForbiddenException('Недостаточно прав для изменения роли');
    }

    // Находим новую роль
    const newRole = await this.teamRoleRepo.findOne({
      where: { name: newRoleName, teamId },
    });

    if (!newRole) {
      throw new NotFoundException(`Роль ${newRoleName} не найдена в команде`);
    }

    // Обновляем роль
    await this.teamMembershipRepo.update(
      { userId, teamId },
      { roleId: newRole.id },
    );

    const membership = await this.teamMembershipRepo.findOne({
      where: { userId, teamId },
      relations: ['role', 'user'],
    });
    return membership || null;
  }

  /**
   * Удалить участника из команды
   */
  async removeMemberFromTeam(
    teamId: string,
    userId: string,
    removedBy: string,
  ): Promise<void> {
    // Получаем команду для проверки организации
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ['organization'],
    });

    if (!team) {
      throw new NotFoundException('Команда не найдена');
    }

    // Проверяем права на удаление
    const canManage = await this.roleHierarchyService.canManageUser(removedBy, userId, { 
      organizationId: team.organizationId || undefined,
      teamId,
    });
    if (!canManage) {
      throw new ForbiddenException('Недостаточно прав для удаления участника');
    }

    // Удаляем из новой системы (team_memberships)
    await this.teamMembershipRepo.delete({ userId, teamId });
    
    // Удаляем из старой системы (user_teams)
    await this.teamRepo
      .createQueryBuilder()
      .delete()
      .from('user_teams')
      .where('user_id = :userId', { userId })
      .andWhere('team_id = :teamId', { teamId })
      .execute();
    
    console.log(`✅ Removed user ${userId} from team ${teamId} from both systems`);
  }

  /**
   * Получить участников команды
   * Показывает только явных участников команды + членов организации (если они не были явно удалены из команды)
   */
  async getTeamMembers(teamId: string): Promise<{ team: any; members: any[] }> {
    // Загружаем команду с организацией и создателем
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ['organization', 'creator'],
    });

    if (!team) {
      return { team: null, members: [] };
    }

    // 1. Получаем явных участников команды
    const teamMemberships = await this.teamMembershipRepo.find({
      where: { teamId },
      relations: ['user', 'role', 'inviter'],
    });

    // 2. Получаем всех членов организации
    const orgMemberships = team.organizationId ? await this.orgMembershipRepo.find({
      where: { organizationId: team.organizationId },
      relations: ['user', 'role'],
    }) : [];

    // 3. ✅ ИСПРАВЛЕНИЕ: Показываем только явных членов команды
    // Члены организации НЕ добавляются автоматически, если они не являются явными членами команды
    const membersMap = new Map();

    // Добавляем только явных членов команды
    teamMemberships.forEach(membership => {
      membersMap.set(membership.user.id, {
        id: membership.user.id,
        email: membership.user.email,
        firstName: membership.user.firstName,
        lastName: membership.user.lastName,
        role: membership.role,
        joinedAt: membership.createdAt,
        inviter: membership.inviter,
        source: 'team'
      });
    });

    return {
      team: team,
      members: Array.from(membersMap.values())
    };
  }

  /**
   * Получить команды пользователя
   */
  async getUserTeams(userId: string): Promise<Team[]> {
    const memberships = await this.teamMembershipRepo.find({
      where: { userId },
      relations: ['team', 'role'],
    });

    return memberships.map(membership => membership.team);
  }

  /**
   * Получить все доступные команды пользователя
   * Включает команды, где пользователь является участником или создателем организации
   */
  async getAccessibleTeams(userId: string): Promise<Array<Team & { myRole?: string }>> {
    try {
      // 1. Получаем команды, где пользователь является участником
      const userMemberships = await this.teamMembershipRepo.find({
        where: { userId },
        relations: ['team', 'team.organization', 'role'],
      });

      const userTeamsWithRole = userMemberships.map(membership => ({
        ...membership.team,
        myRole: membership.role?.name || 'member',
      }));

      // 2. Получаем команды, где пользователь является создателем (createdBy)
      const createdTeams = await this.teamRepo.find({
        where: { createdBy: userId },
        relations: ['organization'],
      });

      // Для созданных команд проверяем, есть ли уже членство
      const createdTeamsWithRole = await Promise.all(
        createdTeams.map(async (team) => {
          // Проверяем, есть ли уже членство
          const membership = await this.teamMembershipRepo.findOne({
            where: { userId, teamId: team.id },
            relations: ['role'],
          });
          
          if (membership) {
            return {
              ...team,
              myRole: membership.role?.name || 'owner',
            };
          }
          
          // Если членства нет, но пользователь создатель
          // Для команд без организации - admin, для команд с организацией - owner
          return {
            ...team,
            myRole: team.organizationId ? 'owner' : 'admin',
          };
        })
      );

      // 3. Получаем команды организаций, где пользователь является создателем или участником
      // Используем более простой подход через OrganizationMembership
      const orgMemberships = await this.teamRepo
        .createQueryBuilder('team')
        .leftJoin('team.organization', 'organization')
        .leftJoin('organization.memberships', 'orgMembership')
        .where('orgMembership.userId = :userId', { userId })
        .getMany();

      // Для команд организаций определяем роль пользователя
      const orgTeamsWithRole = await Promise.all(
        orgMemberships.map(async (team) => {
          // Проверяем членство в команде
          const membership = await this.teamMembershipRepo.findOne({
            where: { userId, teamId: team.id },
            relations: ['role'],
          });
          
          if (membership) {
            return {
              ...team,
              myRole: membership.role?.name || 'member',
            };
          }
          
          // Если нет членства, но команда в организации пользователя - роль по умолчанию
          return {
            ...team,
            myRole: 'member',
          };
        })
      );

      // Объединяем команды и убираем дубликаты
      const allTeams = [...userTeamsWithRole, ...createdTeamsWithRole, ...orgTeamsWithRole];
      const uniqueTeams = allTeams.filter((team, index, self) => 
        index === self.findIndex(t => t.id === team.id)
      );

      console.log(`[getAccessibleTeams] Found ${uniqueTeams.length} teams for user ${userId} (${userTeamsWithRole.length} from memberships, ${createdTeamsWithRole.length} created by user)`);

      return uniqueTeams;
    } catch (error) {
      console.error('Error in getAccessibleTeams:', error);
      // В случае ошибки возвращаем только команды пользователя
      const userTeams = await this.getUserTeams(userId);
      return userTeams.map(team => ({ ...team, myRole: 'member' }));
    }
  }

  /**
   * Получить команду по ID
   */
  async getTeamById(id: string): Promise<Team> {
    const team = await this.teamRepo.findOne({
      where: { id },
      relations: ['organization', 'memberships', 'memberships.user', 'memberships.role'],
    });

    if (!team) {
      throw new NotFoundException('Команда не найдена');
    }

    return team;
  }

  /**
   * Обновить команду
   */
  async updateTeam(
    id: string,
    dto: UpdateTeamDto,
    updatedBy: string,
  ): Promise<Team> {
    const team = await this.getTeamById(id);

    // Проверяем права на редактирование
    const userRole = await this.roleHierarchyService.getUserEffectiveRole(updatedBy, { 
      organizationId: team.organizationId || undefined,
      teamId: id,
    });
    if (!['super_admin', 'admin', 'manager'].includes(userRole.role)) {
      throw new ForbiddenException('Недостаточно прав для редактирования команды');
    }

    await this.teamRepo.update(id, dto);
    return this.getTeamById(id);
  }

  /**
   * Генерировать многоразовую ссылку приглашения в команду
   */
  async generateTeamInviteLink(
    teamId: string,
    roleName: string,
    createdBy: string,
  ): Promise<{ invitationLink: string; token: string }> {
    const team = await this.getTeamById(teamId);

    // Проверяем права на приглашение
    const canInvite = await this.roleHierarchyService.canInviteUsers(createdBy, { 
      organizationId: team.organizationId || undefined,
      teamId,
    });
    if (!canInvite) {
      throw new ForbiddenException('Недостаточно прав для создания приглашения');
    }

    // Для команд без организации - убеждаемся, что роли admin и viewer существуют
    if (!team.organizationId) {
      await this.ensureSimplifiedRoles(teamId);
    }

    // Находим роль
    let role = await this.teamRoleRepo.findOne({
      where: { name: roleName, teamId },
    });

    // Если роль не найдена и это команда без организации, пытаемся создать недостающую роль
    if (!role && !team.organizationId) {
      console.log(`⚠️ Role ${roleName} not found for team ${teamId} without organization, attempting to create...`);
      await this.ensureSimplifiedRoles(teamId);
      role = await this.teamRoleRepo.findOne({
        where: { name: roleName, teamId },
      });
    }

    if (!role) {
      throw new NotFoundException(`Роль ${roleName} не найдена в команде`);
    }

    // Создаем приглашение в базе данных через InvitationsService
    // Это создаст многоразовую ссылку приглашения
    // Используем специальный email формат для многоразовых ссылок
    const reusableEmail = `reusable-${teamId}@teams.local`;
    const invitation = await this.invitationsService.createInvitation(createdBy, {
      type: InvitationType.TEAM,
      teamId: teamId,
      roleId: role.id,
      roleName: roleName,
      email: reusableEmail, // Специальный email для многоразовой ссылки
      expiresInDays: 365, // Срок действия 1 год
    });

    // Формируем ссылку с токеном из созданного приглашения
    const frontendUrl = process.env.FRONTEND_URL || 'https://loginus.startapus.com';
    const invitationLink = `${frontendUrl}/invitation?token=${invitation.token}&type=team&teamId=${teamId}&roleName=${roleName}`;

    return {
      invitationLink,
      token: invitation.token,
    };
  }

  /**
   * Убедиться, что для команды без организации созданы роли admin и viewer
   */
  private async ensureSimplifiedRoles(teamId: string): Promise<void> {
    const team = await this.teamRepo.findOne({ where: { id: teamId } });
    if (!team || team.organizationId) {
      return; // Только для команд без организации
    }

    // Получаем глобальные роли admin и viewer
    const adminRole = await this.rolesRepo.findOne({
      where: { name: 'admin', isGlobal: true },
      relations: ['permissions'],
    });
    
    const viewerRole = await this.rolesRepo.findOne({
      where: { name: 'viewer', isGlobal: true },
      relations: ['permissions'],
    });

    if (!adminRole || !viewerRole) {
      console.error(`❌ Global roles admin or viewer not found`);
      return;
    }

    // Создаем или обновляем роль admin
    let teamAdminRole = await this.teamRoleRepo.findOne({
      where: { name: 'admin', teamId },
    });

    if (!teamAdminRole) {
      teamAdminRole = this.teamRoleRepo.create({
        name: 'admin',
        description: adminRole.description || '',
        teamId,
        permissions: adminRole.permissions?.map(p => p.name) || [],
        level: 80,
        isSystem: true,
      });
      await this.teamRoleRepo.save(teamAdminRole);
      console.log(`✅ Created admin role for team ${teamId}`);
    }

    // Создаем или обновляем роль viewer
    let teamViewerRole = await this.teamRoleRepo.findOne({
      where: { name: 'viewer', teamId },
    });

    if (!teamViewerRole) {
      teamViewerRole = this.teamRoleRepo.create({
        name: 'viewer',
        description: viewerRole.description || '',
        teamId,
        permissions: viewerRole.permissions?.map(p => p.name) || [],
        level: 20,
        isSystem: true,
      });
      await this.teamRoleRepo.save(teamViewerRole);
      console.log(`✅ Created viewer role for team ${teamId}`);
    }
  }

  /**
   * Удалить команду
   */
  async deleteTeam(id: string, deletedBy: string): Promise<void> {
    try {
      console.log(`🗑️ Attempting to delete team ${id} by user ${deletedBy}`);
      const team = await this.getTeamById(id);
      console.log(`📋 Team found: ${team.name}, organizationId: ${team.organizationId}, createdBy: ${team.createdBy}`);

      // Для команд без организации - проверяем, является ли пользователь создателем или admin
      if (!team.organizationId) {
        if (team.createdBy !== deletedBy) {
          // Также проверяем, является ли пользователь admin через членство
          const membership = await this.teamMembershipRepo.findOne({
            where: { userId: deletedBy, teamId: id },
            relations: ['role'],
          });
          
          const isAdmin = membership?.role?.name === 'admin';
          console.log(`🔍 Membership check: isAdmin=${isAdmin}, createdBy=${team.createdBy}, deletedBy=${deletedBy}`);
          
          if (!isAdmin && team.createdBy !== deletedBy) {
            throw new ForbiddenException('Недостаточно прав для удаления команды');
          }
        }
      } else {
        // Для команд с организацией - проверяем права через roleHierarchyService
        const userRole = await this.roleHierarchyService.getUserEffectiveRole(deletedBy, { 
          organizationId: team.organizationId,
          teamId: id,
        });
        if (!['super_admin', 'admin', 'manager'].includes(userRole.role)) {
          throw new ForbiddenException('Недостаточно прав для удаления команды');
        }
      }

      console.log(`✅ Permission check passed, proceeding with deletion...`);

      // Удаляем все связанные записи перед удалением команды
      // 1. Удаляем членство пользователей в команде (новая система)
      console.log(`🗑️ Deleting team memberships...`);
      await this.teamMembershipRepo.delete({ teamId: id });

      // 2. Удаляем роли команды
      console.log(`🗑️ Deleting team roles...`);
      await this.teamRoleRepo.delete({ teamId: id });

      // 3. Удаляем записи из старой системы ManyToMany (user_teams)
      console.log(`🗑️ Deleting user_teams relations...`);
      try {
        await this.teamRepo.query('DELETE FROM user_teams WHERE team_id = $1', [id]);
      } catch (error) {
        console.warn(`⚠️ Error deleting from user_teams (might not exist):`, error);
        // Продолжаем, даже если таблица не существует
      }

      // 4. Удаляем саму команду
      console.log(`🗑️ Deleting team...`);
      await this.teamRepo.delete(id);
      
      console.log(`✅ Team ${id} deleted successfully by user ${deletedBy}`);
    } catch (error) {
      console.error(`❌ Error deleting team ${id}:`, error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Ошибка при удалении команды: ${error.message}`);
    }
  }

  /**
   * Получить команды организации
   */
  async getOrganizationTeams(organizationId: string): Promise<Team[]> {
    return this.teamRepo.find({
      where: { organizationId },
      relations: ['memberships', 'memberships.user', 'memberships.role'],
    });
  }

  /**
   * Получить роли команды
   */
  async getTeamRolesFromRolesTable(teamId: string, userId: string): Promise<any[]> {
    // Возвращаем роли из таблицы team_roles для команды
    const allRoles = await this.teamRoleRepo.find({
      where: { teamId },
      order: { level: 'DESC' },
    });

    // Фильтруем роли по уровню пользователя
    return this.roleHierarchyService.getAvailableRolesForInvite(
      userId,
      { teamId },
      allRoles,
    ) as Promise<any[]>;
  }

  async getTeamRoles(teamId: string, userId?: string): Promise<TeamRole[]> {
    const allRoles = await this.teamRoleRepo.find({
      where: { teamId },
      order: { level: 'DESC' }, // Сортируем по уровню (от высшего к низшему)
    });

    // Если userId не указан, возвращаем все роли
    if (!userId) {
      return allRoles;
    }

    // Если userId указан, фильтруем роли по уровню пользователя
    return this.roleHierarchyService.getAvailableRolesForInvite(
      userId,
      { teamId },
      allRoles,
    ) as Promise<TeamRole[]>;
  }
}