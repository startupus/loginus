import React from 'react';

export interface FooterProps {
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * Footer - Футер приложения
 */
export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-white dark:bg-dark-2 border-t border-secondary-200 dark:border-dark-3 ${className}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-secondary-600 dark:text-dark-6">
            © {currentYear} Loginus ID. Все права защищены.
          </div>
          <nav className="flex items-center gap-6">
            <a
              href="/about"
              className="text-sm text-secondary-600 dark:text-dark-6 hover:text-secondary-900 dark:hover:text-white transition-colors"
            >
              О проекте
            </a>
            <a
              href="/support"
              className="text-sm text-secondary-600 dark:text-dark-6 hover:text-secondary-900 dark:hover:text-white transition-colors"
            >
              Поддержка
            </a>
            <a
              href="/terms"
              className="text-sm text-secondary-600 dark:text-dark-6 hover:text-secondary-900 dark:hover:text-white transition-colors"
            >
              Условия использования
            </a>
            <a
              href="/privacy"
              className="text-sm text-secondary-600 dark:text-dark-6 hover:text-secondary-900 dark:hover:text-white transition-colors"
            >
              Политика конфиденциальности
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

