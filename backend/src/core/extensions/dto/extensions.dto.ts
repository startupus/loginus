import { IsString, IsOptional, IsEnum, IsObject, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadExtensionDto {
  @IsString()
  name: string;

  @IsString()
  @IsEnum([
    'widget',
    'menu_item',
    'payment',
    'auth',
    'content',
    'system',
    'user',
    'api',
    'plugin', // Добавляем 'plugin' для обратной совместимости
  ])
  extensionType: string;

  @IsOptional()
  @Transform(({ value }) => {
    // Преобразуем строку в boolean для FormData
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return Boolean(value);
  })
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class UpdateExtensionConfigDto {
  @IsObject()
  config: Record<string, any>;
}

export class LinkPluginToMenuDto {
  @IsString()
  menuItemId: string;

  @IsString()
  pluginId: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class AddWidgetToProfileDto {
  @IsString()
  widgetId: string;

  @IsString()
  position: number;

  @IsOptional()
  width?: number;

  @IsOptional()
  height?: number;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

