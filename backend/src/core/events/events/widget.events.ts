/**
 * События виджетов
 */

export const WIDGET_EVENTS = {
  // Загрузка виджета
  BEFORE_LOAD: 'widget.before_load',
  AFTER_LOAD: 'widget.after_load',
  LOAD_FAILED: 'widget.load_failed',

  // Рендеринг виджета
  BEFORE_RENDER: 'widget.before_render',
  AFTER_RENDER: 'widget.after_render',
  RENDER_FAILED: 'widget.render_failed',

  // Данные виджета
  DATA_RECEIVED: 'widget.data_received',
  DATA_UPDATED: 'widget.data_updated',
  DATA_FETCH_FAILED: 'widget.data_fetch_failed',

  // Взаимодействие с виджетом
  CLICKED: 'widget.clicked',
  INTERACTED: 'widget.interacted',

  // Управление виджетами
  ADDED: 'widget.added',
  REMOVED: 'widget.removed',
  REORDERED: 'widget.reordered',

  // Конфигурация
  CONFIG_UPDATED: 'widget.config_updated',
  ENABLED: 'widget.enabled',
  DISABLED: 'widget.disabled',

  // Ошибки
  ERROR: 'widget.error',

  // Wildcard
  ALL: 'widget.*',
} as const;

/**
 * Типы данных для событий виджетов
 */
export interface WidgetLoadedEventData {
  widgetId: string;
  type: string;
  userId?: string;
}

export interface WidgetRenderedEventData {
  widgetId: string;
  renderTime: number;
}

export interface WidgetDataReceivedEventData {
  widgetId: string;
  data: any;
  source?: string;
}

export interface WidgetErrorEventData {
  widgetId: string;
  error: string;
  stack?: string;
}

export interface WidgetAddedEventData {
  widgetId: string;
  extensionId?: string;
  userId?: string;
}

export interface WidgetRemovedEventData {
  widgetId: string;
  userId?: string;
}

