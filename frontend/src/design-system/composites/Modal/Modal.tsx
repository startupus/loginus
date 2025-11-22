import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { themeClasses } from '../../utils/themeClasses';

export interface ModalProps {
  /**
   * Открыто ли модальное окно
   */
  isOpen: boolean;
  
  /**
   * Callback при закрытии
   */
  onClose: () => void;
  
  /**
   * Заголовок модального окна
   */
  title?: string;
  
  /**
   * Содержимое
   */
  children: React.ReactNode;
  
  /**
   * Размер модального окна
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  
  /**
   * Footer с действиями
   */
  footer?: React.ReactNode;
  
  /**
   * Позиционирование модального окна
   */
  position?: 'center' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  
  /**
   * Референс на элемент для привязки позиционирования (опционально)
   */
  anchorRef?: React.RefObject<HTMLElement>;
  
  /**
   * Показать кнопку закрытия (крестик)
   */
  showCloseButton?: boolean;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}
  
  /**
 * Modal - модальное окно на базе TailGrids
 * 
 * @source tailgrids-bank/application/Modal/Modal1.jsx
 * @example
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Заголовок">
 *   Содержимое модального окна
 * </Modal>
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  position = 'center',
  anchorRef,
  showCloseButton = false,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [positionStyles, setPositionStyles] = useState<React.CSSProperties>({});
  
  // Вычисление позиции относительно anchor элемента
  useEffect(() => {
    if (!isOpen || position === 'center' || !anchorRef?.current || !modalRef.current) {
      setPositionStyles({});
      return;
    }

    // Небольшая задержка для корректного вычисления размеров модалки
    const timeoutId = setTimeout(() => {
      if (!anchorRef?.current || !modalRef.current) return;

      const anchorRect = anchorRef.current.getBoundingClientRect();
      const modalRect = modalRef.current.getBoundingClientRect();
      const styles: React.CSSProperties = {};

      switch (position) {
        case 'top-right':
          styles.top = `${anchorRect.bottom + 8}px`;
          styles.right = `${window.innerWidth - anchorRect.right}px`;
          styles.left = 'auto';
          styles.bottom = 'auto';
          styles.transform = 'none';
          break;
        case 'top-left':
          styles.top = `${anchorRect.bottom + 8}px`;
          styles.left = `${anchorRect.left}px`;
          styles.right = 'auto';
          styles.bottom = 'auto';
          styles.transform = 'none';
          break;
        case 'bottom-right':
          styles.bottom = `${window.innerHeight - anchorRect.top + 8}px`;
          styles.right = `${window.innerWidth - anchorRect.right}px`;
          styles.top = 'auto';
          styles.left = 'auto';
          styles.transform = 'none';
          break;
        case 'bottom-left':
          styles.bottom = `${window.innerHeight - anchorRect.top + 8}px`;
          styles.left = `${anchorRect.left}px`;
          styles.top = 'auto';
          styles.right = 'auto';
          styles.transform = 'none';
          break;
      }

      // Проверка на выход за границы экрана
      if (position.includes('right') && styles.right !== undefined) {
        const rightValue = typeof styles.right === 'string' ? parseFloat(styles.right) : styles.right;
        const rightEdge = window.innerWidth - rightValue - modalRect.width;
        if (rightEdge < 16) {
          styles.right = '16px';
        }
      }
      if (position.includes('left') && styles.left !== undefined) {
        const leftValue = typeof styles.left === 'string' ? parseFloat(styles.left) : styles.left;
        if (leftValue + modalRect.width > window.innerWidth - 16) {
          styles.left = `${window.innerWidth - modalRect.width - 16}px`;
        }
      }
      if (position.includes('top') && styles.top !== undefined) {
        const topValue = typeof styles.top === 'string' ? parseFloat(styles.top) : styles.top;
        if (topValue + modalRect.height > window.innerHeight - 16) {
          styles.top = `${window.innerHeight - modalRect.height - 16}px`;
        }
      }
      if (position.includes('bottom') && styles.bottom !== undefined) {
        const bottomValue = typeof styles.bottom === 'string' ? parseFloat(styles.bottom) : styles.bottom;
        const bottomEdge = window.innerHeight - bottomValue - modalRect.height;
        if (bottomEdge < 16) {
          styles.bottom = '16px';
        }
      }

      setPositionStyles(styles);
    }, 10);

    return () => clearTimeout(timeoutId);
  }, [isOpen, position, anchorRef]);

  // Закрытие по клику вне модального окна - из TailGrids Modal1.jsx
  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (!modalRef.current) return;
      if (!isOpen || modalRef.current.contains(event.target as Node)) return;
      // Не закрывать при клике на anchor элемент
      if (anchorRef?.current && anchorRef.current.contains(event.target as Node)) return;
      onClose();
    };
    
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [isOpen, onClose, anchorRef]);

  // Закрытие по ESC - из TailGrids Modal1.jsx
  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (!isOpen || event.key !== 'Escape') return;
        onClose();
    };

    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [isOpen, onClose]);

  // Размеры - адаптировано из TailGrids
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-[570px]',      // Из TailGrids Modal1.jsx
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    full: 'max-w-full m-4',
  };

  // Классы для позиционирования
  const positionClasses = position === 'center' 
    ? 'items-center justify-center' 
    : 'items-start justify-end';
  
  if (!isOpen) {
    return null;
  }

  const modalContent = (
    // Overlay - ТОЧНЫЕ классы из TailGrids Modal1.jsx
    <div 
      className={`fixed left-0 top-0 ${position === 'center' ? 'z-[100001]' : 'z-[100]'} flex h-full min-h-screen w-full ${positionClasses} ${position === 'center' ? 'bg-text-primary/90 px-4 py-5' : ''}`}
      style={position !== 'center' ? { background: 'transparent', pointerEvents: 'none' } : {}}
      onClick={(e) => {
        // Закрываем модалку при клике на overlay
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal Content - классы из TailGrids Modal1.jsx */}
        <div
        ref={modalRef}
        className={`w-full ${sizeClasses[size]} rounded-[20px] ${themeClasses.card.shadow} px-8 py-12 text-center md:px-[70px] md:py-[60px] ${className}`}
        style={position !== 'center' ? { ...positionStyles, position: 'fixed', zIndex: 101, pointerEvents: 'auto' } : {}}
        >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full ${themeClasses.background.gray} ${themeClasses.active.navItemInactive} transition-colors ${themeClasses.text.primary} hover:text-error shadow-sm`}
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        
        {/* Title - из TailGrids Modal1.jsx */}
          {title && (
          <>
            <h3 className="pb-[18px] text-xl font-semibold text-text-primary sm:text-2xl">
              {title}
            </h3>
            {/* Separator - из TailGrids Modal1.jsx */}
            <span className="mx-auto mb-6 inline-block h-1 w-[90px] rounded-sm bg-primary"></span>
          </>
          )}

        {/* Content - из TailGrids Modal1.jsx */}
        <div className={`mb-10 text-base leading-relaxed ${themeClasses.text.secondary}`}>
          {children}
        </div>

          {/* Footer */}
          {footer && (
          <div className="-mx-3 flex flex-wrap">
              {footer}
            </div>
          )}
      </div>
    </div>
  );

  // Рендерим модалку через Portal в body для корректного отображения
  if (typeof document === 'undefined') {
    return null;
  }
  
  return createPortal(modalContent, document.body);
};
