import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminPageTemplate } from '../../design-system/layouts/AdminPageTemplate';
import { Button } from '../../design-system/primitives/Button';
import { Icon } from '../../design-system/primitives/Icon';
import { Badge } from '../../design-system/primitives/Badge';
import { themeClasses } from '../../design-system/utils/themeClasses';

interface AuthMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  isPrimary: boolean;
  order: number;
  type: 'primary' | 'oauth' | 'alternative';
}

/**
 * AuthFlowBuilderPage - страница настройки алгоритма авторизации
 * Drag & Drop конструктор для настройки методов входа
 */
const AuthFlowBuilderPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  // Базовые методы авторизации (без переводов)
  const baseAuthMethods = useMemo(() => [
    { id: 'phone-email', icon: 'mail', enabled: true, isPrimary: true, order: 1, type: 'primary' as const },
    { id: 'github', icon: 'github', enabled: true, isPrimary: false, order: 2, type: 'oauth' as const },
    { id: 'telegram', icon: 'message-circle', enabled: true, isPrimary: false, order: 3, type: 'oauth' as const },
    { id: 'gosuslugi', icon: 'shield', enabled: true, isPrimary: false, order: 4, type: 'oauth' as const },
    { id: 'tinkoff', icon: 'credit-card', enabled: true, isPrimary: false, order: 5, type: 'oauth' as const },
    { id: 'qr', icon: 'qr-code', enabled: true, isPrimary: false, order: 6, type: 'alternative' as const },
    { id: 'password', icon: 'lock', enabled: true, isPrimary: false, order: 7, type: 'alternative' as const },
    { id: 'yandex', icon: 'user', enabled: true, isPrimary: false, order: 8, type: 'oauth' as const },
    { id: 'saber', icon: 'user', enabled: false, isPrimary: false, order: 9, type: 'oauth' as const },
  ], []);
  
  // Методы авторизации с переводами (реактивные к смене языка)
  const initialAuthMethods = useMemo(() => baseAuthMethods.map(method => ({
    ...method,
    name: t(`admin.authFlow.methods.${method.id}`, method.id),
  })), [baseAuthMethods, t, i18n.language]);
  
  const [authMethods, setAuthMethods] = useState<AuthMethod[]>(initialAuthMethods);
  
  // Обновляем методы при смене языка
  React.useEffect(() => {
    setAuthMethods(prevMethods => {
      return prevMethods.map(prevMethod => {
        const baseMethod = baseAuthMethods.find(b => b.id === prevMethod.id);
        if (!baseMethod) return prevMethod;
        return {
          ...prevMethod,
          name: t(`admin.authFlow.methods.${baseMethod.id}`, baseMethod.id),
        };
      });
    });
  }, [t, i18n.language, baseAuthMethods]);

  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleAddMethod = () => {
    console.log('Add new auth method');
    // TODO: Открыть модальное окно для добавления нового метода
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === id) return;

    const draggedIndex = authMethods.findIndex(m => m.id === draggedItem);
    const targetIndex = authMethods.findIndex(m => m.id === id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newMethods = [...authMethods];
    const [removed] = newMethods.splice(draggedIndex, 1);
    newMethods.splice(targetIndex, 0, removed);

    // Обновляем порядок
    newMethods.forEach((method, index) => {
      method.order = index + 1;
    });

    setAuthMethods(newMethods);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const toggleMethod = (id: string) => {
    setAuthMethods(authMethods.map(method => 
      method.id === id ? { ...method, enabled: !method.enabled } : method
    ));
  };

  const togglePrimary = (id: string) => {
    setAuthMethods(authMethods.map(method => 
      method.id === id ? { ...method, isPrimary: !method.isPrimary } : method
    ));
  };

  const primaryMethods = authMethods.filter(m => m.type === 'primary');
  const oauthMethods = authMethods.filter(m => m.type === 'oauth');
  const alternativeMethods = authMethods.filter(m => m.type === 'alternative');

  return (
    <AdminPageTemplate 
      title={t('admin.authFlow.title', 'Настройка алгоритма авторизации')} 
      showSidebar={true}
      headerActions={
        <Button
          variant="primary"
          leftIcon={<Icon name="plus" size="sm" />}
          onClick={handleAddMethod}
          className="hidden sm:flex"
        >
          {t('admin.authFlow.add', 'Добавить')}
        </Button>
      }
    >
      <div className="p-4 sm:p-6 pb-24 sm:pb-6">
        {/* Инструкция */}
        <div className={`${themeClasses.card.default} p-4 mb-6`}>
          <div className="flex items-start gap-3">
            <Icon name="info" size="md" className="text-primary mt-0.5" />
            <div>
              <p className={`text-sm ${themeClasses.text.primary} font-medium mb-1`}>
                {t('admin.authFlow.instruction.title', 'Настройка алгоритма авторизации')}
              </p>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                {t('admin.authFlow.instruction.description', 'Перетаскивайте методы для изменения порядка. Используйте переключатели для активации/деактивации методов и установки основных способов входа.')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основной метод */}
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
              {t('admin.authFlow.primaryMethod', 'Основной метод')}
            </h3>
            <div className="space-y-3">
              {primaryMethods.map((method) => (
                <div
                  key={method.id}
                  draggable
                  onDragStart={() => handleDragStart(method.id)}
                  onDragOver={(e) => handleDragOver(e, method.id)}
                  onDragEnd={handleDragEnd}
                  className={`${themeClasses.card.default} p-4 cursor-move hover:shadow-lg transition-all ${
                    draggedItem === method.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="grip-vertical" size="sm" className={themeClasses.text.secondary} />
                      <Icon name={method.icon as any} size="md" className="text-primary" />
                      <div>
                        <p className={`font-medium ${themeClasses.text.primary}`}>{method.name}</p>
                        <p className={`text-xs ${themeClasses.text.secondary}`}>{t('admin.authFlow.order', 'Порядок')}: {method.order}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMethod(method.id)}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          method.enabled ? 'bg-success' : 'bg-gray-3'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          method.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OAuth методы */}
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
              {t('admin.authFlow.oauthMethods', 'OAuth методы')}
            </h3>
            <div className="space-y-3">
              {oauthMethods.map((method) => (
                <div
                  key={method.id}
                  draggable
                  onDragStart={() => handleDragStart(method.id)}
                  onDragOver={(e) => handleDragOver(e, method.id)}
                  onDragEnd={handleDragEnd}
                  className={`${themeClasses.card.default} p-4 cursor-move hover:shadow-lg transition-all ${
                    draggedItem === method.id ? 'opacity-50' : ''
                  } ${!method.enabled ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="grip-vertical" size="sm" className={themeClasses.text.secondary} />
                      <Icon name={method.icon as any} size="md" className="text-primary" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${themeClasses.text.primary}`}>{method.name}</p>
                          {method.isPrimary && (
                            <Badge variant="warning" size="sm">{t('admin.authFlow.primary', 'Основной')}</Badge>
                          )}
                        </div>
                        <p className={`text-xs ${themeClasses.text.secondary}`}>{t('admin.authFlow.order', 'Порядок')}: {method.order}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePrimary(method.id)}
                        title={t('admin.authFlow.primaryOnStartPage', 'Основной на стартовой странице')}
                        className={`p-1 rounded transition-colors ${
                          method.isPrimary ? 'text-warning' : 'text-gray-3'
                        }`}
                      >
                        <Icon name="star" size="sm" />
                      </button>
                      <button
                        onClick={() => toggleMethod(method.id)}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          method.enabled ? 'bg-success' : 'bg-gray-3'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          method.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Альтернативные методы */}
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
              {t('admin.authFlow.alternativeMethods', 'Альтернативные методы')}
            </h3>
            <div className="space-y-3">
              {alternativeMethods.map((method) => (
                <div
                  key={method.id}
                  draggable
                  onDragStart={() => handleDragStart(method.id)}
                  onDragOver={(e) => handleDragOver(e, method.id)}
                  onDragEnd={handleDragEnd}
                  className={`${themeClasses.card.default} p-4 cursor-move hover:shadow-lg transition-all ${
                    draggedItem === method.id ? 'opacity-50' : ''
                  } ${!method.enabled ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="grip-vertical" size="sm" className={themeClasses.text.secondary} />
                      <Icon name={method.icon as any} size="md" className="text-primary" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${themeClasses.text.primary}`}>{method.name}</p>
                          {method.isPrimary && (
                            <Badge variant="warning" size="sm">{t('admin.authFlow.primary', 'Основной')}</Badge>
                          )}
                        </div>
                        <p className={`text-xs ${themeClasses.text.secondary}`}>{t('admin.authFlow.order', 'Порядок')}: {method.order}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePrimary(method.id)}
                        title={t('admin.authFlow.primaryOnStartPage', 'Основной на стартовой странице')}
                        className={`p-1 rounded transition-colors ${
                          method.isPrimary ? 'text-warning' : 'text-gray-3'
                        }`}
                      >
                        <Icon name="star" size="sm" />
                      </button>
                      <button
                        onClick={() => toggleMethod(method.id)}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          method.enabled ? 'bg-success' : 'bg-gray-3'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          method.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Кнопка сохранения */}
        <div className={`${themeClasses.card.default} p-4 mt-6 flex items-center justify-between`}>
          <p className={`text-sm ${themeClasses.text.secondary}`}>
            {t('admin.authFlow.saveHint', 'Не забудьте сохранить изменения')}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="md">
              {t('common.cancel', 'Отменить')}
            </Button>
            <Button variant="primary" size="md">
              {t('common.save', 'Сохранить')}
            </Button>
          </div>
        </div>
      </div>

      {/* Мобильная кнопка добавления метода */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <Button
          variant="primary"
          size="lg"
          onClick={handleAddMethod}
          className="rounded-full shadow-xl hover:shadow-2xl"
          iconOnly
        >
          <Icon name="plus" size="md" />
        </Button>
      </div>
    </AdminPageTemplate>
  );
};

export default AuthFlowBuilderPage;

