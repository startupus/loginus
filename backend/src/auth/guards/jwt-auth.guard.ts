import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    
    // ✅ ЛОГИРОВАНИЕ для плагинов
    if (request.path && request.path.startsWith('/api/v2/plugins')) {
      console.log('🔍 [JwtAuthGuard] ⚡ PLUGIN REQUEST:', request.method, request.path);
      console.log('🔍 [JwtAuthGuard] Has auth header:', !!authHeader);
      console.log('🔍 [JwtAuthGuard] Token length:', token.length);
    }
    
    console.log('🔍 [JwtAuthGuard] canActivate called');
    console.log('🔍 [JwtAuthGuard] Request path:', request.path);
    console.log('🔍 [JwtAuthGuard] Has auth header:', !!authHeader);
    console.log('🔍 [JwtAuthGuard] Token length:', token.length);
    console.log('🔍 [JwtAuthGuard] Token preview:', token.substring(0, 50) + '...');
    
    // Проверяем декоратор @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('🔍 [JwtAuthGuard] isPublic check result:', isPublic);
    console.log('🔍 [JwtAuthGuard] Handler:', context.getHandler()?.name);
    console.log('🔍 [JwtAuthGuard] Class:', context.getClass()?.name);

    if (isPublic) {
      console.log('✅ [JwtAuthGuard] Public endpoint, but still trying to extract user if token exists');
      // Для публичных эндпоинтов все равно пытаемся извлечь пользователя, если токен есть
      // Это нужно для семейных групп, где токен обязателен, но эндпоинт публичный
      if (token && token.length > 0) {
        console.log(`🔍 [JwtAuthGuard] Token found for public endpoint, attempting validation...`);
        try {
          // Пытаемся валидировать токен, но не выбрасываем ошибку, если не получилось
          // ВАЖНО: Используем логику, которая гарантирует установку request.user
          const result = super.canActivate(context);
          if (result instanceof Promise) {
            return result.then(
              (val) => {
                console.log('✅ [JwtAuthGuard] Token validated successfully for public endpoint');
                console.log('🔍 [JwtAuthGuard] request.user after validation:', request.user ? 'exists' : 'null');
                if (request.user) {
                  console.log('🔍 [JwtAuthGuard] request.user.userId:', request.user.userId || request.user.id || request.user.sub);
                }
                // Убеждаемся, что request.user установлен
                if (!request.user && val) {
                  console.log('⚠️ [JwtAuthGuard] request.user not set after validation, but validation succeeded');
                }
                return val;
              },
              (err) => {
                console.log('⚠️ [JwtAuthGuard] Token validation failed for public endpoint, allowing access anyway');
                console.log('🔍 [JwtAuthGuard] request.user after error:', request.user ? 'exists' : 'null');
                return true;
              }
            );
          }
          if (result instanceof Observable) {
            return result.pipe(
              tap(() => {
                console.log('✅ [JwtAuthGuard] Token validated successfully for public endpoint');
                console.log('🔍 [JwtAuthGuard] request.user after validation:', request.user ? 'exists' : 'null');
                if (request.user) {
                  console.log('🔍 [JwtAuthGuard] request.user.userId:', request.user.userId || request.user.id || request.user.sub);
                }
                // Убеждаемся, что request.user установлен
                if (!request.user) {
                  console.log('⚠️ [JwtAuthGuard] request.user not set after validation, but validation succeeded');
                }
              }),
              catchError(() => {
                console.log('⚠️ [JwtAuthGuard] Token validation failed for public endpoint, allowing access anyway');
                console.log('🔍 [JwtAuthGuard] request.user after error:', request.user ? 'exists' : 'null');
                return of(true);
              })
            );
          }
          console.log('🔍 [JwtAuthGuard] request.user after sync validation:', request.user ? 'exists' : 'null');
          return result;
        } catch (error) {
          // Если ошибка, разрешаем доступ (публичный эндпоинт)
          console.log('⚠️ [JwtAuthGuard] Token validation failed for public endpoint, allowing access anyway');
          console.log('🔍 [JwtAuthGuard] request.user after catch error:', request.user ? 'exists' : 'null');
          return true;
        }
      }
      console.log('✅ [JwtAuthGuard] Public endpoint, no token, allowing access');
      return true; // Пропускаем публичные endpoints без токена
    }

    console.log('🔍 [JwtAuthGuard] Protected endpoint, validating JWT...');
    
    // Вызываем родительский метод с обработкой ошибок
    const result = super.canActivate(context);
    
    if (result instanceof Promise) {
      return result.then(
        (val) => {
          console.log('✅ [JwtAuthGuard] JWT validation succeeded');
          return val;
        },
        (err) => {
          console.error('❌ [JwtAuthGuard] JWT validation failed:', err);
          console.error('❌ [JwtAuthGuard] Error message:', err?.message);
          throw err;
        }
      );
    }
    
    if (result instanceof Observable) {
      return result.pipe(
        tap(() => console.log('✅ [JwtAuthGuard] JWT validation succeeded')),
        catchError((err) => {
          console.error('❌ [JwtAuthGuard] JWT validation failed:', err);
          console.error('❌ [JwtAuthGuard] Error message:', err?.message);
          return throwError(() => err);
        })
      );
    }
    
    return result;
  }

  // Переопределяем handleRequest, чтобы гарантировать установку request.user
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // Проверяем, является ли endpoint публичным ПЕРЕД проверкой user
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Если пользователь валидирован, устанавливаем его в request.user
    if (user) {
      console.log('✅ [JwtAuthGuard] handleRequest: Setting request.user for user:', user.userId || user.id || user.sub);
      request.user = user;
      return user;
    }
    
    // Если это публичный эндпоинт, разрешаем доступ без пользователя
    if (isPublic) {
      console.log('✅ [JwtAuthGuard] handleRequest: Public endpoint, allowing access without user');
      request.user = null;
      return null; // Разрешаем доступ, но user остается null
    }
    
    // Для защищенных эндпоинтов выбрасываем ошибку
    if (err) {
      console.error('❌ [JwtAuthGuard] handleRequest: Error:', err);
      throw err;
    }
    
    if (!user) {
      console.error('❌ [JwtAuthGuard] handleRequest: User not found');
      throw new UnauthorizedException('User not found');
    }
    
    return user;
  }
}
