import React, { useRef, useEffect } from 'react';

export interface MasonryGridProps {
  /**
   * Дочерние элементы
   */
  children: React.ReactNode;
  
  /**
   * Количество колонок на разных брейкпоинтах
   */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  /**
   * Отступ между элементами
   */
  gap?: number;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * MasonryGrid - компонент для создания настоящей Masonry сетки
 * Использует CSS columns для эффекта кирпичной кладки
 * Элементы заполняют колонки сверху вниз, создавая плотную раскладку
 */
export const MasonryGrid: React.FC<MasonryGridProps> = ({
  children,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 16,
  className = '',
}) => {
  // Получаем стили для CSS columns
  const getMasonryStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      columnGap: `${gap}px`,
      columnCount: columns.sm || 1,
    };
    
    return style;
  };

  // Уникальный ID для стилей этого экземпляра
  const styleIdRef = useRef(`masonry-grid-${Math.random().toString(36).slice(2, 11)}`);
  const styleId = styleIdRef.current;

  // Инжектируем медиа-запросы один раз через useEffect
  useEffect(() => {
    const styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      const style = document.createElement('style');
      style.id = styleId;
      const rules: string[] = [];
      
      if (columns.md) {
        rules.push(`@media (min-width: 768px) { .${styleId} { column-count: ${columns.md} !important; } }`);
      }
      if (columns.lg) {
        rules.push(`@media (min-width: 1024px) { .${styleId} { column-count: ${columns.lg} !important; } }`);
      }
      if (columns.xl) {
        rules.push(`@media (min-width: 1280px) { .${styleId} { column-count: ${columns.xl} !important; } }`);
      }
      
      style.textContent = rules.join(' ');
      document.head.appendChild(style);
      
      return () => {
        const element = document.getElementById(styleId);
        if (element) {
          element.remove();
        }
      };
    }
  }, [columns.md, columns.lg, columns.xl, styleId]);

  return (
    <div
      className={`${styleId} ${className}`.trim()}
      style={getMasonryStyle()}
    >
      {React.Children.map(children, (child, index) => (
        <div 
          key={index} 
          className="break-inside-avoid w-full"
          style={{ 
            marginBottom: `${gap}px`,
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
            // @ts-ignore - WebkitColumnBreakInside не в типах, но поддерживается браузерами
            WebkitColumnBreakInside: 'avoid',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

