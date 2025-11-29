import { Module, Global } from '@nestjs/common';
import { EventBusService } from './event-bus.service';

/**
 * EventsModule - глобальный модуль для системы событий
 * 
 * Предоставляет EventBusService для всего приложения
 */
@Global()
@Module({
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventsModule {}

