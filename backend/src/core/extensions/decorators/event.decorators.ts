import 'reflect-metadata';

/**
 * Метаданные для событий
 */
const EVENT_HANDLER_METADATA = 'plugin:event_handler';
const EVENT_EMITTER_METADATA = 'plugin:event_emitter';

/**
 * Информация об обработчике события
 */
export interface EventHandlerMetadata {
  eventName: string;
  methodName: string;
  priority: number;
}

/**
 * Декоратор для регистрации обработчика события
 * 
 * @param eventName - имя события
 * @param priority - приоритет обработчика (меньше = выше)
 * 
 * @example
 * ```typescript
 * class MyPlugin extends BasePlugin {
 *   @OnEvent('user.created')
 *   async handleUserCreated(event: IEvent<UserCreatedEventData>) {
 *     console.log('User created:', event.data);
 *   }
 * }
 * ```
 */
export function OnEvent(eventName: string, priority: number = 100) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const handlers: EventHandlerMetadata[] =
      Reflect.getMetadata(EVENT_HANDLER_METADATA, target.constructor) || [];

    handlers.push({
      eventName,
      methodName: propertyKey,
      priority,
    });

    Reflect.defineMetadata(EVENT_HANDLER_METADATA, handlers, target.constructor);

    return descriptor;
  };
}

/**
 * Получить все обработчики событий для класса
 */
export function getEventHandlers(target: any): EventHandlerMetadata[] {
  return Reflect.getMetadata(EVENT_HANDLER_METADATA, target) || [];
}

/**
 * Декоратор для маркировки метода как эмиттера события
 * (используется для документации и валидации)
 * 
 * @param eventName - имя события
 * 
 * @example
 * ```typescript
 * class MyPlugin extends BasePlugin {
 *   @EmitsEvent('custom.event')
 *   async doSomething() {
 *     await this.emit('custom.event', { data: 'value' });
 *   }
 * }
 * ```
 */
export function EmitsEvent(eventName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const emitters: string[] =
      Reflect.getMetadata(EVENT_EMITTER_METADATA, target.constructor) || [];

    if (!emitters.includes(eventName)) {
      emitters.push(eventName);
    }

    Reflect.defineMetadata(EVENT_EMITTER_METADATA, emitters, target.constructor);

    return descriptor;
  };
}

/**
 * Получить все события, которые может испускать класс
 */
export function getEmittedEvents(target: any): string[] {
  return Reflect.getMetadata(EVENT_EMITTER_METADATA, target) || [];
}

