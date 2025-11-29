import { Test, TestingModule } from '@nestjs/testing';
import { EventBusService } from '../event-bus.service';
import { IEvent } from '../interfaces/event.interface';

describe('EventBusService (Integration)', () => {
  let eventBus: EventBusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventBusService],
    }).compile();

    eventBus = module.get<EventBusService>(EventBusService);
  });

  afterEach(() => {
    eventBus.clearAll();
  });

  describe('Event Emission and Handling', () => {
    it('should emit and handle events', async () => {
      const receivedEvents: any[] = [];

      // Subscribe to event
      eventBus.on('test.event', {
        handle: async (event: IEvent) => {
          receivedEvents.push(event.data);
        },
      });

      // Emit event
      await eventBus.emit('test.event', { message: 'Hello World' });

      // Verify
      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0]).toEqual({ message: 'Hello World' });
    });

    it('should handle multiple subscribers', async () => {
      const handler1Called = jest.fn();
      const handler2Called = jest.fn();

      eventBus.on('test.event', {
        handle: async () => handler1Called(),
        name: 'Handler1',
      });

      eventBus.on('test.event', {
        handle: async () => handler2Called(),
        name: 'Handler2',
      });

      await eventBus.emit('test.event', {});

      expect(handler1Called).toHaveBeenCalled();
      expect(handler2Called).toHaveBeenCalled();
    });

    it('should respect handler priorities', async () => {
      const executionOrder: string[] = [];

      // Low priority (executed last)
      eventBus.on('test.priority', {
        handle: async () => executionOrder.push('low'),
        priority: 200,
        name: 'LowPriority',
      });

      // High priority (executed first)
      eventBus.on('test.priority', {
        handle: async () => executionOrder.push('high'),
        priority: 50,
        name: 'HighPriority',
      });

      // Medium priority
      eventBus.on('test.priority', {
        handle: async () => executionOrder.push('medium'),
        priority: 100,
        name: 'MediumPriority',
      });

      await eventBus.emit('test.priority', {});

      expect(executionOrder).toEqual(['high', 'medium', 'low']);
    });

    it('should support wildcard subscriptions', async () => {
      const receivedEvents: string[] = [];

      // Subscribe to all 'user.*' events
      eventBus.on('user.*', {
        handle: async (event: IEvent) => {
          receivedEvents.push(event.name);
        },
        name: 'UserWildcard',
      });

      await eventBus.emit('user.created', {});
      await eventBus.emit('user.updated', {});
      await eventBus.emit('user.deleted', {});
      await eventBus.emit('menu.clicked', {}); // Should not be caught

      expect(receivedEvents).toEqual(['user.created', 'user.updated', 'user.deleted']);
      expect(receivedEvents).not.toContain('menu.clicked');
    });

    it('should handle errors gracefully', async () => {
      const successHandler = jest.fn();

      // Handler that throws
      eventBus.on('test.error', {
        handle: async () => {
          throw new Error('Test error');
        },
        name: 'ErrorHandler',
      });

      // Handler that should still execute
      eventBus.on('test.error', {
        handle: async () => successHandler(),
        name: 'SuccessHandler',
      });

      const result = await eventBus.emit('test.error', {});

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].handler).toBe('ErrorHandler');
      expect(successHandler).toHaveBeenCalled();
    });

    it('should support event filters', async () => {
      const filteredHandler = jest.fn();

      eventBus.on(
        'test.filter',
        {
          handle: async () => filteredHandler(),
          name: 'FilteredHandler',
        },
        {
          filter: (event: IEvent) => event.data.shouldProcess === true,
        },
      );

      // Should not trigger handler
      await eventBus.emit('test.filter', { shouldProcess: false });
      expect(filteredHandler).not.toHaveBeenCalled();

      // Should trigger handler
      await eventBus.emit('test.filter', { shouldProcess: true });
      expect(filteredHandler).toHaveBeenCalled();
    });

    it('should support once() subscription', async () => {
      const handler = jest.fn();

      eventBus.once('test.once', {
        handle: async () => handler(),
        name: 'OnceHandler',
      });

      await eventBus.emit('test.once', {});
      await eventBus.emit('test.once', {});
      await eventBus.emit('test.once', {});

      // Should only be called once
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should support unsubscribe', async () => {
      const handler = jest.fn();

      const unsubscribe = eventBus.on('test.unsubscribe', {
        handle: async () => handler(),
        name: 'UnsubscribeHandler',
      });

      await eventBus.emit('test.unsubscribe', {});
      expect(handler).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();

      await eventBus.emit('test.unsubscribe', {});
      // Should still be 1 (not called again)
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Statistics', () => {
    it('should track event statistics', async () => {
      eventBus.on('test.stats', {
        handle: async () => {},
        name: 'StatsHandler',
      });

      await eventBus.emit('test.stats', {});
      await eventBus.emit('test.stats', {});

      const stats = eventBus.getStats();

      expect(stats.totalEvents).toBe(2);
      expect(stats.registeredHandlers).toHaveLength(1);
      expect(stats.registeredHandlers[0].eventName).toBe('test.stats');
    });
  });

  describe('Performance', () => {
    it('should handle many events efficiently', async () => {
      let handlerCount = 0;

      eventBus.on('test.performance', {
        handle: async () => {
          handlerCount++;
        },
        name: 'PerformanceHandler',
      });

      const startTime = Date.now();

      // Emit 1000 events
      for (let i = 0; i < 1000; i++) {
        await eventBus.emit('test.performance', { index: i });
      }

      const duration = Date.now() - startTime;

      expect(handlerCount).toBe(1000);
      expect(duration).toBeLessThan(5000); // Should complete in < 5 seconds
    });
  });
});

