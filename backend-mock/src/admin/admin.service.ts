import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DataPreloaderService } from '../data/data-preloader.service';

@Injectable()
export class AdminService {
  private usersCache: any[] | null = null;
  private companiesCache: any[] | null = null;
  private usersCacheTime: number = 0;
  private companiesCacheTime: number = 0;
  private readonly CACHE_TTL = 60000; // 1 минута кэширования

  constructor(private readonly preloader: DataPreloaderService) {}

  // Читаем пользователей из JSON с кэшированием
  private getUsersData(): any[] {
    const now = Date.now();
    
    if (this.usersCache && (now - this.usersCacheTime) < this.CACHE_TTL) {
      return this.usersCache;
    }

    const preloaded = this.preloader.getPreloadedData<any[]>('users.json');
    if (preloaded) {
      this.usersCache = preloaded;
      this.usersCacheTime = now;
      return this.usersCache;
    }

    const usersPath = path.join(__dirname, '../../data/users.json');
    const usersData = fs.readFileSync(usersPath, 'utf-8');
    this.usersCache = JSON.parse(usersData);
    this.usersCacheTime = now;
    
    return this.usersCache;
  }

  // Сохраняем пользователей в JSON
  private saveUsers(users: any[]): void {
    const usersPath = path.join(__dirname, '../../data/users.json');
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    this.usersCache = users;
    this.usersCacheTime = Date.now();
  }

  // Читаем компании из JSON с кэшированием
  private getCompaniesData(): any[] {
    const now = Date.now();
    
    if (this.companiesCache && (now - this.companiesCacheTime) < this.CACHE_TTL) {
      return this.companiesCache;
    }

    const preloaded = this.preloader.getPreloadedData<any[]>('companies.json');
    if (preloaded) {
      this.companiesCache = preloaded;
      this.companiesCacheTime = now;
      return this.companiesCache;
    }

    const companiesPath = path.join(__dirname, '../../data/companies.json');
    const companiesData = fs.readFileSync(companiesPath, 'utf-8');
    this.companiesCache = JSON.parse(companiesData);
    this.companiesCacheTime = now;
    
    return this.companiesCache;
  }

  // Сохраняем компании в JSON
  private saveCompanies(companies: any[]): void {
    const companiesPath = path.join(__dirname, '../../data/companies.json');
    fs.writeFileSync(companiesPath, JSON.stringify(companies, null, 2), 'utf-8');
    this.companiesCache = companies;
    this.companiesCacheTime = Date.now();
  }

  getStats() {
    const users = this.getUsersData();
    const activeUsers = users.filter(u => u.status === 'active').length;
    const newUsersToday = users.filter(u => {
      const createdAt = new Date(u.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return createdAt >= today;
    }).length;

    return {
      success: true,
      data: {
        totalUsers: users.length,
        activeUsers,
        newUsersToday,
        totalSessions: 3400,
      },
    };
  }

  getUsers(query?: {
    page?: number;
    limit?: number;
    companyId?: string;
    role?: string;
    status?: string;
    search?: string;
  }) {
    let users = this.getUsersData();
    const page = query?.page || 1;
    const limit = query?.limit || 20;

    // Фильтрация по компании
    if (query?.companyId) {
      users = users.filter(u => u.companyId === query.companyId);
    }

    // Фильтрация по роли
    if (query?.role) {
      users = users.filter(u => u.role === query.role);
    }

    // Фильтрация по статусу
    if (query?.status) {
      users = users.filter(u => u.status === query.status);
    }

    // Поиск
    if (query?.search) {
      const searchLower = query.search.toLowerCase();
      users = users.filter(u => 
        u.displayName?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        u.phone?.includes(searchLower)
      );
    }

    const total = users.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = users.slice(start, end);

    return {
      success: true,
      data: {
        users: paginatedUsers,
        total,
        page,
        limit,
      },
    };
  }

  getUserById(id: string) {
    const users = this.getUsersData();
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      data: user,
    };
  }

  createUser(userData: any) {
    const users = this.getUsersData();
    const newUser = {
      id: String(users.length + 1),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    this.saveUsers(users);

    return {
      success: true,
      data: newUser,
    };
  }

  updateUser(id: string, userData: any) {
    const users = this.getUsersData();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    
    this.saveUsers(users);

    return {
      success: true,
      data: users[userIndex],
    };
  }

  deleteUser(id: string) {
    const users = this.getUsersData();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Деактивируем вместо удаления
    users[userIndex].status = 'inactive';
    users[userIndex].updatedAt = new Date().toISOString();
    
    this.saveUsers(users);

    return {
      success: true,
      data: users[userIndex],
    };
  }

  getUsersByCompany(companyId: string) {
    const users = this.getUsersData();
    const companyUsers = users.filter(u => u.companyId === companyId);

    return {
      success: true,
      data: {
        users: companyUsers,
        total: companyUsers.length,
      },
    };
  }

  getCompanies() {
    const companies = this.getCompaniesData();
    return {
      success: true,
      data: {
        companies,
        total: companies.length,
      },
    };
  }

  getCompanyById(id: string) {
    const companies = this.getCompaniesData();
    const company = companies.find(c => c.id === id);
    
    if (!company) {
      return {
        success: false,
        error: 'Company not found',
      };
    }

    return {
      success: true,
      data: company,
    };
  }

  createCompany(companyData: any) {
    const companies = this.getCompaniesData();
    const newCompany = {
      id: String(companies.length + 1),
      ...companyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    companies.push(newCompany);
    this.saveCompanies(companies);

    return {
      success: true,
      data: newCompany,
    };
  }

  updateCompany(id: string, companyData: any) {
    const companies = this.getCompaniesData();
    const companyIndex = companies.findIndex(c => c.id === id);
    
    if (companyIndex === -1) {
      return {
        success: false,
        error: 'Company not found',
      };
    }

    companies[companyIndex] = {
      ...companies[companyIndex],
      ...companyData,
      updatedAt: new Date().toISOString(),
    };
    
    this.saveCompanies(companies);

    return {
      success: true,
      data: companies[companyIndex],
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

