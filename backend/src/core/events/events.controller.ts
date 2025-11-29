import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EventBusService } from './event-bus.service';

export class EmitEventDto {
  eventName: string;
  data: Record<string, any>;
}

/**
 * Events Controller
 * Provides API for plugins to emit events to the EventBus
 */
@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventBus: EventBusService) {}

  /**
   * Emit event from plugin
   * POST /api/v2/events/emit
   */
  @Post('emit')
  async emitEvent(@Body() dto: EmitEventDto) {
    const { eventName, data } = dto;

    // Валидация
    if (!eventName || typeof eventName !== 'string') {
      return {
        success: false,
        message: 'Event name is required',
      };
    }

    // Отправляем событие в EventBus
    await this.eventBus.emit(eventName, data || {});

    return {
      success: true,
      message: `Event ${eventName} emitted successfully`,
      data: {
        eventName,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Get recent events for debugging
   * POST /api/v2/events/recent
   */
  @Post('recent')
  async getRecentEvents(@Body() dto: { limit?: number }) {
    // TODO: Implement getting recent events from EventLoggerService
    return {
      success: true,
      data: [],
    };
  }
}

