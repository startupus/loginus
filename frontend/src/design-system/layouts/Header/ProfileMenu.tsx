import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
// Прямые импорты для tree-shaking
import { Avatar } from '../../primitives/Avatar';
import { Icon } from '../../primitives/Icon';
import { useProfileMenu } from '../../hooks/useProfileMenu';
import { getInitials } from '@/utils/stringUtils';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { useContactMasking } from '@/hooks/useContactMasking';
import { useTheme } from '../../contexts/ThemeContext';
import { themeClasses } from '../../utils/themeClasses';
// Lazy loading для модалки - не нужна при первой загрузке
const OrganizationModal = React.lazy(() => import('@/components/Modals/OrganizationModal').then(m => ({ default: m.OrganizationModal })));
import { useModal } from '@/hooks/useModal';

export interface ProfileMenuProps {
  userData: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    login?: string;
    avatar?: string | null;
    unreadMail?: number;
    plusActive?: boolean;
    plusPoints?: number;
    gamePoints?: number; // Количество морковок (игровых баллов)
  };
  organizations?: Array<{
    id: string;
    name: string;
    avatar?: string | null;
  }>;
  onLogout?: () => void;
  onSwitchAccount?: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ 
  userData, 
  organizations = [],
  onSwitchAccount,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = useCurrentLanguage();
  const { isOpen, toggleMenu, closeMenu, menuRef } = useProfileMenu();
  const { setThemeMode } = useTheme();
  const organizationModal = useModal();
  const [isSkinMenuOpen, setIsSkinMenuOpen] = useState(false);
  const skinMenuRef = useRef<HTMLDivElement>(null);
  
  // Убеждаемся, что модуль profile загружен
  React.useEffect(() => {
    const checkAndLoadProfile = async () => {
      const currentLang = i18n.language;
      // Проверяем, есть ли перевод для profile.plus
      const plusTranslation = i18n.getResource(currentLang, 'translation', 'profile.plus');
      const hasProfile = plusTranslation !== undefined && typeof plusTranslation === 'string' && plusTranslation !== 'profile.plus' && plusTranslation !== 'Плюс';
      
      if (!hasProfile) {
        // Если модуль не загружен, загружаем его
        try {
          const { preloadModule } = await import('@/services/i18n/config');
          await preloadModule('profile');
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to load profile module in ProfileMenu:', error);
          }
        }
      }
    };
    
    checkAndLoadProfile();
  }, [i18n]);
  
  const { masked: maskedPhone } = useContactMasking(userData.phone || '', 'phone');

  // Закрываем меню внешнего вида при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (skinMenuRef.current && !skinMenuRef.current.contains(event.target as Node)) {
        setIsSkinMenuOpen(false);
      }
    };

    if (isSkinMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSkinMenuOpen]);

  // Получаем инициалы из имени, если имя валидное
  const initials = userData.name && userData.name.trim() !== '' 
    ? getInitials(userData.name) 
    : '';

  // Определяем, есть ли валидный src для аватара
  const avatarSrc = userData.avatar && userData.avatar !== null && userData.avatar.trim() !== '' 
    ? userData.avatar 
    : undefined;

  const handleSkinChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    setIsSkinMenuOpen(false);
  };

  const formatMailCounter = (count: number): string => {
    if (count === 0) return t('profile.mailCounter.none', 'нет непрочитанных писем');
    if (count === 1) return t('profile.mailCounter.one', 'непрочитанное письмо');
    if (count < 5) return t('profile.mailCounter.some', 'непрочитанных письма');
    return t('profile.mailCounter.many', 'непрочитанных писем');
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={toggleMenu}
          className="group !p-1 rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-dark"
          aria-label={t('profile.menu', 'Меню профиля')}
        >
          <Avatar
            src={avatarSrc}
            initials={initials}
            name={userData.name}
            size="lg"
            rounded
            showStatus
            status="online"
            className="ring-2 ring-transparent group-hover:ring-primary dark:group-hover:ring-primary transition-all duration-300 group-hover:shadow-lg"
          />
        </button>

        {isOpen && (
          <div className={`absolute top-full right-0 mt-3 w-[280px] bg-white dark:bg-dark-2 rounded-xl shadow-card-2 ${themeClasses.border.default} z-50 overflow-hidden animate-in`}>
            {/* Заголовок с аватаром и информацией */}
            <div className={`p-4 border-b ${themeClasses.border.default}`}>
              <div className="flex items-center gap-3 mb-2">
                <Avatar
                  src={avatarSrc}
                  initials={initials}
                  name={userData.name}
                  size="md"
                  rounded
                />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${themeClasses.text.primary} truncate`}>
                    {userData.name}
                  </div>
                  <div className="text-xs text-text-secondary truncate">
                    {maskedPhone} {userData.login && `• ${userData.login}`}
                  </div>
                </div>
              </div>
              <a
                href={buildPathWithLang('/dashboard', currentLang)}
                onClick={closeMenu}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                {t('profile.manageAccount', 'Управление аккаунтом')}
              </a>
            </div>

            {/* Выбор организации */}
            {organizations.length > 0 && (
              <div className="p-1">
                <button
                  onClick={organizationModal.open}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors text-left group"
                >
                  <Icon name="users" size="sm" className={`${themeClasses.text.secondary} dark:text-dark-6`} />
                  <span className={`flex-1 text-sm ${themeClasses.text.primary}`}>
                    {t('modals.organization.title', 'Выбрать организацию')}
                  </span>
                  <Icon name="chevron-down" size="xs" className="text-text-secondary dark:text-dark-6 group-hover:text-primary transition-colors" />
                </button>
              </div>
            )}

            {/* Основные пункты меню */}
            <div className="p-1">
              {/* Почта */}
              <a
                href="https://mail.yandex.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors group"
              >
                <Icon name="mail" size="sm" className={`${themeClasses.text.secondary} dark:text-dark-6`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${themeClasses.text.primary}`}>{t('profile.mail', 'Почта')}</div>
                </div>
                {userData.unreadMail !== undefined && userData.unreadMail > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">
                      {userData.unreadMail.toLocaleString()}
                    </span>
                    <span className="sr-only">{formatMailCounter(userData.unreadMail)}</span>
                  </div>
                )}
              </a>

              {/* Плюс */}
              <a
                href="https://plus.yandex.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors group"
              >
                <Icon name="star" size="sm" className={`${themeClasses.text.secondary} dark:text-dark-6`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${themeClasses.text.primary}`}>
                    {(() => {
                      const translation = t('profile.plus', { defaultValue: 'Клубус' });
                      // Если i18next вернул ключ (перевод не найден) или "Плюс", используем "Клубус"
                      if (translation === 'profile.plus' || translation === 'Плюс' || translation.startsWith('profile.')) {
                        return 'Клубус';
                      }
                      return translation;
                    })()}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {userData.plusActive 
                      ? t('profile.plusDescription', 'Подписка активна')
                      : t('profile.plusInactive', 'Не подключено')}
                  </div>
                </div>
                {userData.gamePoints !== undefined && (
                  <div className="text-xs text-text-secondary">
                    {userData.gamePoints > 0 ? userData.gamePoints.toLocaleString('ru-RU') : t('profile.plusPoints.none', 'нет баллов')}
                  </div>
                )}
              </a>

              {/* Личные данные */}
              <a
                href={buildPathWithLang('/personal?dialog=personal-data', currentLang)}
                onClick={closeMenu}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors group"
              >
                <Icon name="user" size="sm" className={`${themeClasses.text.secondary} dark:text-dark-6`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${themeClasses.text.primary}`}>
                    {t('profile.personalData', 'Личные данные')}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {t('profile.personalDataDescription', 'ФИО, день рождения, пол')}
                  </div>
                </div>
              </a>

              {/* Телефон */}
              {userData.phone && (
                <a
                  href={buildPathWithLang('/security/phones', currentLang)}
                  onClick={closeMenu}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors group"
                >
                  <Icon name="phone" size="sm" className={`${themeClasses.text.secondary} dark:text-dark-6`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${themeClasses.text.primary}`}>
                      {t('profile.phone', 'Телефон')}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {maskedPhone}
                    </div>
                  </div>
                </a>
              )}
            </div>

            {/* Разделитель */}
            <div className="h-px bg-gray-2 dark:bg-dark-3 my-1"></div>

            {/* Настройки */}
            <div className="p-1">
              {/* Внешний вид */}
              <div className="relative" ref={skinMenuRef}>
                <button
                  onClick={() => setIsSkinMenuOpen(!isSkinMenuOpen)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors group"
                >
                  <Icon name="monitor" size="sm" className={`${themeClasses.text.secondary} dark:text-dark-6`} />
                  <span className={`flex-1 text-sm ${themeClasses.text.primary} text-left`}>
                    {t('profile.skin', 'Внешний вид')}
                  </span>
                  <Icon 
                    name="chevron-down" 
                    size="xs" 
                    className={`text-text-secondary dark:text-dark-6 transition-transform ${isSkinMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isSkinMenuOpen && (
                  <div className={`absolute left-0 right-0 top-full mt-1 bg-white dark:bg-dark-2 rounded-lg shadow-lg ${themeClasses.border.default} overflow-hidden z-10`}>
                    <button
                      onClick={() => handleSkinChange('light')}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors"
                    >
                      {t('profile.skinLight', 'Всегда светлый')}
                    </button>
                    <button
                      onClick={() => handleSkinChange('dark')}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors"
                    >
                      {t('profile.skinDark', 'Всегда тёмный')}
                    </button>
                    <button
                      onClick={() => handleSkinChange('system')}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors"
                    >
                      {t('profile.skinSystem', 'Как в системе')}
                    </button>
                  </div>
                )}
              </div>

              {/* Настройки */}
              <a
                href="https://yandex.ru/tune"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors group"
              >
                <Icon name="settings" size="sm" className={`${themeClasses.text.secondary} dark:text-dark-6`} />
                <span className={`flex-1 text-sm ${themeClasses.text.primary} text-left`}>
                  {t('profile.settings', 'Настройки')}
                </span>
              </a>

              {/* Справка */}
              <a
                href={buildPathWithLang('/support', currentLang)}
                onClick={closeMenu}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors group"
              >
                <Icon name="help-circle" size="sm" className={`${themeClasses.text.secondary} dark:text-dark-6`} />
                <span className={`flex-1 text-sm ${themeClasses.text.primary} text-left`}>
                  {t('profile.support', 'Справка')}
                </span>
              </a>
            </div>

            {/* Разделитель */}
            <div className="h-px bg-gray-2 dark:bg-dark-3 my-1"></div>

            {/* Сменить аккаунт */}
            <div className="p-1">
              <button
                onClick={() => {
                  onSwitchAccount?.();
                  closeMenu();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors group text-left"
              >
                <Icon name="users" size="sm" className={`${themeClasses.text.secondary} dark:text-dark-6`} />
                <span className={`flex-1 text-sm ${themeClasses.text.primary}`}>
                  {t('profile.switchAccount', 'Сменить аккаунт')}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Organization Modal - lazy loaded */}
      <Suspense fallback={null}>
        <OrganizationModal
          isOpen={organizationModal.isOpen}
          onClose={organizationModal.close}
          onSelect={(orgId) => {
            // TODO: Реализовать выбор организации
            console.log('Selected organization:', orgId);
            organizationModal.close();
          }}
          organizations={organizations}
        />
      </Suspense>
    </>
  );
};


