import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Интерсептор для преобразования ответов API в формат, ожидаемый фронтендом
 * Обертывает все ответы в { success: true, data: {...} }
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Если ответ уже имеет структуру { success, data }, возвращаем как есть
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Если ответ null или undefined, возвращаем структурированный ответ
        if (data === null || data === undefined) {
          return {
            success: true,
            data: null,
          };
        }

        // Обертываем ответ в стандартную структуру
        return {
          success: true,
          data,
        };
      }),
    );
  }
}

