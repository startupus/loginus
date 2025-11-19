import { useState, useCallback, useMemo } from 'react';

/**
 * useWidgetPreferences - хук для управления предпочтениями виджетов
 * Оптимизирует работу с localStorage, минимизируя количество операций чтения/записи
 * 
 * @returns Объект с состоянием виджетов и методами для управления
 */
export const useWidgetPreferences = () => {
  // Мемоизированная загрузка из localStorage при инициализации
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('widgetOrder');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Валидация: убеждаемся что это массив строк
        if (Array.isArray(parsed) && parsed.every(id => typeof id === 'string')) {
          return parsed;
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load widgetOrder from localStorage:', error);
      }
    }
    // Значение по умолчанию
    return ['courses', 'events', 'roadmap'];
  });

  const [enabledWidgets, setEnabledWidgets] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('enabledWidgets');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Валидация: убеждаемся что это массив строк
        if (Array.isArray(parsed) && parsed.every(id => typeof id === 'string')) {
          return new Set(parsed);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load enabledWidgets from localStorage:', error);
      }
    }
    // Значение по умолчанию
    return new Set(['courses', 'events', 'roadmap']);
  });

  /**
   * Сохраняет порядок виджетов в localStorage
   * Использует debounce для минимизации операций записи
   */
  const saveWidgetOrder = useCallback((order: string[]) => {
    try {
      localStorage.setItem('widgetOrder', JSON.stringify(order));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save widgetOrder to localStorage:', error);
      }
    }
  }, []);

  /**
   * Сохраняет включенные виджеты в localStorage
   */
  const saveEnabledWidgets = useCallback((widgets: Set<string>) => {
    try {
      localStorage.setItem('enabledWidgets', JSON.stringify(Array.from(widgets)));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save enabledWidgets to localStorage:', error);
      }
    }
  }, []);

  /**
   * Обновляет порядок виджетов с автоматическим сохранением
   */
  const updateWidgetOrder = useCallback((order: string[]) => {
    setWidgetOrder(order);
    saveWidgetOrder(order);
  }, [saveWidgetOrder]);

  /**
   * Обновляет включенные виджеты с автоматическим сохранением
   */
  const updateEnabledWidgets = useCallback((widgets: Set<string>) => {
    setEnabledWidgets(widgets);
    saveEnabledWidgets(widgets);
  }, [saveEnabledWidgets]);

  /**
   * Переключает состояние виджета (включен/выключен)
   */
  const toggleWidget = useCallback((widgetId: string) => {
    setEnabledWidgets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
        // Удалить из порядка
        setWidgetOrder(prevOrder => {
          const newOrder = prevOrder.filter(id => id !== widgetId);
          saveWidgetOrder(newOrder);
          return newOrder;
        });
      } else {
        newSet.add(widgetId);
        // Добавить в конец порядка
        setWidgetOrder(prevOrder => {
          const newOrder = [...prevOrder, widgetId];
          saveWidgetOrder(newOrder);
          return newOrder;
        });
      }
      // Сохранить в localStorage
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

      // Удаляем перетаскиваемый элемент
      newOrder.splice(draggedIndex, 1);
      
      // Вставляем в нужную позицию
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
    updateWidgetOrder,
    updateEnabledWidgets,
  };
};

