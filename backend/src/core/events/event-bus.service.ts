import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import {
  IEvent,
  IEventHandler,
  IEventSubscriptionOptions,
  IEventExecutionResult,
} from './interfaces/event.interface';

// Forward reference для избежания circular dependency
@Injectable()
export class EventLoggerService {
  async logEvent?(data: any): Promise<void>;
}

/**
 * Информация о зарегистрированном обработчике
 */
interface RegisteredHandler {
  handler: IEventHandler;
  priority: number;
  async: boolean;
  filter?: (event: IEvent) => boolean;
  name: string;
}

/**
 * EventBusService - центральная система управления событиями
 * 
 * Основные возможности:
 * - Регистрация обработчиков событий с приоритетами
 * - Синхронная и асинхронная обработка событий
 * - Фильтрация событий
 * - Логирование всех событий и ошибок
 * - Поддержка wildcard подписок (например: 'user.*')
 */
@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  
  /**
   * Хранилище обработчиков: eventName -> массив обработчиков
   */
  private handlers: Map<string, RegisteredHandler[]> = new Map();

  /**
   * Счетчик событий для статистики
   */
  private eventCount = 0;

  constructor(
    @Optional() @Inject('EventLoggerService') private readonly eventLogger?: EventLoggerService,
  ) {}

  /**
   * Подписаться на событие
   * 
   * @param eventName - имя события (поддерживает wildcard: 'user.*')
   * @param handler - обработчик события
   * @param options - опции подписки
   * @returns функция для отписки
   */
  on(
    eventName: string,
    handler: IEventHandler,
    options: IEventSubscriptionOptions = {},
  ): () => void {
    const {
      priority = 100,
      async = false,
      filter,
    } = options;

    const registeredHandler: RegisteredHandler = {
      handler,
      priority,
      async,
      filter,
      name: handler.name || handler.constructor.name || 'AnonymousHandler',
    };

    // Получаем или создаем массив обработчиков для события
    const handlers = this.handlers.get(eventName) || [];
    handlers.push(registeredHandler);

    // Сортируем обработчики по приоритету (меньше = выше)
    handlers.sort((a, b) => a.priority - b.priority);

    this.handlers.set(eventName, handlers);

    this.logger.debug(
      `Handler "${registeredHandler.name}" registered for event "${eventName}" with priority ${priority}`,
    );

    // Возвращаем функцию для отписки
    return () => {
      const handlers = this.handlers.get(eventName);
      if (handlers) {
        const index = handlers.indexOf(registeredHandler);
        if (index > -1) {
          handlers.splice(index, 1);
          this.logger.debug(
            `Handler "${registeredHandler.name}" unregistered from event "${eventName}"`,
          );
        }
      }
    };
  }

  /**
   * Подписаться на событие один раз
   * 
   * @param eventName - имя события
   * @param handler - обработчик события
   * @param options - опции подписки
   */
  once(
    eventName: string,
    handler: IEventHandler,
    options: IEventSubscriptionOptions = {},
  ): void {
    const unsubscribe = this.on(
      eventName,
      {
        ...handler,
        handle: async (event: IEvent) => {
          await handler.handle(event);
          unsubscribe();
        },
      },
      options,
    );
  }

  /**
   * Испустить событие
   * 
   * @param eventName - имя события
   * @param data - данные события
   * @param metadata - метаданные события
   * @returns результат выполнения
   */
  async emit<T = any>(
    eventName: string,
    data: T,
    metadata?: Record<string, any>,
  ): Promise<IEventExecutionResult> {
    const startTime = performance.now();
    const event: IEvent<T> = {
      name: eventName,
      data,
      timestamp: new Date(),
      metadata,
    };

    this.eventCount++;

    this.logger.debug(`Event emitted: ${eventName}`, { data, metadata });

    const errors: Array<{ handler: string; error: Error }> = [];
    let handlersExecuted = 0;

    // Получаем все обработчики для этого события (включая wildcard)
    const handlers = this.getHandlersForEvent(eventName);

    if (handlers.length === 0) {
      this.logger.debug(`No handlers found for event: ${eventName}`);
    }

    // Выполняем обработчики
    for (const registered of handlers) {
      // Проверяем фильтр
      if (registered.filter && !registered.filter(event)) {
        this.logger.debug(
          `Handler "${registered.name}" filtered out for event: ${eventName}`,
        );
        continue;
      }

      try {
        if (registered.async) {
          // Асинхронная обработка (не блокирует)
          this.executeHandlerAsync(registered, event).catch((error) => {
            this.logger.error(
              `Async handler "${registered.name}" failed for event "${eventName}":`,
              error,
            );
          });
        } else {
          // Синхронная обработка
          await registered.handler.handle(event);
        }
        handlersExecuted++;
      } catch (error) {
        errors.push({
          handler: registered.name,
          error: error instanceof Error ? error : new Error(String(error)),
        });
        this.logger.error(
          `Handler "${registered.name}" failed for event "${eventName}":`,
          error,
        );
      }
    }

    const executionTime = performance.now() - startTime;

    const result: IEventExecutionResult = {
      event,
      handlersExecuted,
      executionTime,
      errors,
      success: errors.length === 0,
    };

    // Логируем событие в БД если EventLoggerService доступен
    if (this.eventLogger && this.eventLogger.logEvent) {
      try {
        await this.eventLogger.logEvent({
          eventName,
          payload: data,
          status: errors.length === 0 ? 'success' : 'error',
          error: errors.length > 0 ? errors.map(e => e.error.message).join('; ') : null,
          executionTime,
        });
      } catch (logError) {
        // Не бросаем ошибку, чтобы не прерывать основной поток
        this.logger.error('Failed to log event:', logError);
      }
    }

    if (executionTime > 1000) {
      this.logger.warn(
        `Event "${eventName}" took ${executionTime.toFixed(2)}ms to process`,
      );
    }

    return result;
  }

  /**
   * Выполнить обработчик асинхронно
   */
  private async executeHandlerAsync(
    registered: RegisteredHandler,
    event: IEvent,
  ): Promise<void> {
    await registered.handler.handle(event);
  }

  /**
   * Получить все обработчики для события (включая wildcard)
   */
  private getHandlersForEvent(eventName: string): RegisteredHandler[] {
    const handlers: RegisteredHandler[] = [];

    // Точное совпадение
    const exactHandlers = this.handlers.get(eventName);
    if (exactHandlers) {
      handlers.push(...exactHandlers);
    }

    // Wildcard подписки (например: 'user.*' для 'user.created')
    for (const [pattern, patternHandlers] of this.handlers.entries()) {
      if (pattern.includes('*')) {
        const regex = new RegExp(
          '^' + pattern.replace(/\*/g, '.*').replace(/\./g, '\\.') + '$',
        );
        if (regex.test(eventName)) {
          handlers.push(...patternHandlers);
        }
      }
    }

    // Сортируем по приоритету
    handlers.sort((a, b) => a.priority - b.priority);

    return handlers;
  }

  /**
   * Получить статистику событий
   */
  getStats() {
    return {
      totalEvents: this.eventCount,
      registeredHandlers: Array.from(this.handlers.entries()).map(
        ([eventName, handlers]) => ({
          eventName,
          handlerCount: handlers.length,
          handlers: handlers.map((h) => ({
            name: h.name,
            priority: h.priority,
            async: h.async,
          })),
        }),
      ),
    };
  }

  /**
   * Очистить все обработчики (для тестирования)
   */
  clearAll() {
    this.handlers.clear();
    this.logger.debug('All event handlers cleared');
  }

  /**
   * Удалить все обработчики для события
   */
  removeAllListeners(eventName: string) {
    this.handlers.delete(eventName);
    this.logger.debug(`All handlers removed for event: ${eventName}`);
  }
}
