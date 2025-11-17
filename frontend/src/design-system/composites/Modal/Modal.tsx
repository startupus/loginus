import React, { useEffect, useRef } from 'react';

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
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /**
   * Footer с действиями
   */
  footer?: React.ReactNode;
  
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
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Закрытие по клику вне модального окна - из TailGrids Modal1.jsx
  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (!modalRef.current) return;
      if (!isOpen || modalRef.current.contains(event.target as Node)) return;
      onClose();
    };
    
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [isOpen, onClose]);

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
    full: 'max-w-full m-4',
  };
  
  if (!isOpen) return null;

  return (
    // Overlay - ТОЧНЫЕ классы из TailGrids Modal1.jsx
    <div className="fixed left-0 top-0 z-50 flex h-full min-h-screen w-full items-center justify-center bg-dark/90 px-4 py-5">
      {/* Modal Content - классы из TailGrids Modal1.jsx */}
        <div
        ref={modalRef}
        className={`w-full ${sizeClasses[size]} rounded-[20px] bg-white px-8 py-12 text-center dark:bg-dark-2 md:px-[70px] md:py-[60px] ${className}`}
        >
        {/* Title - из TailGrids Modal1.jsx */}
          {title && (
          <>
            <h3 className="pb-[18px] text-xl font-semibold text-dark dark:text-white sm:text-2xl">
              {title}
            </h3>
            {/* Separator - из TailGrids Modal1.jsx */}
            <span className="mx-auto mb-6 inline-block h-1 w-[90px] rounded-sm bg-primary"></span>
          </>
          )}

        {/* Content - из TailGrids Modal1.jsx */}
        <div className="mb-10 text-base leading-relaxed text-body-color dark:text-dark-6">
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
};
