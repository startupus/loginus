import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { PluginType } from '../entities/plugin.entity';

/**
 * DTO для создания/регистрации плагина через реальный backend.
 * Покрывает как простой сценарий (просто URL), так и сценарий с manifest.
 */
export class CreatePluginDto {
  @IsString()
  @MaxLength(100)
  slug: string;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @IsEnum(PluginType)
  type: PluginType;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  order?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  scope?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredPermissions?: string[];

  /**
   * Типоспецифичная конфигурация (см. Plugin.config).
   */
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  /**
   * Привязка к меню.
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  menuId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  menuItemId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  menuParentItemId?: string;

  /**
   * Необязательная информация о первой версии (если создаём с manifest).
   */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  version?: string;

  @IsOptional()
  @IsObject()
  manifest?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsUrl({ require_tld: false }, { each: false })
  staticPath?: string;
}


