import React, { Children } from 'react';
import { Separator } from '../../primitives';

export interface SeparatedListProps {
  /**
   * Дочерние элементы списка
   */
  children: React.ReactNode;
  
  /**
   * Ориентация разделителя
   */
  separatorOrientation?: 'horizontal' | 'vertical';
  
  /**
   * Дополнительные классы для контейнера
   */
  className?: string;
  
  /**
   * Дополнительные классы для разделителя
   */
  separatorClassName?: string;
}

/**
 * SeparatedList - Список элементов с автоматическими разделителями между ними
 * 
 * @example
 * <SeparatedList>
 *   <div>Элемент 1</div>
 *   <div>Элемент 2</div>
 *   <div>Элемент 3</div>
 * </SeparatedList>
 */
export const SeparatedList: React.FC<SeparatedListProps> = ({
  children,
  separatorOrientation = 'horizontal',
  className = '',
  separatorClassName = '',
}) => {
  const childrenArray = Children.toArray(children);
  
  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < childrenArray.length - 1 && (
            <Separator
              orientation={separatorOrientation}
              className={`my-3 ${separatorClassName}`.trim()}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

