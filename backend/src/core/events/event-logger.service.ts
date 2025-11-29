import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventLog } from './entities/event-log.entity';
import { EventPayload } from './event-emitter.interface';

export interface EventLogData {
  eventName: string;
  payload: EventPayload;
  pluginId?: string;
  status: 'success' | 'error';
  error?: string | null;
  executionTime: number;
}

/**
 * Event Logger Service
 * Logs all events to database for debugging and auditing
 */
@Injectable()
export class EventLoggerService {
  private readonly logger = new Logger(EventLoggerService.name);

  constructor(
    @InjectRepository(EventLog)
    private readonly eventLogRepository: Repository<EventLog>,
  ) {}

  /**
   * Log an event execution
   */
  async log(data: EventLogData): Promise<void> {
    try {
      const logEntry = this.eventLogRepository.create({
        eventName: data.eventName,
        payload: data.payload as any,
        pluginId: data.pluginId,
        status: data.status,
        error: data.error || undefined,
        executionTime: data.executionTime,
      });

      await this.eventLogRepository.save(logEntry);
    } catch (error) {
      // Don't throw - logging should never break the app
      this.logger.error('Failed to log event:', error.message);
    }
  }

  /**
   * Get logs for a specific event
   */
  async getEventLogs(
    eventName: string,
    limit = 100,
  ): Promise<EventLog[]> {
    return this.eventLogRepository.find({
      where: { eventName },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get logs for a specific plugin
   */
  async getPluginLogs(
    pluginId: string,
    limit = 100,
  ): Promise<EventLog[]> {
    return this.eventLogRepository.find({
      where: { pluginId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get failed event logs
   */
  async getFailedLogs(limit = 100): Promise<EventLog[]> {
    return this.eventLogRepository.find({
      where: { status: 'error' },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Delete old logs (cleanup)
   */
  async cleanup(olderThanDays = 30): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - olderThanDays);

    const result = await this.eventLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :date', { date })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} old event logs`);
    return result.affected || 0;
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const [total, errors, byEvent, byPlugin] = await Promise.all([
      this.eventLogRepository.count(),
      this.eventLogRepository.count({ where: { status: 'error' } }),
      this.eventLogRepository
        .createQueryBuilder('log')
        .select('log.eventName', 'eventName')
        .addSelect('COUNT(*)', 'count')
        .groupBy('log.eventName')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany(),
      this.eventLogRepository
        .createQueryBuilder('log')
        .select('log.pluginId', 'pluginId')
        .addSelect('COUNT(*)', 'count')
        .where('log.pluginId IS NOT NULL')
        .groupBy('log.pluginId')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany(),
    ]);

    return {
      total,
      errors,
      successRate: total > 0 ? ((total - errors) / total) * 100 : 0,
      topEvents: byEvent,
      topPlugins: byPlugin,
    };
  }
}

