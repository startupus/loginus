import React from 'react';
import { Icon } from '../../primitives';

export interface WidgetCardProps {
  /**
   * Заголовок виджета (может быть строкой или ReactNode для кастомизации)
   */
  title?: React.ReactNode;
  
  /**
   * Иконка виджета
   */
  icon?: React.ReactNode;
  
  /**
   * Содержимое виджета
   */
  children: React.ReactNode;
  
  /**
   * Действия (кнопки, ссылки)
   */
  actions?: React.ReactNode;
  
  /**
   * Вариант отображения
   */
  variant?: 'default' | 'primary' | 'feature' | 'compact';
  
  /**
   * Клик на всю карточку
   */
  onClick?: () => void;
  
  /**
   * Показать drag handle (три точки для перетаскивания)
   */
  draggable?: boolean;
  
  /**
   * ID виджета для drag & drop
   */
  widgetId?: string;
  
  /**
   * Обработчики drag & drop
   */
  onDragStart?: (e: React.DragEvent, widgetId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, widgetId: string) => void;
  
  /**
   * Функция удаления виджета
   */
  onRemove?: (widgetId: string) => void;
  
  /**
   * Состояние drag & drop для визуальных индикаторов
   */
  isDragOver?: boolean;
  insertPosition?: 'before' | 'after' | null;
  isDragging?: boolean;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * WidgetCard - Карточка виджета на базе TailGrids Card
 * 
 * @source tailgrids-bank/application/Card/Card1.jsx (SingleCard component)
 * @example
 * <WidgetCard title="Документы" icon={<Icon name="document" />}>
 *   <p>У вас 5 документов</p>
 * </WidgetCard>
 */
export const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  icon,
  children,
  actions,
  variant = 'default',
  onClick,
  draggable = false,
  widgetId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  isDragOver = false,
  insertPosition = null,
  isDragging = false,
  className = '',
}) => {
  // Базовые классы - приведены к стандарту дизайн-системы (как ProfileCard и DataSection)
  // Используем rounded-xl вместо rounded-lg для единообразия
  // Убраны тени для единообразия с ProfileCard и DataSection
  const baseClasses = 'overflow-hidden rounded-xl transition-all';
  
  // Варианты фона - используем стандартизированные классы (как ProfileCard и DataSection)
  const variantClasses = {
    default: 'bg-white dark:bg-dark-2',  // Единый стандарт с ProfileCard и DataSection
    primary: 'bg-primary/5 dark:bg-primary/20',
    feature: 'bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/20 dark:to-secondary/20',
    compact: 'bg-white dark:bg-dark-2',  // Единый стандарт с ProfileCard и DataSection
  };
  
  // Padding - из TailGrids Card1.jsx
  const paddingClasses = {
    default: 'p-8 sm:p-9 md:p-7 xl:p-9',  // Точные из исходника
    primary: 'p-8 sm:p-9 md:p-7 xl:p-9',
    feature: 'p-8 sm:p-9 md:p-7 xl:p-9',
    compact: 'p-4',
  };
  
  const Component = onClick ? 'button' : 'div';
  
  // Классы для состояния drag & drop
  const dragOverClasses = isDragOver ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-dark' : '';
  const draggingClasses = isDragging ? 'opacity-50 scale-95' : '';
  
  const combinedClassName = `${baseClasses} ${variantClasses[variant]} ${onClick ? 'cursor-pointer' : ''} ${draggable ? 'cursor-move' : ''} ${dragOverClasses} ${draggingClasses} ${className}`.trim();
  
  const handleDragStart = (e: React.DragEvent) => {
    if (draggable && widgetId && onDragStart) {
      onDragStart(e, widgetId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', widgetId);
      // Добавляем визуальный эффект
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = '0.5';
      }
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (onDragEnd) {
      onDragEnd(e);
    }
    // Восстанавливаем визуальный эффект
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (draggable && onDragOver) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      onDragOver(e);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (draggable && onDragLeave) {
      onDragLeave(e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (draggable && widgetId && onDrop) {
      e.preventDefault();
      onDrop(e, widgetId);
    }
  };
  
  return (
    <div className="relative">
      {/* Индикатор вставки сверху */}
      {isDragOver && insertPosition === 'before' && (
        <div className="absolute -top-2 left-0 right-0 h-1 bg-primary rounded-full z-50 animate-pulse" />
      )}
      
      <Component
        onClick={onClick}
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative ${combinedClassName}`}
      >
      {/* Drag Handle и кнопка удаления - в правом верхнем углу */}
      {(draggable || onRemove) && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Drag Handle - три точки */}
          {draggable && (
            <button
              className="p-1.5 rounded-lg bg-gray-1 dark:bg-dark-3 hover:bg-gray-2 dark:hover:bg-dark-4 cursor-grab active:cursor-grabbing transition-colors"
              aria-label="Перетащить виджет"
              onMouseDown={(e) => {
                // Предотвращаем клик при начале перетаскивания
                e.stopPropagation();
              }}
            >
              <Icon name="menu" size="sm" className="text-text-secondary" />
            </button>
          )}
          
          {/* Кнопка удаления */}
          {onRemove && widgetId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(widgetId);
              }}
              className="p-1.5 rounded-lg bg-gray-1 dark:bg-dark-3 hover:bg-error/10 dark:hover:bg-error/20 transition-colors"
              aria-label="Удалить виджет"
            >
              <Icon name="trash" size="sm" color="rgb(var(--color-error))" />
            </button>
          )}
        </div>
      )}
      
      <div className={`${paddingClasses[variant]} ${className.includes('flex flex-col') ? 'flex flex-col h-full' : ''}`}>
        {/* Header с иконкой и заголовком */}
        {(title || icon) && (
          <div className="flex items-center gap-3 mb-4">
            {icon && (
              <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                {icon}
              </div>
            )}
            {title && (
              <h3 className="text-xl font-semibold text-text-primary hover:text-primary sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px]">
                {title}
              </h3>
            )}
          </div>
        )}
        
        {/* Content - классы из TailGrids Card1.jsx */}
        <div className={`text-base leading-relaxed text-text-secondary ${className.includes('flex flex-col') ? 'flex-1 flex flex-col min-h-0' : ''}`}>
          {children}
        </div>
        
        {/* Actions - в конце виджета */}
        {actions && (
          <div className="flex justify-end mt-4">
            {actions}
          </div>
        )}
      </div>
    </Component>
    
    {/* Индикатор вставки снизу */}
    {isDragOver && insertPosition === 'after' && (
      <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full z-50 animate-pulse" />
    )}
    </div>
  );
};
