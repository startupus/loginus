import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

/**
 * ProxyService — слой API‑шлюза для проксирования запросов на backend-mock.
 * Используется только как fallback для тех роутов, которые ещё не реализованы
 * в реальном backend.
 */
@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly targetBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.targetBaseUrl = this.configService.get<string>('app.mockBackendUrl')!;
    this.logger.log(`Gateway proxy target: ${this.targetBaseUrl}`);
  }

  async forward(req: Request, res: Response): Promise<void> {
    const targetUrl = `${this.targetBaseUrl}${req.originalUrl}`;

    try {
      const init: any = {
        method: req.method,
        // Пробрасываем заголовки, кроме Host/Content-Length/Encoding
        headers: this.buildForwardHeaders(req),
      };

      // Для небезопасных методов пробрасываем тело
      if (!['GET', 'HEAD'].includes(req.method.toUpperCase())) {
        // Если тело уже объект — сериализуем в JSON
        if (req.body && typeof req.body === 'object') {
          init.body = JSON.stringify(req.body);
          if (!init.headers['content-type']) {
            init.headers['content-type'] = 'application/json';
          }
        } else if (req.body) {
          init.body = req.body as any;
        }
      }

      const response = await fetch(targetUrl, init);

      // Пробрасываем статус и тело ответа
      this.copyResponseHeaders(response.headers, res);

      // Пытаемся сохранить тип содержимого
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        res.status(response.status).send(text);
      }
    } catch (error: any) {
      this.logger.error(
        `Proxy error for ${req.method} ${req.originalUrl} -> ${targetUrl}`,
        error?.stack || error?.message || String(error),
      );

      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: 'Mock backend is unavailable',
        });
      }
    }
  }

  private buildForwardHeaders(req: Request): Record<string, any> {
    const headers = req.headers as Record<string, any>;
    const forwarded: Record<string, any> = {
      ...headers,
    };

    // Удаляем заголовки, которые не должны пробрасываться как есть
    delete forwarded['host'];
    delete forwarded['content-length'];
    delete forwarded['transfer-encoding'];

    return forwarded;
  }

  private copyResponseHeaders(headers: any, res: Response): void {
    if (!headers || typeof headers.forEach !== 'function') {
      return;
    }

    headers.forEach((value: any, key: string) => {
      const lower = key.toLowerCase();
      if (
        lower === 'transfer-encoding' ||
        lower === 'content-encoding' ||
        lower === 'content-length'
      ) {
        return;
      }

      if (value !== undefined) {
        res.setHeader(key, value as any);
      }
    });
  }
}


