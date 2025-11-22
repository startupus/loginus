import { useState, useCallback, useMemo } from 'react';

/**
 * useAdminWidgets - хук для управления виджетами админ-дашборда
 * Основан на useWidgetPreferences, но для админки
 */
export const useAdminWidgets = () => {
  // Мемоизированная загрузка из localStorage при инициализации
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('adminWidgetOrder');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every(id => typeof id === 'string')) {
          return parsed;
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load adminWidgetOrder from localStorage:', error);
      }
    }
    // Значение по умолчанию для админки
    return ['overview', 'activities', 'churn'];
  });

  const [enabledWidgets, setEnabledWidgets] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('adminEnabledWidgets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every(id => typeof id === 'string')) {
          return new Set(parsed);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load adminEnabledWidgets from localStorage:', error);
      }
    }
    // Значение по умолчанию для админки
    return new Set(['overview', 'activities', 'churn']);
  });

  /**
   * Сохраняет порядок виджетов в localStorage
   */
  const saveWidgetOrder = useCallback((order: string[]) => {
    try {
      localStorage.setItem('adminWidgetOrder', JSON.stringify(order));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save adminWidgetOrder to localStorage:', error);
      }
    }
  }, []);

  /**
   * Сохраняет включенные виджеты в localStorage
   */
  const saveEnabledWidgets = useCallback((widgets: Set<string>) => {
    try {
      localStorage.setItem('adminEnabledWidgets', JSON.stringify(Array.from(widgets)));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save adminEnabledWidgets to localStorage:', error);
      }
    }
  }, []);

  /**
   * Переключает состояние виджета (включен/выключен)
   */
  const toggleWidget = useCallback((widgetId: string) => {
    setEnabledWidgets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
        setWidgetOrder(prevOrder => {
          const newOrder = prevOrder.filter(id => id !== widgetId);
          saveWidgetOrder(newOrder);
          return newOrder;
        });
      } else {
        newSet.add(widgetId);
        setWidgetOrder(prevOrder => {
          const newOrder = [...prevOrder, widgetId];
          saveWidgetOrder(newOrder);
          return newOrder;
        });
      }
      saveEnabledWidgets(newSet);
      return newSet;
    });
  }, [saveWidgetOrder, saveEnabledWidgets]);

  /**
   * Удаляет виджет (выключает и удаляет из порядка)
   */
  const removeWidget = useCallback((widgetId: string) => {
    setEnabledWidgets(prev => {
      const newSet = new Set(prev);
      newSet.delete(widgetId);
      saveEnabledWidgets(newSet);
      return newSet;
    });
    
    setWidgetOrder(prevOrder => {
      const newOrder = prevOrder.filter(id => id !== widgetId);
      saveWidgetOrder(newOrder);
      return newOrder;
    });
  }, [saveWidgetOrder, saveEnabledWidgets]);

  /**
   * Переупорядочивает виджеты (для drag & drop)
   */
  const reorderWidgets = useCallback((draggedId: string, targetId: string, position: 'before' | 'after' = 'after') => {
    setWidgetOrder(prevOrder => {
      const newOrder = [...prevOrder];
      const draggedIndex = newOrder.indexOf(draggedId);
      const targetIndex = newOrder.indexOf(targetId);
      
      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
        return prevOrder;
      }

      newOrder.splice(draggedIndex, 1);
      const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
      newOrder.splice(insertIndex, 0, draggedId);
      
      saveWidgetOrder(newOrder);
      return newOrder;
    });
  }, [saveWidgetOrder]);

  /**
   * Получает виджеты в правильном порядке (только включенные)
   */
  const orderedWidgets = useMemo(() => {
    return widgetOrder.filter(id => enabledWidgets.has(id));
  }, [widgetOrder, enabledWidgets]);

  return {
    widgetOrder,
    enabledWidgets,
    orderedWidgets,
    toggleWidget,
    removeWidget,
    reorderWidgets,
    updateWidgetOrder: saveWidgetOrder,
    updateEnabledWidgets: saveEnabledWidgets,
  };
};

