/**
 * Базовый интерфейс события
 */
export interface IEvent<T = any> {
  /**
   * Имя события (например: 'user.created', 'menu.item.updated')
   */
  name: string;

  /**
   * Данные события
   */
  data: T;

  /**
   * Временная метка события
   */
  timestamp: Date;

  /**
   * Метаданные (опционально)
   */
  metadata?: Record<string, any>;

  /**
   * ID пользователя, вызвавшего событие (опционально)
   */
  userId?: string;

  /**
   * Контекст выполнения (опционально)
   */
  context?: Record<string, any>;
}

/**
 * Интерфейс обработчика события
 */
export interface IEventHandler<T = any> {
  /**
   * Обработать событие
   * @param event - событие для обработки
   * @returns Promise<void> или void
   */
  handle(event: IEvent<T>): Promise<void> | void;

  /**
   * Приоритет обработчика (меньше = выше приоритет)
   * По умолчанию: 100
   */
  priority?: number;

  /**
   * Имя обработчика для логирования
   */
  name?: string;
}

/**
 * Опции подписки на событие
 */
export interface IEventSubscriptionOptions {
  /**
   * Приоритет обработчика (меньше = выше приоритет)
   */
  priority?: number;

  /**
   * Асинхронная обработка (не блокирует основной поток)
   */
  async?: boolean;

  /**
   * Фильтр событий (если возвращает false, обработчик не вызывается)
   */
  filter?: (event: IEvent) => boolean;
}

/**
 * Результат выполнения обработчиков
 */
export interface IEventExecutionResult {
  /**
   * Событие, которое обрабатывалось
   */
  event: IEvent;

  /**
   * Количество выполненных обработчиков
   */
  handlersExecuted: number;

  /**
   * Время выполнения (мс)
   */
  executionTime: number;

  /**
   * Ошибки, возникшие при выполнении
   */
  errors: Array<{
    handler: string;
    error: Error;
  }>;

  /**
   * Успешно выполнено
   */
  success: boolean;
}

