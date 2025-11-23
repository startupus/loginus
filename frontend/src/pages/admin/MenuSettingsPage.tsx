import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Checkbox } from '../../design-system/primitives/Checkbox';
import { Modal } from '../../design-system/composites/Modal';
import { ErrorMessage } from '../../design-system/composites/ErrorMessage';
import { menuSettingsApi, MenuItemConfig, MenuSettings } from '../../services/api/menu-settings';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { useTheme } from '../../design-system/contexts';
import { useCurrentLanguage, buildPathWithLang } from '../../utils/routing';

// Компонент для сортируемого элемента меню
interface MenuItemProps {
  item: MenuItemConfig;
  onToggle: (id: string) => void;
  onEdit: (item: MenuItemConfig) => void;
  onDelete: (id: string) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onToggle, onEdit, onDelete }) => {
  const { t } = useTranslation();
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
    opacity: isDragging ? 0.5 : 1,
  };

  const isDefault = item.type === 'default';
  const canDelete = !isDefault; // Базовые пункты нельзя удалять

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 rounded-lg border ${
        isDragging ? 'border-primary shadow-lg' : themeClasses.border.default
      } ${themeClasses.background.surface}`}
    >
      {/* Иконка для перетаскивания - доступна для всех пунктов */}
      <div
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing ${themeClasses.text.secondary} hover:opacity-80 touch-none select-none`}
        style={{ touchAction: 'none', userSelect: 'none' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Icon name="grip-vertical" size="sm" />
      </div>

      {/* Иконка пункта меню */}
      {item.icon && (
        <Icon name={item.icon} size="sm" className={themeClasses.text.secondary} />
      )}

      {/* Название и тип */}
      <div className="flex-1">
        <div className={`font-medium ${themeClasses.text.primary}`}>{item.label || item.id}</div>
        <div className={`text-sm ${themeClasses.text.secondary}`}>
          {item.type === 'default' && t('menuSettings.type.default', 'Системный пункт')}
          {item.type === 'external' && t('menuSettings.type.external', 'Внешняя ссылка')}
          {item.type === 'iframe' && t('menuSettings.type.iframe', 'Iframe')}
          {item.type === 'embedded' && t('menuSettings.type.embedded', 'Встроенное приложение')}
          {item.path && ` • ${item.path}`}
        </div>
      </div>

      {/* Тумблер включения/выключения */}
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={item.enabled}
          onChange={() => onToggle(item.id)}
          label=""
        />
      </div>

      {/* Кнопки действий */}
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {!isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            leftIcon={<Icon name="edit" size="sm" />}
          >
            {t('common.edit', 'Редактировать')}
          </Button>
        )}
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            leftIcon={<Icon name="trash" size="sm" />}
            className={`${themeClasses.text.error} hover:opacity-80`}
          >
            {t('common.delete', 'Удалить')}
          </Button>
        )}
      </div>
    </div>
  );
};

const MenuSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const currentLang = useCurrentLanguage();
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItemConfig | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItemConfig | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItemConfig>>({
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

  // Мутация для обновления настроек
  const updateMutation = useMutation({
    mutationFn: (settings: MenuSettings) => menuSettingsApi.updateMenuSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-settings'] });
      queryClient.invalidateQueries({ queryKey: ['user-menu'] });
    },
  });

  const settings = settingsData?.data?.data;
  const items = settings?.items || [];

  // Обработка drag & drop
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

      updateMutation.mutate({ items: updatedItems }, {
        onError: (error) => {
          console.error('Ошибка при обновлении порядка:', error);
        },
      });
    }
  };

  // Переключение включения/выключения пункта
  const handleToggle = (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    updateMutation.mutate({ items: updatedItems });
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

  // Подтверждение удаления пункта
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    
    const updatedItems = items.filter((item) => item.id !== itemToDelete.id);
    // Обновляем порядок
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      order: index + 1,
    }));
    updateMutation.mutate({ items: reorderedItems });
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Открытие модального окна для редактирования (только для кастомных пунктов)
  const handleEdit = (item: MenuItemConfig) => {
    // Базовые пункты нельзя редактировать
    if (item.type === 'default') {
      return;
    }
    setEditingItem(item);
    setNewItem({ ...item });
    setIsAddModalOpen(true);
  };

  // Открытие модального окна для добавления
  const handleAdd = () => {
    setEditingItem(null);
    setNewItem({
      type: 'external',
      enabled: true,
      order: items.length + 1,
      id: `custom-${Date.now()}`,
      label: '',
      icon: '',
      path: undefined,
      externalUrl: '',
      openInNewTab: false,
      iframeUrl: undefined,
      iframeCode: undefined,
      embeddedAppUrl: undefined,
    });
    setIsAddModalOpen(true);
  };

  // Сохранение пункта меню
  const handleSave = () => {
    setErrorMessage(null);
    
    // Валидация обязательных полей в зависимости от типа
    if (!newItem.label || !newItem.label.trim()) {
      setErrorMessage(t('menuSettings.errors.requiredFields', 'Заполните все обязательные поля'));
      return;
    }

    if (!newItem.id) {
      setErrorMessage(t('menuSettings.errors.requiredFields', 'Заполните все обязательные поля'));
      return;
    }

    // Валидация для разных типов пунктов
    if (newItem.type === 'external') {
      if (!newItem.externalUrl || !newItem.externalUrl.trim()) {
        setErrorMessage(t('menuSettings.errors.requiredFields', 'Заполните все обязательные поля'));
        return;
      }
    } else if (newItem.type === 'iframe') {
      if (!newItem.path || !newItem.path.trim()) {
        setErrorMessage(t('menuSettings.errors.requiredFields', 'Заполните все обязательные поля'));
        return;
      }
      if (!newItem.iframeUrl && !newItem.iframeCode) {
        setErrorMessage(t('menuSettings.errors.iframeRequired', 'Заполните URL iframe или HTML код'));
        return;
      }
    } else if (newItem.type === 'embedded') {
      if (!newItem.embeddedAppUrl || !newItem.embeddedAppUrl.trim()) {
        setErrorMessage(t('menuSettings.errors.requiredFields', 'Заполните все обязательные поля'));
        return;
      }
      if (!newItem.path || !newItem.path.trim()) {
        setErrorMessage(t('menuSettings.errors.requiredFields', 'Заполните все обязательные поля'));
        return;
      }
    }

    // Формируем полный объект пункта меню
    const menuItem: MenuItemConfig = {
      id: newItem.id,
      type: newItem.type || 'external',
      enabled: newItem.enabled !== undefined ? newItem.enabled : true,
      order: editingItem ? editingItem.order : items.length + 1,
      label: newItem.label.trim(),
      icon: newItem.icon || undefined,
      path: newItem.path || undefined,
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

    updateMutation.mutate({ items: updatedItems }, {
      onSuccess: () => {
        setIsAddModalOpen(false);
        setEditingItem(null);
        setErrorMessage(null);
        setNewItem({
          type: 'external',
          enabled: true,
          order: 0,
        });
      },
      onError: (error) => {
        setErrorMessage(t('menuSettings.errors.saveError', 'Ошибка при сохранении. Попробуйте еще раз.'));
        console.error('Ошибка сохранения настроек меню:', error);
      },
    });
  };

  if (isLoading) {
    return (
      <AdminPageTemplate title={t('menuSettings.title', 'Настройки меню')} showSidebar={true}>
        <div className={themeClasses.state.loading}>
          <div className={themeClasses.state.loadingSpinner}>
            <Icon name="loader" size="lg" className="animate-spin text-primary mx-auto mb-4" />
            <p className={themeClasses.text.secondary}>
              {t('common.loading', 'Загрузка...')}
            </p>
          </div>
        </div>
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate
      title={t('menuSettings.title', 'Настройки меню')}
      showSidebar={true}
      headerActions={
        <Button
          variant="primary"
          leftIcon={<Icon name="plus" size="sm" />}
          onClick={handleAdd}
        >
          {t('menuSettings.addItem', 'Добавить пункт')}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Описание */}
        <div className={`p-4 rounded-lg ${themeClasses.card.default} ${themeClasses.border.default}`}>
          <p className={`text-sm ${themeClasses.text.secondary}`}>
            {t('menuSettings.description', 'Настройте порядок и видимость пунктов меню для страницы дашборда. Перетаскивайте пункты для изменения порядка, используйте переключатели для включения/выключения.')}
          </p>
        </div>

        {/* Список пунктов меню */}
        {items.length === 0 ? (
          <div className={themeClasses.state.empty}>
            <Icon name="menu" size="xl" className={`${themeClasses.text.secondary} mx-auto mb-3`} />
            <p className={themeClasses.text.secondary}>
              {t('menuSettings.noItems', 'Нет пунктов меню')}
            </p>
          </div>
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
              <div className="space-y-3">
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
          });
        }}
        title={editingItem ? t('menuSettings.editItem', 'Редактировать пункт') : t('menuSettings.addItem', 'Добавить пункт')}
      >
        <div className="space-y-4">
          {errorMessage && (
            <ErrorMessage error={errorMessage} />
          )}
          <Input
            label={t('menuSettings.form.label', 'Название')}
            value={newItem.label || ''}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
            required
          />

          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              {t('menuSettings.form.type', 'Тип пункта')}
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
              <option value="external">{t('menuSettings.type.external', 'Внешняя ссылка')}</option>
              <option value="iframe">{t('menuSettings.type.iframe', 'Iframe')}</option>
              <option value="embedded">{t('menuSettings.type.embedded', 'Встроенное приложение')}</option>
            </select>
          </div>

          {newItem.type === 'external' && (
            <>
              <Input
                label={t('menuSettings.form.externalUrl', 'URL')}
                value={newItem.externalUrl || ''}
                onChange={(e) => setNewItem({ ...newItem, externalUrl: e.target.value })}
                placeholder="https://example.com"
                required
              />
              <Checkbox
                checked={newItem.openInNewTab || false}
                onChange={(checked) => setNewItem({ ...newItem, openInNewTab: checked })}
                label={t('menuSettings.form.openInNewTab', 'Открывать в новой вкладке')}
              />
            </>
          )}

          {newItem.type === 'iframe' && (
            <>
              <Input
                label={t('menuSettings.form.iframeUrl', 'URL iframe')}
                value={newItem.iframeUrl || ''}
                onChange={(e) => setNewItem({ ...newItem, iframeUrl: e.target.value })}
                placeholder="https://example.com"
              />
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  {t('menuSettings.form.iframeCode', 'HTML код')}
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
                label={t('menuSettings.form.path', 'Путь')}
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
                label={t('menuSettings.form.embeddedAppUrl', 'URL приложения')}
                value={newItem.embeddedAppUrl || ''}
                onChange={(e) => setNewItem({ ...newItem, embeddedAppUrl: e.target.value })}
                placeholder="https://app.example.com"
                required
              />
              <Input
                label={t('menuSettings.form.path', 'Путь')}
                value={newItem.path || ''}
                onChange={(e) => setNewItem({ ...newItem, path: e.target.value })}
                placeholder="/embedded/app"
                required
              />
            </>
          )}

          <Input
            label={t('menuSettings.form.icon', 'Иконка')}
            value={newItem.icon || ''}
            onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
            placeholder="home"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingItem(null);
                setNewItem({
                  type: 'external',
                  enabled: true,
                  order: 0,
                });
              }}
            >
              {t('common.cancel', 'Отмена')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('common.save', 'Сохранить')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        title={t('menuSettings.confirmDeleteTitle', 'Подтверждение удаления')}
      >
        <div className="space-y-4">
          <p className={themeClasses.text.primary}>
            {t('menuSettings.confirmDelete', 'Вы уверены, что хотите удалить этот пункт меню?')}
          </p>
          {itemToDelete && (
            <div className={`p-3 rounded-lg ${themeClasses.background.gray2}`}>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                {t('menuSettings.deleteItemName', 'Пункт')}: <span className={`font-medium ${themeClasses.text.primary}`}>{itemToDelete.label}</span>
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
              }}
            >
              {t('common.cancel', 'Отмена')}
            </Button>
            <Button
              variant="error"
              onClick={handleConfirmDelete}
            >
              {t('common.delete', 'Удалить')}
            </Button>
          </div>
        </div>
      </Modal>
    </AdminPageTemplate>
  );
};

export default MenuSettingsPage;

