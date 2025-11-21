import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../primitives/Button';
import { Icon } from '../../primitives/Icon';
import { useTheme } from '../../contexts';
import { useLanguageStore } from '@/store';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { themeClasses } from '../../utils/themeClasses';
import { changeLanguage } from '@/services/i18n/config';

export interface AuthPageLayoutHeader {
  /**
   * Показать кнопку "Назад"
   */
  showBack?: boolean;
  
  /**
   * Callback при клике "Назад"
   */
  onBack?: () => void;
  
  /**
   * Логотип
   */
  logo?: React.ReactNode;
  
  /**
   * Заголовок
   */
  title?: string;
}

export interface AuthPageLayoutFooter {
  /**
   * Текст футера
   */
  text?: string;
  
  /**
   * Ссылки
   */
  links?: Array<{ href: string; text: string }>;
  
  /**
   * Дополнительный текст (например, "Передаваемые данные")
   */
  additionalText?: string;
  
  /**
   * Дополнительная ссылка
   */
  additionalLink?: { href: string; text: string };
}

export interface AuthPageLayoutProps {
  /**
   * Настройки header
   */
  header?: AuthPageLayoutHeader;
  
  /**
   * Настройки footer
   */
  footer?: AuthPageLayoutFooter;
  
  /**
   * Тип фона
   */
  background?: 'default' | 'image' | 'gradient';
  
  /**
   * Содержимое страницы
   */
  children: React.ReactNode;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * Компонент переключателя темы
 */
const ThemeSwitcher: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { isDark } = useTheme();

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-gray-2 dark:hover:bg-dark-3 transition-all"
      title="Переключить тему"
    >
      {isDark ? (
        <Icon name="sun" size="sm" className="text-warning" />
      ) : (
        <Icon name="moon" size="sm" className="text-primary" />
      )}
    </button>
  );
};

/**
 * Компонент переключателя языка
 */
const LanguageSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguageStore();
  const currentLang = useCurrentLanguage();

  const handleToggle = async () => {
    const newLang = (currentLang || language) === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    await changeLanguage(newLang);
    
    // Обновляем URL с новым языком, сохраняя состояние (state)
    const pathWithoutLang = location.pathname.replace(/^\/[^/]+/, '') || '/';
    const newPath = buildPathWithLang(pathWithoutLang, newLang);
    navigate(newPath, { 
      replace: true,
      state: location.state, // Сохраняем состояние формы при переключении языка
    });
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-primary transition-colors"
      title="Переключить язык"
    >
      {(currentLang || language) === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
    </button>
  );
};

/**
 * AuthPageLayout - единый layout для всех страниц авторизации
 */
export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  header,
  footer,
  background = 'default',
  children,
  className = '',
}) => {
  const { themeMode, setThemeMode } = useTheme();
  const backgroundClasses = {
    default: 'bg-gray-1 dark:bg-dark',
    image: 'bg-gray-1 dark:bg-dark bg-[url("/auth-bg.svg")] bg-cover bg-center',
    gradient: 'bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-dark-2 dark:to-dark',
  };

  const handleThemeToggle = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  return (
    <div className={`min-h-screen flex flex-col ${backgroundClasses[background]} ${className}`}>
      {/* Header */}
      {header && (
        <header className={`p-4 sm:p-6 border-b ${themeClasses.border.dark} ${themeClasses.background.surfaceElevated}`}>
          <div className="grid grid-cols-3 items-center w-full">
            {/* Левая колонка: кнопка "Назад" */}
            <div className="flex justify-start">
              {header.showBack && header.onBack ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={header.onBack}
                  className="flex items-center gap-2"
                >
                  <Icon name="arrow-left" size="sm" />
                  <span className="hidden sm:inline">Назад</span>
                </Button>
              ) : (
                <div></div>
              )}
            </div>
            
            {/* Центральная колонка: логотип (всегда по центру) */}
            <div className="flex items-center justify-center">
              {header.logo && <div>{header.logo}</div>}
            </div>
            
            {/* Правая колонка: переключатель темы или заголовок */}
            <div className="flex justify-end items-center gap-2">
              {/* Переключатель темы */}
              <ThemeSwitcher onClick={handleThemeToggle} />
              {header.title && (
                <h1 className="text-xl font-bold text-text-primary">
                  {header.title}
                </h1>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className={`w-full max-w-md ${themeClasses.card.roundedShadow} p-6 sm:p-8`}>
          {children}
        </div>
      </main>

      {/* Footer */}
      {footer && (
        <footer className={`p-4 sm:p-6 border-t ${themeClasses.border.dark} ${themeClasses.background.surfaceElevated}`}>
          <div className="flex items-center justify-between">
            {/* Левая часть: переключатель языка */}
            <LanguageSwitcher />
            
            {/* Центральная часть: текст футера */}
            <div className="flex-1 text-center space-y-2">
              {footer.text && (
                <p className="text-xs sm:text-sm text-text-secondary">
                  {footer.text}{' '}
                  {footer.links && footer.links.length > 0 && (
                    <>
                      {footer.links.map((link, index) => (
                        <React.Fragment key={index}>
                          <Link
                            to={link.href}
                            className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors underline"
                          >
                            {link.text}
                          </Link>
                          {index < footer.links!.length - 1 && ' и '}
                        </React.Fragment>
                      ))}
                    </>
                  )}
                </p>
              )}
              {footer.additionalLink && (
                <p className="text-xs sm:text-sm">
                  <Link
                    to={footer.additionalLink.href}
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    {footer.additionalLink.text}
                  </Link>
                </p>
              )}
            </div>
            
            {/* Правая часть: пустое место для баланса */}
            <div className="w-20"></div>
          </div>
        </footer>
      )}
    </div>
  );
};

