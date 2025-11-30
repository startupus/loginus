import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';

export interface AuthFlowStep {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  isPrimary: boolean;
  order: number;
  type: string;
  stepType?: 'field' | 'auth-method';
  fieldType?: string;
}

export interface AuthFlowConfig {
  login: AuthFlowStep[];
  registration: AuthFlowStep[];
  factors: AuthFlowStep[];
  updatedAt?: string;
}

export interface StepValidationResult {
  success: boolean;
  nextStep?: AuthFlowStep;
  completed: boolean;
  message?: string;
  requiresVerification?: boolean;
  verificationMethod?: string;
}

@Injectable()
export class AuthFlowService {
  private readonly logger = new Logger(AuthFlowService.name);

  constructor(private settingsService: SettingsService) {}

  /**
   * Получить конфигурацию Auth Flow
   */
  async getAuthFlowConfig(): Promise<AuthFlowConfig> {
    try {
      const configRaw = await this.settingsService.getSetting('auth_flow_config');
      
      if (!configRaw) {
        return this.getDefaultConfig();
      }

      const config = JSON.parse(configRaw);
      return config;
    } catch (error) {
      this.logger.error('Error loading auth flow config:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Получить шаги входа
   */
  async getLoginFlow(): Promise<AuthFlowStep[]> {
    const config = await this.getAuthFlowConfig();
    return (config.login || []).filter(step => step.enabled !== false).sort((a, b) => a.order - b.order);
  }

  /**
   * Получить шаги регистрации
   */
  async getRegistrationFlow(): Promise<AuthFlowStep[]> {
    const config = await this.getAuthFlowConfig();
    return (config.registration || []).filter(step => step.enabled !== false).sort((a, b) => a.order - b.order);
  }

  /**
   * Получить обязательные факторы авторизации (2FA/MFA)
   */
  async getFactorsFlow(): Promise<AuthFlowStep[]> {
    const config = await this.getAuthFlowConfig();
    return (config.factors || []).filter(step => step.enabled !== false).sort((a, b) => a.order - b.order);
  }

  /**
   * Получить следующий шаг после текущего
   */
  async getNextStep(currentStepId: string, flow: 'login' | 'registration'): Promise<AuthFlowStep | null> {
    const steps = flow === 'login' ? await this.getLoginFlow() : await this.getRegistrationFlow();
    const currentIndex = steps.findIndex(step => step.id === currentStepId);
    
    if (currentIndex === -1 || currentIndex === steps.length - 1) {
      return null; // Текущий шаг не найден или это последний шаг
    }
    
    return steps[currentIndex + 1];
  }

  /**
   * Проверить, является ли шаг последним в потоке
   */
  async isLastStep(stepId: string, flow: 'login' | 'registration'): Promise<boolean> {
    const steps = flow === 'login' ? await this.getLoginFlow() : await this.getRegistrationFlow();
    const step = steps.find(s => s.id === stepId);
    
    if (!step) return false;
    
    return step.order === Math.max(...steps.map(s => s.order));
  }

  /**
   * Валидация данных для конкретного шага
   */
  async validateStepData(stepId: string, data: any): Promise<{ valid: boolean; error?: string }> {
    switch (stepId) {
      case 'phone-email':
        // Проверка email или телефона (поддерживаем оба формата: login и contact+type)
        const contact = data.contact || data.login;
        const contactType = data.type || (contact?.includes('@') ? 'email' : 'phone');
        
        if (!contact) {
          return { valid: false, error: 'Contact (email or phone) is required' };
        }
        
        // Базовая валидация формата
        if (contactType === 'email') {
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
          if (!isEmail) {
            return { valid: false, error: 'Invalid email format' };
          }
        } else {
          const isPhone = /^[\d\s\+\-\(\)]+$/.test(contact);
          if (!isPhone) {
            return { valid: false, error: 'Invalid phone format' };
          }
        }
        return { valid: true };

      case 'password':
        // Проверка пароля
        if (!data.password) {
          return { valid: false, error: 'Password is required' };
        }
        if (data.password.length < 6) {
          return { valid: false, error: 'Password must be at least 6 characters' };
        }
        return { valid: true };

      case 'sms-code':
      case 'email-code':
      case 'sms': // Поддержка старого формата
      case 'email': // Поддержка старого формата
        // Проверка кода
        if (!data.code) {
          return { valid: false, error: 'Verification code is required' };
        }
        if (!/^\d{4,6}$/.test(data.code)) {
          return { valid: false, error: 'Invalid code format' };
        }
        return { valid: true };

      // Регистрационные поля
      case 'name':
      case 'first-name':
        console.log('🔍 [validateStepData] first-name validation, data:', JSON.stringify(data, null, 2));
        if (!data.firstName) {
          return { valid: false, error: 'First name is required' };
        }
        return { valid: true };

      case 'surname':
      case 'last-name':
        if (!data.lastName) {
          return { valid: false, error: 'Last name is required' };
        }
        return { valid: true };

      case 'inn':
        if (!data.inn) {
          return { valid: false, error: 'INN is required' };
        }
        // Базовая валидация ИНН (10 или 12 цифр)
        if (!/^\d{10}$|^\d{12}$/.test(data.inn)) {
          return { valid: false, error: 'INN must be 10 or 12 digits' };
        }
        return { valid: true };

      case 'birthdate':
        if (!data.birthdate) {
          return { valid: false, error: 'Birthdate is required' };
        }
        return { valid: true };

      case 'gender':
        if (!data.gender) {
          return { valid: false, error: 'Gender is required' };
        }
        return { valid: true };

      default:
        // Для OAuth методов (github, telegram, etc.) валидация не требуется на уровне данных
        return { valid: true };
    }
  }

  /**
   * Получить primary шаг для потока
   */
  async getPrimaryStep(flow: 'login' | 'registration'): Promise<AuthFlowStep | null> {
    const steps = flow === 'login' ? await this.getLoginFlow() : await this.getRegistrationFlow();
    return steps.find(step => step.isPrimary) || (steps.length > 0 ? steps[0] : null);
  }

  /**
   * Проверить, требуется ли верификация для шага
   */
  requiresVerification(stepId: string): boolean {
    return ['sms-code', 'email-code', 'sms', 'email', 'telegram', 'github'].includes(stepId);
  }

  /**
   * Получить дефолтную конфигурацию
   */
  private getDefaultConfig(): AuthFlowConfig {
    return {
      login: [
        {
          id: 'phone-email',
          name: 'Phone or Email',
          icon: 'mail',
          enabled: true,
          isPrimary: true,
          order: 1,
          type: 'primary',
        },
        {
          id: 'password',
          name: 'Password',
          icon: 'lock',
          enabled: true,
          isPrimary: false,
          order: 2,
          type: 'alternative',
        },
        {
          id: 'email-code',
          name: 'Email Code',
          icon: 'mail',
          enabled: true,
          isPrimary: false,
          order: 3,
          type: 'verification',
          stepType: 'auth-method',
        },
      ],
      registration: [
        {
          id: 'phone-email',
          name: 'Phone or Email',
          icon: 'mail',
          enabled: true,
          isPrimary: true,
          order: 1,
          type: 'primary',
        },
        {
          id: 'password',
          name: 'Password',
          icon: 'lock',
          enabled: true,
          isPrimary: false,
          order: 2,
          type: 'alternative',
        },
        {
          id: 'name',
          name: 'First Name',
          icon: 'user',
          enabled: true,
          isPrimary: false,
          order: 3,
          type: 'registration-field',
          stepType: 'field',
          fieldType: 'name',
        },
      ],
      factors: [],
    };
  }

  /**
   * Проверить, содержит ли поток определенный шаг
   */
  async hasStep(stepId: string, flow: 'login' | 'registration'): Promise<boolean> {
    const steps = flow === 'login' ? await this.getLoginFlow() : await this.getRegistrationFlow();
    return steps.some(step => step.id === stepId);
  }

  /**
   * Получить все обязательные поля для регистрации
   */
  async getRequiredRegistrationFields(): Promise<string[]> {
    const steps = await this.getRegistrationFlow();
    return steps
      .filter(step => step.stepType === 'field' && step.enabled)
      .map(step => step.fieldType || step.id);
  }
}

