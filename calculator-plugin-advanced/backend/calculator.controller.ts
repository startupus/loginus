// ✅ ИСПРАВЛЕНИЕ: Убираем декораторы NestJS, так как они не работают при динамической загрузке
// Используем простой класс с методами-обработчиками

export class CalculateDto {
  expression: string;
}

/**
 * Calculator Controller для плагина calculator-advanced
 * 
 * ВАЖНО: 
 * - Зависимости передаются через конструктор при создании экземпляра
 * - НЕ используем декораторы NestJS (@Controller, @Post, @Body) - они не работают при динамической загрузке
 * - Методы вызываются напрямую через PluginRouterService
 */
export class CalculatorController {
  private eventBus: any;
  private PLUGIN_EVENTS: any;

  constructor(eventBus?: any, pluginEvents?: any) {
    this.eventBus = eventBus;
    this.PLUGIN_EVENTS = pluginEvents;
  }

  /**
   * Выполнить вычисление
   * POST /api/v2/plugins/calculator-advanced/calculator/calculate
   * Вызывается через PluginRouterService.callPluginHandler()
   */
  async calculate(body: CalculateDto, query: any, req: any) {
    console.log('[CalculatorController] Received request:', JSON.stringify(body));
    
    // ✅ ВАЛИДАЦИЯ: Проверяем вручную
    if (!body || typeof body !== 'object') {
      return {
        success: false,
        message: 'Invalid request body',
      };
    }
    
    const { expression } = body;

    if (!expression || typeof expression !== 'string') {
      console.log('[CalculatorController] Expression is missing or invalid:', { expression, type: typeof expression });
      return {
        success: false,
        message: 'Expression is required',
      };
    }

    try {
      // Безопасное вычисление на backend
      const result = this.safeEvaluate(expression);

      // Отправляем событие в EventBus
      if (this.eventBus && this.PLUGIN_EVENTS) {
        await this.eventBus.emit(this.PLUGIN_EVENTS.CALCULATION_DONE, {
          expression,
          result: result.toString(),
          timestamp: new Date().toISOString(),
        });
      }

      return {
        success: true,
        data: {
          expression,
          result: result.toString(),
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      // Отправляем событие об ошибке
      if (this.eventBus && this.PLUGIN_EVENTS) {
        await this.eventBus.emit(this.PLUGIN_EVENTS.CALCULATION_ERROR, {
          expression,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }

      return {
        success: false,
        message: error.message || 'Calculation error',
      };
    }
  }

  /**
   * Получить историю вычислений
   * GET /api/v2/plugins/calculator-advanced/calculator/history
   */
  async getHistory(body: any, query: any, req: any) {
    // TODO: Реализовать получение истории из БД
    return {
      success: true,
      data: [],
      message: 'History will be implemented with database storage',
    };
  }

  /**
   * Безопасное вычисление выражения
   * Разрешает только математические операции
   */
  private safeEvaluate(expression: string): number {
    // Удаляем все кроме цифр, операторов и скобок
    const cleaned = expression.replace(/[^0-9+\-*/().\s]/g, '');
    
    // Проверяем что выражение не пустое
    if (!cleaned.trim()) {
      throw new Error('Invalid expression');
    }

    try {
      // Используем Function для безопасного вычисления
      const result = Function(`"use strict"; return (${cleaned})`)();
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Invalid result');
      }

      return result;
    } catch (error) {
      throw new Error(`Calculation error: ${error.message}`);
    }
  }
}
