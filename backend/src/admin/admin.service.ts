import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { UserAdapter } from '../common/adapters/user.adapter';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly usersService: UsersService,
  ) {}

  async getStats(userRole: string, companyId?: string) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (userRole === 'company_admin' && companyId) {
      // Company admin видит только статистику своей компании
      queryBuilder
        .leftJoin('user.organizations', 'org')
        .where('org.id = :companyId', { companyId });
    }

    const [totalUsers, activeUsers, newUsersToday] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('user.isActive = :isActive', { isActive: true }).getCount(),
      queryBuilder
        .clone()
        .andWhere('user.createdAt >= :today', {
          today: new Date(new Date().setHours(0, 0, 0, 0)),
        })
        .getCount(),
    ]);

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      totalSessions: 0, // TODO: Реализовать подсчет сессий
    };
  }

  async getUsers(params: {
    page: number;
    limit: number;
    companyId?: string;
    role?: string;
    status?: string;
    search?: string;
    userRole: string;
  }) {
    const { page, limit, companyId, role, status, search, userRole } = params;
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Фильтрация по роли пользователя
    if (userRole === 'company_admin' && companyId) {
      queryBuilder
        .leftJoin('user.organizations', 'org')
        .where('org.id = :companyId', { companyId });
    }

    if (role) {
      // TODO: Фильтрация по роли через UserRoleAssignment
    }

    if (status) {
      queryBuilder.andWhere('user.isActive = :isActive', {
        isActive: status === 'active',
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const skip = (page - 1) * limit;
    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return {
      users: users.map(user => UserAdapter.toFrontendFormat(user)),
      total,
      page,
      limit,
    };
  }

  async getUserById(id: string, userRole: string, companyId?: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['organizations'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверка прав доступа
    if (userRole === 'company_admin' && companyId) {
      const hasAccess = user.organizations?.some(org => org.id === companyId);
      if (!hasAccess) {
        throw new ForbiddenException('Access denied');
      }
    }

    return UserAdapter.toFrontendFormat(user);
  }

  async createUser(userData: any, userRole: string, companyId?: string) {
    if (userRole === 'company_admin' && companyId) {
      userData.companyId = companyId;
    }

    // Убираем status из данных - статус будет вычисляться автоматически на основе онлайн/офлайн
    const { status, ...userDataWithoutStatus } = userData;
    
    // isActive будет установлен по умолчанию (true) из entity
    const user = this.userRepository.create(userDataWithoutStatus);
    const savedUser = await this.userRepository.save(user) as unknown as User;

    return UserAdapter.toFrontendFormat(savedUser);
  }

  async updateUser(id: string, userData: any, userRole: string, companyId?: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['organizations'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверка прав доступа
    if (userRole === 'company_admin' && companyId) {
      const hasAccess = user.organizations?.some(org => org.id === companyId);
      if (!hasAccess) {
        throw new ForbiddenException('Access denied');
      }
    }

    // Убираем status из данных - статус будет вычисляться автоматически на основе онлайн/офлайн
    const { status, ...userDataWithoutStatus } = userData;
    
    Object.assign(user, userDataWithoutStatus);
    const updatedUser = await this.userRepository.save(user);

    return UserAdapter.toFrontendFormat(updatedUser);
  }

  async deleteUser(id: string, userRole: string, companyId?: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['organizations'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверка прав доступа
    if (userRole === 'company_admin' && companyId) {
      const hasAccess = user.organizations?.some(org => org.id === companyId);
      if (!hasAccess) {
        throw new ForbiddenException('Access denied');
      }
      // Company admin может только деактивировать пользователя
      user.isActive = false;
      const updatedUser = await this.userRepository.save(user);
      return UserAdapter.toFrontendFormat(updatedUser);
    }

    // Super admin может полностью удалить пользователя
    if (userRole === 'super_admin') {
      await this.usersService.delete(id);
      return { deleted: true };
    }

    // Для других ролей - деактивация
    user.isActive = false;
    const updatedUser = await this.userRepository.save(user);
    return UserAdapter.toFrontendFormat(updatedUser);
  }

  async getCompanies(params: { page: number; limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [organizations, total] = await this.organizationRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      companies: organizations.map(org => ({
        id: org.id,
        name: org.name,
        domain: org.settings?.domain || '',
        settings: org.settings || {},
        subscriptionPlan: org.settings?.subscriptionPlan || 'basic',
        createdAt: org.createdAt.toISOString(),
        updatedAt: org.updatedAt.toISOString(),
      })),
      total,
    };
  }

  async getCompanyById(id: string) {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Company not found');
    }

    return {
      id: organization.id,
      name: organization.name,
      domain: organization.settings?.domain || '',
      settings: organization.settings || {},
      subscriptionPlan: organization.settings?.subscriptionPlan || 'basic',
      createdAt: organization.createdAt.toISOString(),
      updatedAt: organization.updatedAt.toISOString(),
    };
  }

  async getUsersByCompany(companyId: string, userRole: string, currentUserCompanyId?: string) {
    if (userRole === 'company_admin' && currentUserCompanyId !== companyId) {
      throw new ForbiddenException('Access denied');
    }

    const organization = await this.organizationRepository.findOne({
      where: { id: companyId },
      relations: ['members'],
    });

    if (!organization) {
      throw new NotFoundException('Company not found');
    }

    return {
      users: organization.members?.map(user => UserAdapter.toFrontendFormat(user)) || [],
      total: organization.members?.length || 0,
    };
  }

  async createCompany(companyData: any) {
    const organization = this.organizationRepository.create({
      name: companyData.name,
      settings: {
        ...companyData.settings,
        domain: companyData.domain,
        subscriptionPlan: companyData.subscriptionPlan || 'basic',
      },
    });

    const savedOrg = await this.organizationRepository.save(organization);

    return {
      id: savedOrg.id,
      name: savedOrg.name,
      domain: savedOrg.settings?.domain || '',
      settings: savedOrg.settings || {},
      subscriptionPlan: savedOrg.settings?.subscriptionPlan || 'basic',
      createdAt: savedOrg.createdAt.toISOString(),
      updatedAt: savedOrg.updatedAt.toISOString(),
    };
  }

  async updateCompany(id: string, companyData: any) {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Company not found');
    }

    organization.name = companyData.name || organization.name;
    organization.settings = {
      ...organization.settings,
      ...companyData.settings,
      domain: companyData.domain || organization.settings?.domain,
      subscriptionPlan: companyData.subscriptionPlan || organization.settings?.subscriptionPlan,
    };

    const updatedOrg = await this.organizationRepository.save(organization);

    return {
      id: updatedOrg.id,
      name: updatedOrg.name,
      domain: updatedOrg.settings?.domain || '',
      settings: updatedOrg.settings || {},
      subscriptionPlan: updatedOrg.settings?.subscriptionPlan || 'basic',
      createdAt: updatedOrg.createdAt.toISOString(),
      updatedAt: updatedOrg.updatedAt.toISOString(),
    };
  }
}

