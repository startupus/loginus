import { IsObject, IsOptional, IsString } from 'class-validator';

/**
 * DTO для запуска embedded web_app-плагина.
 * Содержит контекст, который пойдёт в initData (JWT).
 */
export class LaunchPluginDto {
  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  /**
   * Локация в приложении (например, 'sidebar-main' или путь).
   */
  @IsOptional()
  @IsString()
  location?: string;

  /**
   * Дополнительный произвольный контекст, который можно будет прочитать в плагине.
   */
  @IsOptional()
  @IsObject()
  extra?: Record<string, any>;
}


