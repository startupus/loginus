import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { LandingHeader } from '../design-system/layouts/LandingHeader';
import { LandingFooter } from '../design-system/layouts/LandingFooter';
import { Icon } from '../design-system/primitives/Icon';
import { Button } from '../design-system/primitives/Button';
import { Spinner } from '../design-system/primitives/Spinner';
import { WidgetCard } from '../design-system/composites/WidgetCard';
import { useClientSafe } from '../design-system/contexts';
import { useLanguageStore } from '../store';
import { useCurrentLanguage, buildPathWithLang } from '../utils/routing';
import { themeClasses } from '../design-system/utils/themeClasses';
import { changeLanguage } from '../services/i18n/config';
import { helpApi, HelpCategory } from '../services/api/help';
import { HelpSidebar } from './help/HelpSidebar';

const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { hasFeature } = useClientSafe();
  const { setLanguage, language: storeLanguage } = useLanguageStore();
  const currentLang = useCurrentLanguage() || storeLanguage || 'ru';
  
  // Условная функциональность через Multi-tenant Support
  const showAdditionalHelp = hasFeature('help-additional-section') !== false; // По умолчанию показываем

  // Загрузка категорий через API
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['help', 'categories', currentLang],
    queryFn: async () => {
      const response = await helpApi.getCategories();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 1,
  });

  const handleLanguageChange = async () => {
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    await changeLanguage(newLang);
    
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/[^/]+/, '') || '/';
    const newPath = buildPathWithLang(pathWithoutLang, newLang);
    navigate(newPath, { replace: true });
  };

  // Fallback данные для разработки (если API недоступен)
  const helpCategories: HelpCategory[] = categoriesData || [];

  return (
    <div className={themeClasses.page.container}>
      {/* Header */}
      <LandingHeader
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLang}
        showThemeSwitcher={true}
        showLoginButton={true}
        onLoginClick={() => {
          const lang = currentLang || 'ru';
          const path = buildPathWithLang('/auth', lang);
          navigate(path);
        }}
        navItems={[
          { label: t('landing.nav.about', 'О Loginus ID'), href: buildPathWithLang('/about', currentLang) },
          { label: t('landing.nav.features', 'Возможности'), href: buildPathWithLang('/features', currentLang) },
          { label: t('landing.nav.help', 'Справка'), href: buildPathWithLang('/help', currentLang) },
        ]}
      />

      {/* Main Content */}
      <main className={themeClasses.layout.mainContent}>
        <div className={`${themeClasses.layout.flexRow} ${themeClasses.container.maxWidth}`}>
          {/* Sidebar Navigation */}
          <HelpSidebar currentPath={location.pathname} />

          {/* Main Content Area */}
          <div className={`${themeClasses.utility.flex1} ${themeClasses.utility.minW0}`}>
            {/* Header Section */}
            <div className={themeClasses.spacing.mb12}>
              <h1 className={`${themeClasses.typographySize.h1} ${themeClasses.text.primary} ${themeClasses.spacing.mb4}`}>
                {t('help.header.title', 'Ваш Loginus ID')}
              </h1>
              <p className={`${themeClasses.typographySize.bodyLarge} ${themeClasses.text.secondary} ${themeClasses.typographySize.leadingRelaxed} ${themeClasses.utility.maxW3xl}`}>
                {t('help.header.description', 'Многие сервисы Loginus доступны только после регистрации: например, без аккаунта не получится воспользоваться многими функциями. Loginus ID — это единый аккаунт на Loginus. Используйте его для авторизации на всех сервисах Loginus.')}
              </p>
              <p className={`${themeClasses.typographySize.body} ${themeClasses.text.secondary} ${themeClasses.typographySize.leadingRelaxed} ${themeClasses.utility.maxW3xl} ${themeClasses.spacing.mt4}`}>
                {t('help.header.description2', 'Если вам нужно сменить пароль или указать другую фамилию — достаточно обновить информацию в Loginus ID. Изменения автоматически отобразятся во всех сервисах. Здесь же вы сможете привязать к Loginus ID номер телефона и настроить способ входа.')}
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className={themeClasses.state.loading}>
                <div className={themeClasses.layout.textCenter}>
                  <Spinner size="lg" color="primary" className={themeClasses.layout.mxAuto} />
                  <p className={`${themeClasses.spacing.mt4} ${themeClasses.text.secondary}`}>
                    {t('common.loading', 'Загрузка...')}
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className={themeClasses.state.error}>
                <div className={themeClasses.layout.textCenter}>
                  <Icon name="alert-circle" size="lg" className={`${themeClasses.text.error} ${themeClasses.layout.mxAuto} ${themeClasses.spacing.mb4}`} />
                  <p className={themeClasses.text.secondary}>
                    {t('common.error', 'Произошла ошибка при загрузке данных')}
                  </p>
                </div>
              </div>
            )}

            {/* Help Categories Grid - таблица как в Яндекс ID */}
            {!isLoading && !error && helpCategories.length > 0 && (
              <div className={themeClasses.utility.overflowXAuto}>
                <table className={themeClasses.table.base}>
                  <tbody>
                    {helpCategories.map((category, index) => (
                      <tr key={category.id || index} className={`${themeClasses.border.bottom} ${themeClasses.utility.lastBorderB0}`}>
                        <td className={themeClasses.table.cell}>
                          <div className={themeClasses.iconCircle.primary}>
                            <Icon name={category.icon} size="lg" />
                          </div>
                        </td>
                        <td className={themeClasses.table.row}>
                          <h3 className={`${themeClasses.typographySize.h3} ${themeClasses.text.primary} ${themeClasses.spacing.mb3}`}>
                            {category.title}
                          </h3>
                          <ul className={themeClasses.spacing.spaceY2}>
                            {category.links.map((link, linkIndex) => (
                              <li key={linkIndex}>
                                <a
                                  href={buildPathWithLang(link.href, currentLang)}
                                  className={`${themeClasses.typographySize.bodySmall} ${themeClasses.link.primary} ${themeClasses.link.withIcon}`}
                                >
                                  <span>{link.text}</span>
                                  <Icon name="chevron-right" size="sm" />
                                </a>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Additional Help Section - условная функциональность через Multi-tenant Support */}
            {!isLoading && !error && showAdditionalHelp && (
              <WidgetCard
                variant="default"
                className={themeClasses.spacing.mt12}
                title={t('help.additionalHelp.title', 'Не нашли ответ?')}
              >
                <p className={`${themeClasses.text.secondary} ${themeClasses.spacing.mb4}`}>
                  {t('help.additionalHelp.description', 'Если вы не нашли ответ на свой вопрос в справке, обратитесь в поддержку.')}
                </p>
                <div className={`${themeClasses.utility.flex} ${themeClasses.layout.flexWrap}`}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      const lang = currentLang || 'ru';
                      navigate(buildPathWithLang('/support', lang));
                    }}
                    leftIcon={<Icon name="message-circle" size="sm" />}
                  >
                    {t('help.additionalHelp.contact', 'Связаться с поддержкой')}
                  </Button>
                </div>
              </WidgetCard>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default HelpPage;

