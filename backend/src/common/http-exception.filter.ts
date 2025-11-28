import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof message === 'string'
          ? message
          : (message as any)?.message || 'Internal server error',
      error:
        typeof message === 'object' && 'error' in message
          ? (message as any).error
          : undefined,
    };

    // Логируем ошибку с полной информацией
    if (status >= 500) {
      this.logger.error(
        `❌ [${request.method}] ${request.url} - ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      this.logger.error('Request body:', request.body);
      this.logger.error('Request query:', request.query);
      this.logger.error('Request params:', request.params);
    } else {
      this.logger.warn(
        `⚠️ [${request.method}] ${request.url} - ${status}: ${errorResponse.message}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}

