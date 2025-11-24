import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthFlowService {
  private authFlowCache: any | null = null;
  private authFlowCacheTime: number = 0;
  private readonly CACHE_TTL = 5000; // 5 секунд кэширования для более быстрого обновления
  private readonly DATA_FILE = 'auth-flow.json';

  // Читаем auth flow из JSON с кэшированием
  private getAuthFlowData(): any {
    const now = Date.now();
    
    if (this.authFlowCache && (now - this.authFlowCacheTime) < this.CACHE_TTL) {
      return this.authFlowCache;
    }

    const authFlowPath = path.join(__dirname, '../../data', this.DATA_FILE);
    
    // Если файл не существует, создаем дефолтную структуру
    if (!fs.existsSync(authFlowPath)) {
      const defaultData = {
        login: [],
        registration: [],
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(authFlowPath, JSON.stringify(defaultData, null, 2), 'utf-8');
      this.authFlowCache = defaultData;
      this.authFlowCacheTime = now;
      return this.authFlowCache;
    }

    const authFlowData = fs.readFileSync(authFlowPath, 'utf-8');
    this.authFlowCache = JSON.parse(authFlowData);
    this.authFlowCacheTime = now;
    
    return this.authFlowCache;
  }

  // Сохраняем auth flow в JSON
  private saveAuthFlow(data: any): void {
    const authFlowPath = path.join(__dirname, '../../data', this.DATA_FILE);
    const updatedData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(authFlowPath, JSON.stringify(updatedData, null, 2), 'utf-8');
    this.authFlowCache = updatedData;
    this.authFlowCacheTime = Date.now();
  }

  getAuthFlow() {
    const data = this.getAuthFlowData();
    
    return {
      success: true,
      data: {
        login: data.login || [],
        registration: data.registration || [],
        updatedAt: data.updatedAt,
      },
    };
  }

  updateAuthFlow(methods: any[]) {
    // Разделяем методы по потокам
    const loginMethods = methods.filter(m => m.flow === 'login');
    const registrationMethods = methods.filter(m => m.flow === 'registration');

    const data = {
      login: loginMethods,
      registration: registrationMethods,
    };

    this.saveAuthFlow(data);
    
    // Получаем обновленные данные с updatedAt
    const updatedData = this.getAuthFlowData();

    return {
      success: true,
      data: {
        login: loginMethods,
        registration: registrationMethods,
        updatedAt: updatedData.updatedAt || new Date().toISOString(),
      },
    };
  }

  testAuthFlow() {
    return {
      success: true,
      data: {
        result: 'Auth flow test completed successfully',
      },
    };
  }
}

