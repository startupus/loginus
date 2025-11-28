import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { PluginType } from '../entities/plugin.entity';

/**
 * DTO для частичного обновления плагина.
 */
export class UpdatePluginDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @IsOptional()
  @IsEnum(PluginType)
  type?: PluginType;

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

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

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


