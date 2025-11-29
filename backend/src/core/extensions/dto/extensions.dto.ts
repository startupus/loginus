import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';

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
  ])
  extensionType: string;

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

