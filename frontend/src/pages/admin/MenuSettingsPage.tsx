import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { preloadModule } from '../../services/i18n/config';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AdminPageTemplate } from '../../design-system/layouts/AdminPageTemplate';
import { Button } from '../../design-system/primitives/Button';
import { Icon } from '../../design-system/primitives/Icon';
import { Input } from '../../design-system/primitives/Input';
import { Switch } from '../../design-system/composites/Switch';
import { Checkbox } from '../../design-system/primitives/Checkbox';
import { Modal } from '../../design-system/composites/Modal';
import { ErrorMessage } from '../../design-system/composites/ErrorMessage';
import { LoadingState } from '../../design-system/composites/LoadingState';
import { EmptyState } from '../../design-system/composites/EmptyState';
import { menuSettingsApi, MenuItemConfig } from '../../services/api/menu-settings';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';
import { IconPicker } from '../../components/IconPicker/IconPicker';
import { Tabs } from '../../design-system/composites/Tabs';

// Компонент для сортируемого элемента меню
interface MenuItemProps {
  item: MenuItemConfig;
  onToggle: (id: string) => void;
  onEdit: (item: MenuItemConfig) => void;
  onDelete: (id: string) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onToggle, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const currentLang = useCurrentLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : item.enabled ? 1 : 0.6,
  };

  const isDefault = item.type === 'default';
  const canDelete = !isDefault; // Базовые пункты нельзя удалять

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap4} ${themeClasses.spacing.p4} ${themeClasses.utility.roundedLg} ${themeClasses.border.default} ${
        isDragging ? `${themeClasses.border.primary} ${themeClasses.card.shadow}` : ''
      } ${
        item.enabled
          ? themeClasses.background.surface
          : themeClasses.background.iconContainer
      } ${themeClasses.utility.transitionAll}`}
    >
      {/* Иконка для перетаскивания - доступна для всех пунктов */}
      <div
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing ${themeClasses.text.secondary} ${themeClasses.utility.opacity80} touch-none select-none`}
        style={{ touchAction: 'none', userSelect: 'none' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Icon name="grip-vertical" size="sm" />
      </div>

      {/* Иконка пункта меню */}
      {item.icon && (
        <Icon 
          name={item.icon} 
          size="sm" 
          className={item.enabled ? themeClasses.text.secondary : themeClasses.utility.opacity50}
        />
      )}

      {/* Название и тип */}
      <div className={themeClasses.utility.flex1}>
        <div className={`font-medium ${item.enabled ? themeClasses.text.primary : themeClasses.utility.opacity60}`}>
          {item.label || item.id}
        </div>
        <div className={`${themeClasses.typographySize.bodySmall} ${item.enabled ? themeClasses.text.secondary : themeClasses.utility.opacity50}`}>
          {item.type === 'default' && t('admin.menuSettings.type.default')}
          {item.type === 'external' && t('admin.menuSettings.type.external')}
          {item.type === 'iframe' && t('admin.menuSettings.type.iframe')}
          {item.type === 'embedded' && t('admin.menuSettings.type.embedded')}
          {item.path && ` • ${item.path}`}
        </div>
      </div>

      {/* Кнопки действий */}
      <div className={`${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap2}`} onClick={(e) => e.stopPropagation()}>
        {/* Кнопка редактирования - доступна для всех пунктов, включая системные (только иконка) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
          iconOnly
          aria-label={t('common.edit')}
          >
          <Icon name="edit" size="sm" />
          </Button>
        {/* Кнопка удаления - только для несистемных пунктов (системные нельзя удалить, можно только отключить) */}
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            iconOnly
            className={`${themeClasses.text.error} ${themeClasses.utility.opacity80}`}
            aria-label={t('common.delete')}
          >
            <Icon name="trash" size="sm" />
          </Button>
        )}
      </div>

      {/* Тумблер включения/выключения - всегда справа, последний элемент */}
      <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
        <Switch
          checked={item.enabled}
          onChange={() => onToggle(item.id)}
        />
      </div>
    </div>
  );
};

const MenuSettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = useCurrentLanguage();
  const queryClient = useQueryClient();
  const [adminModuleLoaded, setAdminModuleLoaded] = useState(false);

  // Предзагрузка и перезагрузка модуля admin при смене языка
  useEffect(() => {
    const loadModules = async () => {
      try {
        await preloadModule('admin');
        setAdminModuleLoaded(true);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[MenuSettingsPage] Failed to load admin module:', error);
        }
        // Помечаем как загруженный даже при ошибке, чтобы не блокировать рендер
        setAdminModuleLoaded(true);
      }
    };

    loadModules();

    // Перезагружаем модуль при смене языка
    const handleLanguageChanged = async () => {
      try {
        await preloadModule('admin');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[MenuSettingsPage] Failed to reload admin module on language change:', error);
        }
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItemConfig | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItemConfig | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItemConfig & { labelRu?: string; labelEn?: string }>>({
    type: 'external',
    enabled: true,
    order: 0,
  });

  // Настройка сенсоров для drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Загрузка настроек меню
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['menu-settings'],
    queryFn: () => menuSettingsApi.getMenuSettings(),
  });

  // Примечание: все операции (добавление, редактирование, удаление, переключение) 
  // работают с мок-данными локально через queryClient.setQueryData без запросов на сервер

  const settings = settingsData?.data?.data;
  const items = settings?.items || [];

  // Обработка drag & drop (локальное обновление без запроса на сервер)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(items, oldIndex, newIndex);
      // Обновляем порядок
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      // Обновляем локальное состояние через React Query без запроса на сервер
      queryClient.setQueryData(['menu-settings'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: {
              items: updatedItems,
            },
          },
        };
      });
    }
  };

  // Переключение включения/выключения пункта (локальное обновление без запроса на сервер)
  const handleToggle = (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    
    // Обновляем локальное состояние через React Query без запроса на сервер
    queryClient.setQueryData(['menu-settings'], (oldData: any) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        data: {
          ...oldData.data,
          data: {
            items: updatedItems,
          },
        },
      };
    });
  };

  // Открытие модального окна подтверждения удаления
  const handleDeleteClick = (id: string) => {
    const item = items.find((item) => item.id === id);
    // Базовые пункты (type === 'default') нельзя удалять
    if (item?.type === 'default') {
      return;
    }
    setItemToDelete(item || null);
    setIsDeleteModalOpen(true);
  };

  // Подтверждение удаления пункта (локальное обновление без запроса на сервер)
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    
    const updatedItems = items.filter((item) => item.id !== itemToDelete.id);
    // Обновляем порядок
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      order: index + 1,
    }));
    
    // Обновляем локальное состояние через React Query без запроса на сервер
    queryClient.setQueryData(['menu-settings'], (oldData: any) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        data: {
          ...oldData.data,
          data: {
            items: reorderedItems,
          },
        },
      };
    });
    
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Открытие модального окна для редактирования (теперь доступно для всех пунктов, включая системные)
  const handleEdit = (item: MenuItemConfig) => {
    setEditingItem(item);
    // Извлекаем переводы из label или используем label как fallback
    const itemWithTranslations = {
      ...item,
      labelRu: (item as any).labelRu || item.label || '',
      labelEn: (item as any).labelEn || item.label || '',
    };
    setNewItem(itemWithTranslations);
    setIsAddModalOpen(true);
  };

  // Открытие модального окна для добавления
  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setNewItem({
      type: 'external',
      enabled: true,
      order: items.length + 1,
      id: `custom-${Date.now()}`,
      label: '',
      labelRu: '',
      labelEn: '',
      icon: '',
      path: undefined,
      externalUrl: '',
      openInNewTab: false,
      iframeUrl: undefined,
      iframeCode: undefined,
      embeddedAppUrl: undefined,
    });
    setIsAddModalOpen(true);
  }, [items.length]);

  // Сохранение пункта меню
  const handleSave = () => {
    setErrorMessage(null);
    
    // Валидация обязательных полей в зависимости от типа
    // Проверяем наличие хотя бы одного перевода
    const labelRu = (newItem as any).labelRu || '';
    const labelEn = (newItem as any).labelEn || '';
    const label = newItem.label || '';
    
    // Используем labelRu как основной label, если он есть, иначе labelEn, иначе label
    const finalLabel = labelRu.trim() || labelEn.trim() || label.trim();
    
    if (!finalLabel) {
      setErrorMessage(t('admin.menuSettings.errors.requiredFields'));
      return;
    }

    if (!newItem.id) {
      setErrorMessage(t('admin.menuSettings.errors.requiredFields'));
      return;
    }

    // Валидация для разных типов пунктов (для системных пунктов валидация более мягкая)
    const isSystemItem = editingItem && editingItem.type === 'default';
    
    if (!isSystemItem) {
      // Для несистемных пунктов применяем полную валидацию
    if (newItem.type === 'external') {
      if (!newItem.externalUrl || !newItem.externalUrl.trim()) {
          setErrorMessage(t('admin.menuSettings.errors.requiredFields'));
        return;
      }
    } else if (newItem.type === 'iframe') {
      if (!newItem.path || !newItem.path.trim()) {
          setErrorMessage(t('admin.menuSettings.errors.requiredFields'));
        return;
      }
      if (!newItem.iframeUrl && !newItem.iframeCode) {
          setErrorMessage(t('admin.menuSettings.errors.iframeRequired'));
        return;
      }
    } else if (newItem.type === 'embedded') {
      if (!newItem.embeddedAppUrl || !newItem.embeddedAppUrl.trim()) {
          setErrorMessage(t('admin.menuSettings.errors.requiredFields'));
        return;
      }
      if (!newItem.path || !newItem.path.trim()) {
          setErrorMessage(t('admin.menuSettings.errors.requiredFields'));
        return;
        }
      }
    }

    // Формируем полный объект пункта меню
    // Для системных пунктов сохраняем оригинальные id и type
    const menuItem: MenuItemConfig & { labelRu?: string; labelEn?: string } = {
      id: isSystemItem ? editingItem.id : (newItem.id || `custom-${Date.now()}`),
      type: isSystemItem ? editingItem.type : (newItem.type || 'external'),
      enabled: newItem.enabled !== undefined ? newItem.enabled : true,
      order: editingItem ? editingItem.order : items.length + 1,
      label: finalLabel, // Основной label для обратной совместимости
      labelRu: labelRu.trim() || undefined,
      labelEn: labelEn.trim() || undefined,
      icon: newItem.icon || undefined,
      path: newItem.path || undefined,
      systemId: isSystemItem ? editingItem.systemId : undefined,
      externalUrl: newItem.externalUrl || undefined,
      openInNewTab: newItem.openInNewTab || false,
      iframeUrl: newItem.iframeUrl || undefined,
      iframeCode: newItem.iframeCode || undefined,
      embeddedAppUrl: newItem.embeddedAppUrl || undefined,
    };

    let updatedItems: MenuItemConfig[];

    if (editingItem) {
      // Редактирование существующего пункта
      updatedItems = items.map((item) =>
        item.id === editingItem.id ? { ...menuItem, id: editingItem.id } : item
      );
    } else {
      // Добавление нового пункта
      updatedItems = [...items, menuItem];
      // Обновляем порядок
      updatedItems = updatedItems.map((item, index) => ({
        ...item,
        order: index + 1,
      }));
    }

    // Обновляем локальное состояние через React Query без запроса на сервер (мок-данные)
    queryClient.setQueryData(['menu-settings'], (oldData: any) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        data: {
          ...oldData.data,
          data: {
            items: updatedItems,
          },
        },
      };
    });

    // Обновляем UI состояние
    setIsAddModalOpen(false);
    setEditingItem(null);
    setErrorMessage(null);
    setNewItem({
      type: 'external',
      enabled: true,
      order: 0,
    });
  };

  // Показываем loading если данные еще загружаются или модуль admin еще не загружен
  if (isLoading || !adminModuleLoaded) {
    return (
      <AdminPageTemplate title={t('admin.menuSettings.title')} showSidebar={true}>
        <LoadingState text={t('common.loading')} />
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate
      title={t('admin.menuSettings.title')}
      showSidebar={true}
    >
      <div className={themeClasses.spacing.spaceY6}>
        {/* Описание с кнопкой */}
        <div className={`${themeClasses.spacing.p4} ${themeClasses.utility.roundedLg} ${themeClasses.card.default} ${themeClasses.border.default}`}>
          <div className={`${themeClasses.utility.flexColSmRow} sm:items-center sm:justify-between ${themeClasses.spacing.gap4}`}>
            <p className={`text-sm flex-1 ${themeClasses.text.secondary}`}>
              {t('admin.menuSettings.description')}
            </p>
            <div className="flex-shrink-0">
              <Button
                type="button"
                variant="primary"
                leftIcon={<Icon name="plus" size="sm" />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAdd();
                }}
                className="w-full sm:w-auto"
              >
                {t('admin.menuSettings.addItem')}
              </Button>
            </div>
          </div>
        </div>

        {/* Список пунктов меню */}
        {items.length === 0 ? (
          <EmptyState
            icon="menu"
            title={t('admin.menuSettings.noItems')}
            iconSize="xl"
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className={themeClasses.spacing.spaceY3}>
                {items.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Модальное окно для добавления/редактирования */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
          setErrorMessage(null);
          setNewItem({
            type: 'external',
            enabled: true,
            order: 0,
            labelRu: '',
            labelEn: '',
          });
        }}
        title={editingItem ? t('admin.menuSettings.editItem') : t('admin.menuSettings.addItem')}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingItem(null);
                setNewItem({
                  type: 'external',
                  enabled: true,
                  order: 0,
                  labelRu: '',
                  labelEn: '',
                });
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className={themeClasses.spacing.spaceY4}>
          {errorMessage && (
            <ErrorMessage error={errorMessage} />
          )}
          
          {/* Поле названия с вкладками для разных языков */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              {t('admin.menuSettings.form.label')}
            </label>
            <Tabs
              tabs={[
                {
                  id: 'ru',
                  label: '🇷🇺 RU',
                  content: (
                    <Input
                      value={(newItem as any).labelRu || ''}
                      onChange={(e) => {
                        const labelRu = e.target.value;
                        const labelEn = (newItem as any).labelEn || '';
                        // Используем labelRu как основной label, если он есть, иначе labelEn
                        setNewItem({ ...newItem, labelRu, label: labelRu || labelEn });
                      }}
                      placeholder={t('admin.menuSettings.form.labelPlaceholder', 'Введите название на русском')}
                      required
                      className="!border-0 focus:!border-0 active:!border-0"
                    />
                  ),
                },
                {
                  id: 'en',
                  label: '🇬🇧 EN',
                  content: (
                    <Input
                      value={(newItem as any).labelEn || ''}
                      onChange={(e) => {
                        const labelEn = e.target.value;
                        const labelRu = (newItem as any).labelRu || '';
                        // Используем labelRu как основной label, если он есть, иначе labelEn
                        setNewItem({ ...newItem, labelEn, label: labelRu || labelEn });
                      }}
                      placeholder={t('admin.menuSettings.form.labelPlaceholderEn', 'Enter name in English')}
                      required
                      className="!border-0 focus:!border-0 active:!border-0"
                    />
                  ),
                },
              ]}
              defaultTab={currentLang || 'ru'}
            />
          </div>

          {/* Для системных пунктов тип и id нельзя менять */}
          {editingItem && editingItem.type === 'default' ? (
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                {t('admin.menuSettings.form.type')}
              </label>
              <div className={`px-4 py-2 rounded-lg border ${themeClasses.border.default} ${themeClasses.background.gray2} ${themeClasses.text.secondary}`}>
                {t('admin.menuSettings.type.default')}
              </div>
              <p className={`text-xs mt-1 ${themeClasses.text.secondary}`}>
                {t('admin.menuSettings.form.typeReadonly')}
              </p>
            </div>
          ) : (
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                {t('admin.menuSettings.form.type')}
            </label>
            <select
              value={newItem.type || 'external'}
              onChange={(e) => {
                const newType = e.target.value as MenuItemConfig['type'];
                // Очищаем поля других типов при смене типа
                setNewItem({
                  ...newItem,
                  type: newType,
                  externalUrl: newType === 'external' ? newItem.externalUrl : undefined,
                  iframeUrl: newType === 'iframe' ? newItem.iframeUrl : undefined,
                  iframeCode: newType === 'iframe' ? newItem.iframeCode : undefined,
                  embeddedAppUrl: newType === 'embedded' ? newItem.embeddedAppUrl : undefined,
                });
                setErrorMessage(null);
              }}
              className={themeClasses.input.default}
            >
                <option value="external">{t('admin.menuSettings.type.external')}</option>
                <option value="iframe">{t('admin.menuSettings.type.iframe')}</option>
                <option value="embedded">{t('admin.menuSettings.type.embedded')}</option>
            </select>
          </div>
          )}

          {newItem.type === 'external' && (
            <>
              <Input
                label={t('admin.menuSettings.form.externalUrl')}
                value={newItem.externalUrl || ''}
                onChange={(e) => setNewItem({ ...newItem, externalUrl: e.target.value })}
                placeholder="https://example.com"
                required
              />
              <Checkbox
                checked={newItem.openInNewTab || false}
                onChange={(checked) => setNewItem({ ...newItem, openInNewTab: checked })}
                label={t('admin.menuSettings.form.openInNewTab')}
              />
            </>
          )}

          {newItem.type === 'iframe' && (
            <>
              <Input
                label={t('admin.menuSettings.form.iframeUrl')}
                value={newItem.iframeUrl || ''}
                onChange={(e) => setNewItem({ ...newItem, iframeUrl: e.target.value })}
                placeholder="https://example.com"
              />
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  {t('admin.menuSettings.form.iframeCode')}
                </label>
                <textarea
                  value={newItem.iframeCode || ''}
                  onChange={(e) => {
                    setNewItem({ ...newItem, iframeCode: e.target.value });
                    setErrorMessage(null);
                  }}
                  className={`w-full px-4 py-2 rounded-lg border ${themeClasses.border.default} ${themeClasses.input.background} ${themeClasses.text.primary} ${themeClasses.input.placeholder} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                  rows={5}
                  placeholder="<div>...</div>"
                />
              </div>
              <Input
                label={t('admin.menuSettings.form.path')}
                value={newItem.path || ''}
                onChange={(e) => setNewItem({ ...newItem, path: e.target.value })}
                placeholder="/iframe/custom"
                required
              />
            </>
          )}

          {newItem.type === 'embedded' && (
            <>
              <Input
                label={t('admin.menuSettings.form.embeddedAppUrl')}
                value={newItem.embeddedAppUrl || ''}
                onChange={(e) => setNewItem({ ...newItem, embeddedAppUrl: e.target.value })}
                placeholder="https://app.example.com"
                required
              />
              <Input
                label={t('admin.menuSettings.form.path')}
                value={newItem.path || ''}
                onChange={(e) => setNewItem({ ...newItem, path: e.target.value })}
                placeholder="/embedded/app"
                required
              />
            </>
          )}

          <IconPicker
            label={t('admin.menuSettings.form.icon')}
            value={newItem.icon || ''}
            onChange={(iconName) => setNewItem({ ...newItem, icon: iconName })}
          />
        </div>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        title={t('admin.menuSettings.confirmDeleteTitle')}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="error"
              onClick={handleConfirmDelete}
            >
              {t('common.delete')}
            </Button>
          </>
        }
      >
        <div className={themeClasses.spacing.spaceY4}>
          <p className={themeClasses.text.primary}>
            {t('admin.menuSettings.confirmDelete')}
          </p>
          {itemToDelete && (
            <div className={`${themeClasses.spacing.p4} ${themeClasses.utility.roundedLg} ${themeClasses.background.gray2}`}>
              <p className={`${themeClasses.typographySize.bodySmall} ${themeClasses.text.secondary}`}>
                {t('admin.menuSettings.deleteItemName')}: <span className={`font-medium ${themeClasses.text.primary}`}>{itemToDelete.label}</span>
              </p>
          </div>
          )}
        </div>
      </Modal>
    </AdminPageTemplate>
  );
};

export default MenuSettingsPage;

