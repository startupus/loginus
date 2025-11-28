import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthFlowService {
  private readonly logger = new Logger(AuthFlowService.name);
  private authFlowCache: any | null = null;
  private authFlowCacheTime: number = 0;
  private readonly CACHE_TTL = 5000; // 5 секунд кэширования для более быстрого обновления
  private readonly DATA_FILE = 'auth-flow.json';

  constructor() {
    this.logger.log('[AuthFlowService] Initializing...');
  }

  // Читаем auth flow из JSON с кэшированием
  private getAuthFlowData(): any {
    const now = Date.now();
    
    if (this.authFlowCache && (now - this.authFlowCacheTime) < this.CACHE_TTL) {
      return this.authFlowCache;
    }

    // Проверяем несколько возможных путей (для разных окружений: исходный код, скомпилированный, Docker)
    const possiblePaths = [
      path.join(__dirname, '../../../data', this.DATA_FILE), // Для скомпилированного кода в dist/
      path.join(__dirname, '../../data', this.DATA_FILE), // Для исходного кода
      '/app/backend-mock/data/auth-flow.json', // Абсолютный путь в Docker
    ];

    let authFlowPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        authFlowPath = possiblePath;
        this.logger.log(`[AuthFlowService] Found auth-flow.json at: ${authFlowPath}`);
        break;
      }
    }

    // Если файл не найден ни по одному пути, используем первый как fallback для создания
    if (!authFlowPath) {
      authFlowPath = possiblePaths[possiblePaths.length - 1]; // Используем абсолютный путь в Docker
      const defaultData = {
        login: [],
        registration: [],
        factors: [],
        updatedAt: new Date().toISOString(),
      };
      try {
        // Создаем директорию, если её нет
        const dir = path.dirname(authFlowPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(authFlowPath, JSON.stringify(defaultData, null, 2), 'utf-8');
        this.authFlowCache = defaultData;
        this.authFlowCacheTime = now;
        return this.authFlowCache;
      } catch (error) {
        console.error(`❌ [AuthFlowService] Error creating auth-flow.json at ${authFlowPath}:`, error);
        // Возвращаем дефолтные данные даже при ошибке создания файла
        this.authFlowCache = defaultData;
        this.authFlowCacheTime = now;
        return this.authFlowCache;
      }
    }

    try {
      const authFlowData = fs.readFileSync(authFlowPath, 'utf-8');
      this.authFlowCache = JSON.parse(authFlowData);
      this.authFlowCacheTime = now;
      return this.authFlowCache;
    } catch (error) {
      console.error(`❌ [AuthFlowService] Error reading auth-flow.json from ${authFlowPath}:`, error);
      // Возвращаем дефолтные данные при ошибке чтения
      const defaultData = {
        login: [],
        registration: [],
        factors: [],
        updatedAt: new Date().toISOString(),
      };
      this.authFlowCache = defaultData;
      this.authFlowCacheTime = now;
      return this.authFlowCache;
    }
  }

  // Сохраняем auth flow в JSON
  private saveAuthFlow(data: any): void {
    // Используем тот же подход для определения пути
    const possiblePaths = [
      path.join(__dirname, '../../../data', this.DATA_FILE),
      path.join(__dirname, '../../data', this.DATA_FILE),
      '/app/backend-mock/data/auth-flow.json',
    ];

    let authFlowPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        authFlowPath = possiblePath;
        break;
      }
    }

    // Если файл не найден, используем последний путь (Docker)
    if (!authFlowPath) {
      authFlowPath = possiblePaths[possiblePaths.length - 1];
      // Создаем директорию, если её нет
      const dir = path.dirname(authFlowPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    const updatedData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    try {
      fs.writeFileSync(authFlowPath, JSON.stringify(updatedData, null, 2), 'utf-8');
      this.authFlowCache = updatedData;
      this.authFlowCacheTime = Date.now();
    } catch (error) {
      console.error(`❌ [AuthFlowService] Error saving auth-flow.json to ${authFlowPath}:`, error);
      throw error;
    }
  }

  getAuthFlow() {
    try {
      this.logger.log('[AuthFlowService] getAuthFlow called');
      const data = this.getAuthFlowData();
      this.logger.log('[AuthFlowService] getAuthFlowData returned:', JSON.stringify(data).substring(0, 200));
      
      const result = {
        success: true,
        data: {
          login: data.login || [],
          registration: data.registration || [],
          factors: data.factors || [],
          updatedAt: data.updatedAt,
        },
      };
      this.logger.log('[AuthFlowService] getAuthFlow returning result');
      return result;
    } catch (error: any) {
      this.logger.error('❌ [AuthFlowService] Error in getAuthFlow:', error);
      this.logger.error('❌ [AuthFlowService] Error stack:', error?.stack);
      // Возвращаем дефолтную конфигурацию при ошибке
      return {
        success: true,
        data: {
          login: [],
          registration: [],
          factors: [],
          updatedAt: new Date().toISOString(),
        },
      };
    }
  }

  updateAuthFlow(methods: any[]) {
    // Разделяем методы по потокам
    const loginMethods = methods.filter(m => m.flow === 'login');
    const registrationMethods = methods.filter(m => m.flow === 'registration');
    const factorsMethods = methods.filter(m => m.flow === 'factors');

    const data = {
      login: loginMethods,
      registration: registrationMethods,
      factors: factorsMethods,
    };

    this.saveAuthFlow(data);
    
    // Получаем обновленные данные с updatedAt
    const updatedData = this.getAuthFlowData();

    return {
      success: true,
      data: {
        login: loginMethods,
        registration: registrationMethods,
        factors: factorsMethods,
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

