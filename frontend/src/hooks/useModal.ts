import { useState, useCallback } from 'react';

/**
 * Хук для управления состоянием модального окна
 * 
 * @example
 * const { isOpen, open, close } = useModal();
 * 
 * <Modal isOpen={isOpen} onClose={close}>
 *   Содержимое модального окна
 * </Modal>
 */
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

