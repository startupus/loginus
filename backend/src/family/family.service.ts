import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { TeamsService } from '../teams/teams.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { InvitationsService } from '../auth/micro-modules/invitations/invitations.service';
import { InvitationType } from '../auth/micro-modules/invitations/entities/invitation.entity';
import { AuthService } from '../auth/auth.service';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { FamilyGroup } from './entities/family-group.entity';
import { UserFamilyGroup, FamilyMemberRole } from './entities/user-family-group.entity';

@Injectable()
export class FamilyService {
  constructor(
    private readonly usersService: UsersService,
    private readonly teamsService: TeamsService,
    private readonly organizationsService: OrganizationsService,
    private readonly invitationsService: InvitationsService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(FamilyGroup)
    private familyGroupRepo: Repository<FamilyGroup>,
    @InjectRepository(UserFamilyGroup)
    private userFamilyGroupRepo: Repository<UserFamilyGroup>,
  ) {}

  async getMembers(userId: string) {
    console.log(`[FamilyService] getMembers called for userId: ${userId}`);
    
    try {
      // Находим семейную группу пользователя
      let userMembership = await this.userFamilyGroupRepo.findOne({
        where: { userId },
        relations: ['familyGroup', 'familyGroup.memberships', 'familyGroup.memberships.user'],
      });

      let familyGroup: FamilyGroup | null = null;

      // ВАЖНО: Логика должна основываться на членстве в группе, а не на создателе
      // Если пользователь не в группе, возвращаем пустой список
      if (!userMembership || !userMembership.familyGroup) {
        console.log(`[FamilyService] User ${userId} has no family group membership, returning empty list`);
        return { 
          members: [] as Array<{ id: string; name: string; email: string; phone: string | null; avatar: string | null; role: 'admin' | 'member' | 'child' | 'pending' }>, 
          isCreator: false,
          familyGroupId: null as any
        };
      }
      
      // Пользователь в группе - используем ее
      familyGroup = userMembership.familyGroup;
      console.log(`[FamilyService] User ${userId} belongs to family group ${familyGroup.id}`);

      // Проверяем, что группа найдена
      if (!familyGroup) {
        console.log(`[FamilyService] Family group not found, returning empty list`);
        return { 
          members: [] as Array<{ id: string; name: string; email: string; phone: string | null; avatar: string | null; role: 'admin' | 'member' | 'child' | 'pending' }>, 
          isCreator: false,
          familyGroupId: null as any
        };
      }

      // Получаем всех членов семейной группы
      const memberships = await this.userFamilyGroupRepo.find({
        where: { familyGroupId: familyGroup.id },
        relations: ['user'],
      });

      console.log(`[FamilyService] Found ${memberships.length} members in family group ${familyGroup.id}`);
      
      // Логируем детали каждого члена
      memberships.forEach((membership, index) => {
        console.log(`[FamilyService] Member ${index + 1}: userId=${membership.userId}, role=${membership.role}, user=${membership.user?.email || 'no user relation'}`);
      });

      // Получаем данные текущего пользователя для отображения "Я"
      const currentUserMembership = memberships.find(m => m.userId === userId);
      const currentUser = currentUserMembership?.user || await this.usersService.findById(userId);
      
      // Преобразуем в нужный формат, включая текущего пользователя с именем "Я"
      const familyMembers: Array<{ id: string; name: string; email: string | null; phone: string | null; avatar: string | null; role: 'admin' | 'member' | 'child' | 'pending' }> = memberships
        .filter(membership => {
          if (!membership.user) {
            console.log(`[FamilyService] Warning: membership ${membership.id} has no user relation`);
            return false;
          }
          return true;
        })
        .map((membership) => {
          const user = membership.user;
          const isCurrentUser = membership.userId === userId;
          const memberData: { id: string; name: string; email: string | null; phone: string | null; avatar: string | null; role: 'admin' | 'member' | 'child' | 'pending' } = {
            id: user.id,
            name: isCurrentUser ? 'Я' : (() => {
              // Приоритет: firstName + lastName > firstName > lastName > понятное имя из email
              if (user.firstName && user.lastName) {
                return `${user.firstName} ${user.lastName}`.trim();
              }
              if (user.firstName) {
                return user.firstName.trim();
              }
              if (user.lastName) {
                return user.lastName.trim();
              }
              // Если нет имени, пытаемся создать понятное имя из email
              if (user.email) {
                const emailPart = user.email.split('@')[0];
                // Если это temp-email (временный) или только число, показываем часть email до @
                if (emailPart.startsWith('temp-')) {
                  // Для temp-email используем часть после temp- или сам email
                  const afterTemp = emailPart.replace(/^temp-/, '');
                  if (afterTemp && !afterTemp.match(/^\d+$/)) {
                    return afterTemp;
                  }
                  // Если после temp- только число, используем email до @
                  return emailPart;
                }
                // Если только число, используем email до @
                if (emailPart.match(/^\d+$/)) {
                  return emailPart;
                }
                // Для обычных email используем часть до @
                return emailPart;
              }
              return 'Пользователь';
            })(),
            email: user.email,
            phone: user.phone || null,
            avatar: user.avatarUrl || null,
            role: (membership.role === FamilyMemberRole.CHILD 
              ? ('child' as const) 
              : membership.role === FamilyMemberRole.ADMIN 
                ? ('admin' as const) 
                : ('member' as const)) as 'admin' | 'member' | 'child' | 'pending',
          };
          console.log(`[FamilyService] Mapped member: ${memberData.name} (${memberData.email})`);
          return memberData;
        });
      
      console.log(`[FamilyService] Returning ${familyMembers.length} family members (including current user as 'Я')`);

      // Получаем pending приглашения для этой семейной группы
      const sentInvitations = await this.invitationsService.getSentInvitations(userId);
      console.log(`[FamilyService] Found ${sentInvitations.length} total sent invitations`);
      
      const familyInvites = sentInvitations.filter((invite) => {
        // Фильтруем только pending приглашения для этой семейной группы
        const matches = invite.status === 'pending' && 
               invite.type === InvitationType.FAMILY_GROUP && 
               invite.familyGroupId === familyGroup.id;
        if (invite.type === InvitationType.FAMILY_GROUP) {
          console.log(`[FamilyService] Invitation ${invite.id}: status=${invite.status}, familyGroupId=${invite.familyGroupId}, matches=${matches}`);
        }
        return matches;
      });
      
      console.log(`[FamilyService] Found ${familyInvites.length} pending family group invitations`);

      const pending: Array<{ id: string; name: string; email: string | null; phone: string | null; avatar: string | null; role: 'admin' | 'member' | 'child' | 'pending' }> = familyInvites.map((invite) => ({
        id: invite.id,
        name: invite.email || (invite.role === 'child' ? 'Ребенок (ожидает принятия)' : 'Участник (ожидает принятия)'),
        email: invite.email,
        phone: null,
        avatar: null,
        role: 'pending' as const,
      }));

      // Проверяем, является ли пользователь создателем группы
      const isCreator = familyGroup.createdBy === userId;
      
      // Возвращаем только реальных участников, без pending invitations
      // Pending invitations не должны отображаться в списке участников
      const result = {
        members: familyMembers as any, // Убираем pending invitations из списка
        isCreator, // Добавляем информацию о том, является ли пользователь создателем
        familyGroupId: familyGroup.id, // Добавляем ID группы для удобства
      };
      
      console.log(`[FamilyService] Returning ${result.members.length} real members (pending invitations excluded), isCreator: ${isCreator}`);
      console.log(`[FamilyService] Result members:`, result.members.map(m => ({ id: m.id, name: m.name, email: m.email, role: m.role })));
      if (pending.length > 0) {
        console.log(`[FamilyService] Note: ${pending.length} pending invitations exist but are not included in the members list`);
      }
      
      return result;
    } catch (error: any) {
      // Если таблицы еще не созданы, возвращаем пустой список
      if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        console.log(`[FamilyService] Tables not created yet, returning empty list`);
        return { 
          members: [] as Array<{ id: string; name: string; email: string; phone: string | null; avatar: string | null; role: 'admin' | 'member' | 'child' | 'pending' }>, 
          isCreator: false 
        };
      }
      throw error;
    }
  }

  async inviteMember(
    userId: string,
    dto: { role: 'member' | 'child' },
  ) {
    console.log(`[FamilyService] inviteMember: User ${userId} creating invitation for ${dto.role}`);

    // Находим семейную группу пользователя
    // ВАЖНО: Пользователь может быть только в одной группе
    // Если он уже в группе, используем ее. Если нет - создаем новую
    let userMembership = await this.userFamilyGroupRepo.findOne({
      where: { userId },
      relations: ['familyGroup'],
    });

    let familyGroup: FamilyGroup;

    if (!userMembership || !userMembership.familyGroup) {
      // Пользователь не в группе - создаем новую семейную группу
      console.log(`[FamilyService] User ${userId} has no family group, creating new one...`);
      const currentUser = await this.usersService.findById(userId);
      if (!currentUser) {
        throw new NotFoundException('Пользователь не найден');
      }

      familyGroup = this.familyGroupRepo.create({
        name: `Семья ${currentUser.email || userId}`,
        createdBy: userId,
      });
      familyGroup = await this.familyGroupRepo.save(familyGroup);

      // Добавляем пользователя в группу как админа
      userMembership = this.userFamilyGroupRepo.create({
        userId,
        familyGroupId: familyGroup.id,
        role: FamilyMemberRole.ADMIN,
        invitedBy: null,
        joinedAt: new Date(),
      });
      await this.userFamilyGroupRepo.save(userMembership);
      console.log(`[FamilyService] Created family group ${familyGroup.id} for user ${userId}`);
    } else {
      // Пользователь уже в группе - используем существующую
      familyGroup = userMembership.familyGroup;
      console.log(`[FamilyService] User ${userId} is already in family group ${familyGroup.id}, using it`);
    }

    // Создаем приглашение для семейной группы
    // ВАЖНО: Для семейных групп не привязываем приглашение к email
    // Кто перешел по ссылке, тот и присоединяется
    const invitationDto: any = {
      email: null, // Не привязываем к email - кто перешел по ссылке, тот и присоединяется
      type: InvitationType.FAMILY_GROUP, // Используем правильный тип приглашения
      roleName: dto.role === 'child' ? 'child' : 'member',
      familyGroupId: familyGroup.id, // Передаем familyGroupId напрямую
    };

    const invitation = await this.invitationsService.createInternalInvitation(
      userId,
      invitationDto,
    );

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://loginus.startapus.com';
    const invitationLink = `${frontendUrl}/invitation?token=${invitation.token}${dto.role === 'child' ? '&relation=child' : ''}`;

    return {
      id: invitation.id,
      email: invitation.email,
      role: dto.role,
      status: invitation.status,
      createdAt: invitation.createdAt,
      token: invitation.token,
      invitationLink,
    };
  }

  async createChildAccount(userId: string, dto: { name: string; birthDate: string }) {
    // Создаем детский аккаунт
    // Временно возвращаем мок-данные
    const [firstName, ...lastNameParts] = dto.name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    return {
      id: `child_${Date.now()}`,
      firstName,
      lastName,
      email: `child_${Date.now()}@family.local`,
      birthDate: dto.birthDate,
      role: 'child',
      createdAt: new Date().toISOString(),
    };
  }

  async deleteFamilyGroup(userId: string) {
    console.log(`[FamilyService] deleteFamilyGroup called for userId: ${userId}`);
    
    // Находим семейную группу пользователя
    const userMembership = await this.userFamilyGroupRepo.findOne({
      where: { userId },
      relations: ['familyGroup'],
    });

    if (!userMembership || !userMembership.familyGroup) {
      throw new NotFoundException('Семейная группа не найдена');
    }

    const familyGroup = userMembership.familyGroup;

    // Проверяем, является ли пользователь создателем группы
    if (familyGroup.createdBy !== userId) {
      throw new ForbiddenException('Только создатель группы может удалить группу');
    }

    // Удаляем группу (каскадное удаление удалит все связанные записи)
    await this.familyGroupRepo.remove(familyGroup);
    console.log(`[FamilyService] Family group ${familyGroup.id} deleted by user ${userId}`);
    
    return { success: true, message: 'Семейная группа удалена' };
  }

  async loginAs(currentUserId: string, memberId: string) {
    console.log(`[FamilyService] loginAs: currentUserId=${currentUserId}, memberId=${memberId}`);
    
    // Получаем текущего пользователя и проверяем его семейную группу
    const familyMembers = await this.getMembers(currentUserId);
    console.log(`[FamilyService] loginAs: found ${familyMembers.members.length} members`);
    console.log(`[FamilyService] loginAs: members:`, familyMembers.members.map((m: any) => ({ id: m.id, name: m.name, role: m.role })));
    
    const member: any = (familyMembers.members as any[]).find((m: any) => m.id === memberId);

    if (!member) {
      console.log(`[FamilyService] loginAs: member not found in family members`);
      throw new NotFoundException('Член семьи не найден');
    }

    console.log(`[FamilyService] loginAs: found member: id=${member.id}, name=${member.name}, role=${member.role}`);
    
    // Проверяем, что это ребенок
    if (member.role !== 'child') {
      console.log(`[FamilyService] loginAs: member role is '${member.role}', expected 'child'`);
      throw new ForbiddenException('Войти можно только под аккаунтом ребенка');
    }

    // Получаем пользователя по ID
    const childUser = await this.usersService.findById(memberId, {
      relations: ['organizations', 'teams', 'userRoleAssignments', 'userRoleAssignments.role'],
    });

    if (!childUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Генерируем токены
    const accessToken = await this.authService.generateAccessToken(childUser);
    const refreshToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // +7 дней

    await this.refreshTokenRepo.save({
      token: refreshToken,
      userId: childUser.id,
      expiresAt,
      isRevoked: false,
    });

    return {
      success: true,
      data: {
        user: {
          id: childUser.id,
          name: member.name,
          email: childUser.email,
          phone: childUser.phone,
          avatar: childUser.avatarUrl || null,
          role: 'user',
          companyId: null,
          permissions: [],
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900, // 15 минут
        },
      },
    };
  }

  async updateMemberAvatar(userId: string, memberId: string, avatarUrl: string) {
    console.log(`[FamilyService] updateMemberAvatar called for userId: ${userId}, memberId: ${memberId}`);
    
    // Проверяем, что пользователь является членом той же семейной группы
    const userMembership = await this.userFamilyGroupRepo.findOne({
      where: { userId },
      relations: ['familyGroup'],
    });

    if (!userMembership) {
      throw new NotFoundException('Вы не являетесь членом семейной группы');
    }

    const memberMembership = await this.userFamilyGroupRepo.findOne({
      where: { userId: memberId },
      relations: ['user'],
    });

    if (!memberMembership) {
      throw new NotFoundException('Участник не найден');
    }

    // Проверяем, что участник в той же группе
    if (memberMembership.familyGroupId !== userMembership.familyGroupId) {
      throw new ForbiddenException('Вы не можете изменить аватар участника из другой группы');
    }

    // Обновляем аватар пользователя через UsersService
    await this.usersService.update(memberId, { avatarUrl });
    console.log(`✅ Avatar updated for member ${memberId}`);

    return { success: true, avatarUrl };
  }
}

