import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * TimingInterceptor — логирует длительность обработки каждого запроса.
 * Позволяет понять, где «горит» время первого запроса.
 */
@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>() as any;
    const method = req?.method || 'UNKNOWN';
    const url = req?.url || 'UNKNOWN';
    const start = process.hrtime.bigint();

    console.log(`[TimingInterceptor] ${method} ${url} - Request received`);

    return next.handle().pipe(
      tap({
        next: () => {
          const end = process.hrtime.bigint();
          const ms = Number(end - start) / 1_000_000;
          console.log(`[TimingInterceptor] ${method} ${url} -> ${ms.toFixed(2)} ms - Success`);
        },
        error: (error) => {
          const end = process.hrtime.bigint();
          const ms = Number(end - start) / 1_000_000;
          console.error(`[TimingInterceptor] ${method} ${url} -> ${ms.toFixed(2)} ms - ERROR:`, error);
          console.error(`[TimingInterceptor] Error stack:`, error?.stack);
        },
      }),
    );
  }
}


