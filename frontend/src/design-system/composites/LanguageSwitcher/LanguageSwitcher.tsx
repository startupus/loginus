/**
 * LanguageSwitcher - единый компонент для переключения языка
 * Используется в Header и Sidebar
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '@/store';
import { changeLanguage } from '@/services/i18n';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { themeClasses } from '../../utils/themeClasses';

export interface LanguageSwitcherProps {
  /**
   * Вариант отображения
   */
  variant?: 'button' | 'compact';
  
  /**
   * Дополнительные классы
   */
  className?: string;
  
  /**
   * Показывать ли флаги
   */
  showFlags?: boolean;
}

/**
 * LanguageSwitcher - компонент для переключения языка
 * Синхронизирует язык с i18n, languageStore и URL
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'button',
  className = '',
  showFlags = true,
}) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();
  const { language, setLanguage } = useLanguageStore();

  const handleLanguageChange = async () => {
    const newLang = language === 'ru' ? 'en' : 'ru';
    
    // Обновляем store
    setLanguage(newLang);
    
    // Меняем язык в i18n
    await changeLanguage(newLang);
    
    // Синхронизируем URL с сохранением query и hash
    const currentPath = window.location.pathname.replace(/^\/(ru|en)/, '') || '/';
    const search = window.location.search;
    const hash = window.location.hash;
    const newPath = buildPathWithLang(currentPath, newLang) + search + hash;
    navigate(newPath, { replace: true });
  };

  const currentLanguage = language || currentLang || 'ru';
  const displayLang = currentLanguage === 'ru' ? 'RU' : 'EN';
  const flag = currentLanguage === 'ru' ? '🇷🇺' : '🇬🇧';

  if (variant === 'compact') {
    return (
      <button
        onClick={handleLanguageChange}
        className={`${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap2} ${themeClasses.spacing.px3} ${themeClasses.spacing.py2} ${themeClasses.utility.roundedLg} ${themeClasses.typographySize.bodySmall} ${themeClasses.background.hoverGrayDark} ${themeClasses.utility.transitionAll} ${className || themeClasses.text.primary}`}
        aria-label={`Switch language to ${currentLanguage === 'ru' ? 'English' : 'Russian'}`}
      >
        {showFlags && <span>{flag}</span>}
        <span>{displayLang}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLanguageChange}
      className={`${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap2} ${themeClasses.spacing.px3} ${themeClasses.spacing.py2} ${themeClasses.utility.roundedLg} ${themeClasses.typographySize.bodySmall} ${themeClasses.background.hoverGrayDark} ${themeClasses.utility.transitionAll} ${className || themeClasses.text.primary}`}
      aria-label={`Switch language to ${currentLanguage === 'ru' ? 'English' : 'Russian'}`}
    >
      {showFlags && <span className="text-base">{flag}</span>}
      <span>{displayLang}</span>
    </button>
  );
};

LanguageSwitcher.displayName = 'LanguageSwitcher';

