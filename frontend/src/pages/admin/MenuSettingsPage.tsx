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
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
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
import { Select } from '../../design-system/primitives/Select';
import { Switch } from '../../design-system/composites/Switch';
import { Checkbox } from '../../design-system/primitives/Checkbox';
import { Modal } from '../../design-system/composites/Modal';
import { ErrorMessage } from '../../design-system/composites/ErrorMessage';
import { LoadingState } from '../../design-system/composites/LoadingState';
import { EmptyState } from '../../design-system/composites/EmptyState';
import { menuSettingsApi, MenuItemConfig } from '../../services/api/menu-settings';
import { apiClient } from '../../services/api/client';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { useCurrentLanguage } from '../../utils/routing';
import './MenuSettingsPage.css';
import { IconPicker } from '../../components/IconPicker/IconPicker';
import { Tabs } from '../../design-system/composites/Tabs';

// Интерфейс расширения (плагина)
interface Extension {
  id: string;
  slug: string;
  name: string;
  description?: string;
  version: string;
  extensionType: string;
  uiType?: string;
  enabled: boolean;
}

// Компонент для сортируемого элемента меню
interface MenuItemProps {
  item: MenuItemConfig;
  onToggle: (id: string) => void;
  onEdit: (item: MenuItemConfig) => void;
  onDelete: (id: string) => void;
  depth?: number; // Уровень вложенности для отступов
  overId?: string | null;
  dropPosition?: 'before' | 'after' | 'inside' | null;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  item, 
  onToggle, 
  onEdit, 
  onDelete, 
  depth = 0,
  overId,
  dropPosition,
}) => {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : item.enabled ? 1 : 0.6,
  };

  const isDefault = item.type === 'default';
  const canDelete = !isDefault; // Базовые пункты нельзя удалять
  const leftPadding = depth * 32; // 32px отступ на каждый уровень
  
  // Определяем показывать ли drop indicator
  const isDropTarget = overId === item.id;
  const showDropBefore = isDropTarget && dropPosition === 'before';
  const showDropAfter = isDropTarget && dropPosition === 'after';
  const showDropInside = isDropTarget && dropPosition === 'inside';

  return (
    <>
      {/* Drop indicator - линия сверху */}
      {showDropBefore && (
        <div 
          className="h-1 bg-blue-500 rounded-full mx-4 my-1 shadow-lg"
          style={{ marginLeft: `${leftPadding + 16}px` }}
        />
      )}

      <div
        ref={setNodeRef}
        data-menu-item-id={item.id}
        style={{...style, paddingLeft: `${leftPadding + 16}px`}}
        className={`${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap4} ${themeClasses.spacing.p4} ${themeClasses.utility.roundedLg} ${themeClasses.border.default} ${
          isDragging ? `${themeClasses.border.primary} ${themeClasses.card.shadow}` : ''
        } ${
          showDropInside ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950 ml-8' : ''
        } ${
          item.enabled
            ? themeClasses.background.surface
            : themeClasses.background.iconContainer
        } ${themeClasses.utility.transitionAll} relative`}
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
          {item.type === 'default' && t('admin.menuSettings.type.default') + ' (Плагин)'}
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
      <div className="ml-auto" onClick={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto', zIndex: 10 }}>
        <Switch
          checked={item.enabled}
          onChange={() => onToggle(item.id)}
        />
      </div>
    </div>

    {/* Drop indicator - линия снизу */}
    {showDropAfter && (
      <div 
        className="h-1 bg-blue-500 rounded-full mx-4 my-1 shadow-lg"
        style={{ marginLeft: `${leftPadding + 16}px` }}
      />
    )}
    
    {/* Рекурсивный рендеринг вложенных элементов с отдельным SortableContext */}
    {item.children && item.children.length > 0 && (
      <SortableContext
        items={item.children.map((child) => child.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={themeClasses.spacing.spaceY3} style={{ marginLeft: `${leftPadding}px` }}>
          {item.children.map((child) => (
            <MenuItem
              key={child.id}
              item={child}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
              overId={overId}
              dropPosition={dropPosition}
            />
          ))}
        </div>
      </SortableContext>
    )}
    </>
  );
};

const MenuSettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = useCurrentLanguage();
  const queryClient = useQueryClient();
  const [adminModuleLoaded, setAdminModuleLoaded] = useState(false);

  // Запрос списка установленных плагинов
  const { data: plugins = [] } = useQuery<Extension[]>({
    queryKey: ['extensions', 'enabled'],
    queryFn: async () => {
      try {
        // ✅ ИСПРАВЛЕНИЕ: Исключаем виджеты из списка плагинов для меню
        const response = await apiClient.get('/admin/extensions?enabled=true&excludeWidgets=true');
        // API возвращает { success: true, data: [...] }
        return Array.isArray(response.data?.data) ? response.data.data : [];
      } catch (error) {
        console.error('[MenuSettingsPage] Failed to fetch plugins:', error);
        return [];
      }
    },
  });

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
  const [selectedPluginId, setSelectedPluginId] = useState<string>('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);

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
    queryFn: async () => {
      const response = await menuSettingsApi.getMenuSettings();
      console.log('[MenuSettingsPage] 🔵 Loaded menu from backend:', {
        itemsCount: response?.data?.data?.items?.length || 0,
        itemIds: response?.data?.data?.items?.map((item: any) => item.id) || [],
      });
      return response;
    },
  });

  // Примечание: все операции (добавление, редактирование, удаление, переключение) 
  // работают с мок-данными локально через queryClient.setQueryData без запросов на сервер

  const settings = settingsData?.data?.data;
  const items = settings?.items || [];

  // Вспомогательная функция для синхронизации изменений с backend
  const persistMenu = useCallback(
    async (updatedItems: MenuItemConfig[]) => {
      try {
        console.log('[MenuSettingsPage] 🔵 Saving menu to backend:', {
          itemsCount: updatedItems.length,
          itemIds: updatedItems.map(item => item.id),
          itemsWithChildren: updatedItems.filter(item => item.children?.length).map(item => ({
            id: item.id,
            childrenCount: item.children?.length,
          })),
        });
        
        const response = await menuSettingsApi.updateMenuSettings({ items: updatedItems });
        
        console.log('[MenuSettingsPage] ✅ Menu saved successfully');
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[MenuSettingsPage] Menu settings updated successfully:', response);
        }
        // После успешного сохранения настроек меню инвалидируем кэш пользовательского меню,
        // чтобы левая панель в личном кабинете подтянула актуальные пункты
        await queryClient.invalidateQueries({ queryKey: ['user-menu'] });
        // Также инвалидируем кэш настроек меню для админки
        await queryClient.invalidateQueries({ queryKey: ['menu-settings'] });
        // Принудительно обновляем данные
        await queryClient.refetchQueries({ queryKey: ['user-menu'] });
      } catch (error) {
        console.error('[MenuSettingsPage] ❌ Failed to save menu:', error);
        if (process.env.NODE_ENV === 'development') {
          console.error('[MenuSettingsPage] Failed to persist menu settings:', error);
        }
        throw error; // Пробрасываем ошибку, чтобы можно было обработать её в вызывающем коде
      }
    },
    [queryClient],
  );

  // Функция генерации пути на основе родителя
  const generatePath = useCallback((label: string, parentId?: string): string => {
    // Транслитерация и замена пробелов на дефисы
    const transliterate = (str: string): string => {
      const ru: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };
      
      return str.toLowerCase().split('').map(char => ru[char] || char).join('');
    };
    
    const slug = transliterate(label)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    
    if (parentId) {
      const parent = items.find(m => m.id === parentId);
      if (parent && parent.path) {
        return `${parent.path}/${slug}`;
      }
    }
    
    return `/${slug}`;
  }, [items]);

  // Рекурсивно обновляем пути детей при изменении родителя
  const updateChildrenPaths = useCallback((parentId: string, itemsList: MenuItemConfig[]): MenuItemConfig[] => {
    return itemsList.map((item) => {
      // Проверяем, является ли данный пункт дочерним для parentId
      const isChild = item.children?.some((child: MenuItemConfig) => child.id === parentId);
      
      if (isChild && item.children) {
        // Обновляем детей рекурсивно
        const updatedChildren = item.children.map((child: MenuItemConfig) => {
          if (child.id === parentId) {
            // Пересчитываем путь
            const newPath = generatePath(child.label || child.id, item.id);
            return {
              ...child,
              path: newPath,
            };
          }
          return child;
        });
        
        return {
          ...item,
          children: updatedChildren,
        };
      }
      
      return item;
    });
  }, [generatePath]);

  // Функция проверки, можно ли вложить один пункт в другой
  const canBeNested = useCallback((draggedItem: MenuItemConfig, targetItem: MenuItemConfig): boolean => {
    // Нельзя вложить в себя
    if (draggedItem.id === targetItem.id) return false;
    
    // Нельзя вложить родителя в своего ребенка
    if (targetItem.children?.some((child: MenuItemConfig) => child.id === draggedItem.id)) {
      return false;
    }
    
    // Нельзя вложить, если target уже имеет родителя (ограничение глубины = 1)
    const targetHasParent = items.some((item) => 
      item.children?.some((child: MenuItemConfig) => child.id === targetItem.id)
    );
    if (targetHasParent) return false;
    
    // Нельзя вложить, если элемент уже имеет детей (ограничение: не больше 2 уровней)
    if (draggedItem.children && draggedItem.children.length > 0) {
      return false;
    }
    
    return true;
  }, [items]);

  // Обработка начала drag & drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    
    // Сохраняем начальную X позицию для определения горизонтального сдвига
    const activeRect = event.active.rect.current.initial;
    if (activeRect) {
      setDragStartX(activeRect.left);
    }
  };

  // Обработчик DragOver для определения позиции drop
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setOverId(null);
      setDropPosition(null);
      return;
    }

    setOverId(over.id as string);

    // Определяем позицию курсора относительно элемента
    const overElement = document.querySelector(`[data-menu-item-id="${over.id}"]`);
    if (!overElement) {
      setDropPosition(null);
      return;
    }

    const rect = overElement.getBoundingClientRect();
    
    // Используем active rect для вычисления позиции
    const activeRect = active.rect.current.translated;
    if (!activeRect) {
      setDropPosition(null);
      return;
    }
    
    const activeCenterY = activeRect.top + activeRect.height / 2;
    const currentX = activeRect.left;
    
    const overTop = rect.top;
    const overBottom = rect.bottom;
    const overHeight = rect.height;
    const overCenterY = overTop + overHeight / 2;
    const overLeft = rect.left;
    const overRight = rect.right;
    
    // КЛЮЧЕВОЕ ИЗМЕНЕНИЕ:
    // Считаем СДВИГ от начальной позиции для определения вложенности
    const horizontalDelta = currentX - dragStartX;
    const verticalOffset = activeCenterY - overCenterY;
    
    // Определяем, находится ли курсор в правой части элемента (для вложения)
    const overWidth = overRight - overLeft;
    const relativeX = currentX - overLeft;
    const isInRightPart = relativeX > overWidth * 0.6; // Правая 40% элемента

    console.log('[DnD] Position:', { 
      horizontalDelta: horizontalDelta.toFixed(0) + 'px',
      verticalOffset: verticalOffset.toFixed(0) + 'px',
      relativeX: relativeX.toFixed(0) + 'px',
      overWidth: overWidth.toFixed(0) + 'px',
      isInRightPart,
      currentX: currentX.toFixed(0),
      dragStartX: dragStartX.toFixed(0)
    });

    // НОВАЯ ЛОГИКА:
    // 1. ПРИОРИТЕТ: Если сдвинули ВПРАВО > 40px И курсор в правой части элемента → NEST (вложить)
    // 2. Если сдвинули ВЛЕВО < -20px → извлечь из вложенности (before/after на том же уровне)
    // 3. Если НЕТ горизонтального сдвига → вертикальное перемещение (before/after)

    if (horizontalDelta > 40 && isInRightPart) {
      // Сдвинут вправо от начальной позиции И курсор в правой части → попытка вложить
      const allItemsFlat = getAllItemsFlat(items);
      const activeItem = allItemsFlat.find((item) => item.id === active.id);
      const overItem = allItemsFlat.find((item) => item.id === over.id);
      
      if (activeItem && overItem && canBeNested(activeItem, overItem)) {
        setDropPosition('inside');
        return;
      } else {
        // Не можем вложить → вставляем после
        setDropPosition('after');
        return;
      }
    }

    // Если сдвинули влево → извлечение из вложенности (вертикальное перемещение)
    // Если НЕТ горизонтального сдвига → вертикальное перемещение
    if (activeCenterY < overCenterY) {
      // Курсор выше центра элемента → вставить ПЕРЕД
      setDropPosition('before');
    } else {
      // Курсор ниже центра элемента → вставить ПОСЛЕ
      setDropPosition('after');
    }
  };

  // Вспомогательная функция для получения плоского списка всех элементов (включая вложенные)
  const getAllItemsFlat = useCallback((itemsList: MenuItemConfig[]): MenuItemConfig[] => {
    const result: MenuItemConfig[] = [];
    const traverse = (items: MenuItemConfig[]) => {
      for (const item of items) {
        result.push(item);
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      }
    };
    traverse(itemsList);
    return result;
  }, []);

  // Вспомогательная функция для поиска родителя элемента
  const findParent = useCallback((itemId: string, itemsList: MenuItemConfig[]): MenuItemConfig | null => {
    for (const item of itemsList) {
      if (item.children) {
        if (item.children.some(child => child.id === itemId)) {
          return item;
        }
        const found = findParent(itemId, item.children);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Вспомогательная функция для удаления элемента из вложенности
  const removeFromNesting = useCallback((itemId: string, itemsList: MenuItemConfig[]): MenuItemConfig[] => {
    return itemsList.map(item => {
      if (item.children) {
        const childIndex = item.children.findIndex(child => child.id === itemId);
        if (childIndex !== -1) {
          // Найден элемент в children - удаляем его
          const removedChild = item.children[childIndex];
          const newChildren = item.children.filter(child => child.id !== itemId);
          return {
            ...item,
            children: newChildren.length > 0 ? newChildren : undefined,
          };
        }
        // Рекурсивно ищем в children
        return {
          ...item,
          children: removeFromNesting(itemId, item.children),
        };
      }
      return item;
    });
  }, []);

  // Обработка drag & drop с поддержкой вложенности
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Сбрасываем состояние
    setActiveId(null);
    setOverId(null);
    setDropPosition(null);
    setDragStartX(0);

    if (!over || active.id === over.id) {
      return;
    }

    const allItemsFlat = getAllItemsFlat(items);
    const activeItem = allItemsFlat.find((item) => item.id === active.id);
    const overItem = allItemsFlat.find((item) => item.id === over.id);

    if (!activeItem) {
      console.warn('[MenuSettingsPage] handleDragEnd: activeItem not found', { activeId: active.id });
      return;
    }

    if (!overItem) {
      console.warn('[MenuSettingsPage] handleDragEnd: overItem not found', { overId: over.id });
      return;
    }

    // Функция для глубокого копирования элемента (без children для вложенных)
    const cloneItem = (item: MenuItemConfig, removeChildren: boolean = false): MenuItemConfig => {
      const cloned = { ...item };
      if (removeChildren) {
        delete cloned.children;
      }
      return cloned;
    };

    // Функция для рекурсивного удаления элемента из структуры
    const removeItemRecursively = (itemsList: MenuItemConfig[], itemId: string): MenuItemConfig[] => {
      return itemsList
        .filter(item => item.id !== itemId)
        .map(item => {
          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: removeItemRecursively(item.children, itemId),
            };
          }
          return item;
        });
    };

    // Функция для добавления элемента в children родителя (рекурсивно)
    const addToParent = (itemsList: MenuItemConfig[], parentId: string, childItem: MenuItemConfig): MenuItemConfig[] => {
      return itemsList.map(item => {
        if (item.id === parentId) {
          const existingChildren = item.children || [];
          const newPath = generatePath(childItem.label || childItem.id, parentId);
          return {
            ...item,
            children: [
              ...existingChildren,
              {
                ...cloneItem(childItem, true), // Убираем children при вложении
                path: newPath,
                order: existingChildren.length + 1,
              },
            ],
          };
        }
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: addToParent(item.children, parentId, childItem),
          };
        }
        return item;
      });
    };

    // Функция для рекурсивной вставки элемента до/после другого элемента
    const insertItemRecursively = (
      itemsList: MenuItemConfig[], 
      targetId: string, 
      itemToInsert: MenuItemConfig, 
      position: 'before' | 'after'
    ): MenuItemConfig[] => {
      const result: MenuItemConfig[] = [];
      
      for (const item of itemsList) {
        if (item.id === targetId) {
          // Найден целевой элемент
          if (position === 'before') {
            result.push(cloneItem(itemToInsert, true)); // Извлекаем из вложенности
            result.push(item);
          } else {
            result.push(item);
            result.push(cloneItem(itemToInsert, true)); // Извлекаем из вложенности
          }
        } else {
          // Обычный элемент - проверяем children
          if (item.children && item.children.length > 0) {
            result.push({
              ...item,
              children: insertItemRecursively(item.children, targetId, itemToInsert, position),
            });
          } else {
            result.push(item);
          }
        }
      }
      
      return result;
    };

    let updatedItems: MenuItemConfig[];

    // ВАЖНО: Сначала удаляем активный элемент из текущей позиции
    updatedItems = removeItemRecursively(items, activeItem.id);

    // Проверяем, что элемент действительно был удален
    const checkAfterRemove = getAllItemsFlat(updatedItems);
    if (checkAfterRemove.find(item => item.id === activeItem.id)) {
      console.error('[MenuSettingsPage] Failed to remove active item!');
      return; // Не продолжаем, если элемент не был удален
    }

    // Применяем действие в зависимости от dropPosition
    if (dropPosition === 'inside' && overItem) {
      // Вложить внутрь overItem
      console.log('[MenuSettingsPage] Nesting item inside', { activeId: activeItem.id, overId: overItem.id });
      updatedItems = addToParent(updatedItems, overItem.id, activeItem);
    } else if (dropPosition === 'before' && overItem) {
      // Вставить перед overItem (извлекаем из вложенности, если был вложен)
      console.log('[MenuSettingsPage] Inserting before', { activeId: activeItem.id, overId: overItem.id });
      updatedItems = insertItemRecursively(updatedItems, overItem.id, activeItem, 'before');
    } else if (dropPosition === 'after' && overItem) {
      // Вставить после overItem (извлекаем из вложенности, если был вложен)
      console.log('[MenuSettingsPage] Inserting after', { activeId: activeItem.id, overId: overItem.id });
      updatedItems = insertItemRecursively(updatedItems, overItem.id, activeItem, 'after');
    } else {
      // Fallback: вставляем в конец корневого списка (извлекаем из вложенности)
      console.log('[MenuSettingsPage] Fallback: appending to end', { activeId: activeItem.id });
      updatedItems = [...updatedItems, cloneItem(activeItem, true)];
    }

    // Проверяем, что элемент присутствует в результате
    const checkAfterInsert = getAllItemsFlat(updatedItems);
    if (!checkAfterInsert.find(item => item.id === activeItem.id)) {
      console.error('[MenuSettingsPage] Item was lost during drag! Restoring...');
      // Восстанавливаем элемент в конец списка
      updatedItems = [...updatedItems, cloneItem(activeItem, true)];
    }

    // Обновляем порядок для всех корневых элементов и их children
    const updateOrderRecursively = (itemsList: MenuItemConfig[], startOrder: number = 1): MenuItemConfig[] => {
      return itemsList.map((item, index) => {
        const order = startOrder + index;
        const updatedItem: MenuItemConfig = {
          ...item,
          order,
        };
        
        // Рекурсивно обновляем порядок children
        if (item.children && item.children.length > 0) {
          updatedItem.children = item.children.map((child, childIndex) => ({
            ...child,
            order: childIndex + 1,
          }));
        }
        
        return updatedItem;
      });
    };

    updatedItems = updateOrderRecursively(updatedItems);

    // Обновляем пути для всех элементов после перемещения
    const updatePathsRecursively = (itemsList: MenuItemConfig[], parentId?: string): MenuItemConfig[] => {
      return itemsList.map(item => {
        const newPath = generatePath(item.label || item.id, parentId);
        const updatedItem: MenuItemConfig = {
          ...item,
          path: newPath,
        };
        
        // Рекурсивно обновляем пути children
        if (item.children && item.children.length > 0) {
          updatedItem.children = updatePathsRecursively(item.children, item.id);
        }
        
        return updatedItem;
      });
    };

    updatedItems = updatePathsRecursively(updatedItems);

    // Обновляем локальное состояние
    queryClient.setQueryData(['menu-settings'], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: {
          ...oldData.data,
          data: { items: updatedItems },
        },
      };
    });
    
    // Сохраняем на бэкенде
    void persistMenu(updatedItems);
  };

  // Переключение включения/выключения пункта (локальное обновление без запроса на сервер)
  const handleToggle = (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item,
    );

    // Оптимистично обновляем локальное состояние
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

    // Сохраняем изменения на бэкенде (фоново)
    void persistMenu(updatedItems);
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
    
    // Рекурсивная функция для удаления элемента и из children
    const deleteRecursively = (itemsList: MenuItemConfig[], idToDelete: string): MenuItemConfig[] => {
      return itemsList
        .filter((item) => item.id !== idToDelete)
        .map((item) => {
          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: deleteRecursively(item.children, idToDelete),
            };
          }
          return item;
        });
    };

    const updatedItems = deleteRecursively(items, itemToDelete.id);
    // Обновляем порядок
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    // Оптимистично обновляем локальное состояние
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

    // Сохраняем изменения на бэкенде (фоново)
    void persistMenu(reorderedItems);

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
      path: item.path || '', // Извлекаем path
    };
    setNewItem(itemWithTranslations);
    setIsAddModalOpen(true);
  };

  // Обработчик выбора плагина
  const handlePluginSelect = useCallback((pluginId: string) => {
    setSelectedPluginId(pluginId);
    
    if (!pluginId) {
      // Если плагин не выбран, оставляем текущее состояние
      setNewItem(prev => ({
        ...prev,
        pluginId: undefined,
      }));
      return;
    }

    const plugin = plugins.find(p => p.id === pluginId);
    if (!plugin) return;

    setNewItem(prev => {
      // Сохраняем текущий тип, если он уже выбран (iframe или embedded)
      // Иначе определяем тип на основе uiType плагина
      const currentType = prev.type;
      let type: MenuItemConfig['type'] = currentType;
      let path = '';
      let iframeUrl = '';
      let embeddedAppUrl = '';

      // Генерируем URL на основе baseUrl и entrypoint из конфигурации плагина
      const baseUrl = plugin.config?.baseUrl || `/uploads/plugins/${plugin.slug}`;
      const entrypoint = plugin.config?.entrypoint || 'index.html';
      const fullUrl = `${window.location.origin}${baseUrl}/${entrypoint}`;

      // Если тип еще не выбран или это default, определяем по uiType плагина
      if (!currentType || currentType === 'default') {
        if (plugin.uiType === 'iframe') {
          type = 'iframe';
          path = `/${plugin.slug}`;
          iframeUrl = fullUrl;
        } else if (plugin.uiType === 'embedded') {
          type = 'embedded';
          path = `/${plugin.slug}`;
          embeddedAppUrl = fullUrl;
        } else if (plugin.uiType === 'external_link') {
          type = 'external';
        } else {
          type = 'default';
          path = `/${plugin.slug}`;
        }
      } else {
        // Если тип уже выбран (iframe или embedded), используем его и заполняем соответствующие поля
        if (currentType === 'iframe') {
          path = `/${plugin.slug}`;
          iframeUrl = fullUrl;
        } else if (currentType === 'embedded') {
          path = `/${plugin.slug}`;
          embeddedAppUrl = fullUrl;
        } else {
          path = `/${plugin.slug}`;
        }
      }

      return {
        ...prev,
        type,
        path,
        pluginId, // Сохраняем ID плагина
        icon: plugin.icon || prev.icon,
        iframeUrl: type === 'iframe' ? iframeUrl : prev.iframeUrl, // Сохраняем существующий если тип не iframe
        embeddedAppUrl: type === 'embedded' ? embeddedAppUrl : prev.embeddedAppUrl, // Сохраняем существующий если тип не embedded
        // Автозаполняем название из имени плагина, если еще не заполнено
        labelRu: (prev as any).labelRu || plugin.name,
        labelEn: (prev as any).labelEn || plugin.manifest?.displayNameEn || plugin.name,
        label: (prev as any).label || plugin.name,
      };
    });
  }, [plugins]);

  // Открытие модального окна для добавления
  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setSelectedPluginId(''); // Сброс выбранного плагина
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
      externalUrl: undefined,
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
    // ВАЖНО: Для системных элементов сохраняем оригинальный путь, если новый путь не указан
    const menuItem: MenuItemConfig & { labelRu?: string; labelEn?: string } = {
      id: isSystemItem ? editingItem.id : (newItem.id || `custom-${Date.now()}`),
      type: isSystemItem ? editingItem.type : (newItem.type || 'external'),
      enabled: newItem.enabled !== undefined ? newItem.enabled : true,
      order: editingItem ? editingItem.order : items.length + 1,
      label: finalLabel, // Основной label для обратной совместимости
      labelRu: labelRu.trim() || undefined,
      labelEn: labelEn.trim() || undefined,
      icon: newItem.icon || undefined,
      // ВАЖНО: Для системных элементов сохраняем оригинальный путь, если новый путь не указан
      // Для кастомных элементов используем новый путь или undefined
      path: isSystemItem 
        ? (newItem.path && newItem.path.trim() ? newItem.path.trim() : editingItem?.path)
        : (newItem.path && newItem.path.trim() ? newItem.path.trim() : undefined),
      systemId: isSystemItem ? editingItem.systemId : undefined,
      pluginId: newItem.pluginId || undefined, // Сохраняем ID связанного плагина
      externalUrl: newItem.externalUrl || undefined,
      openInNewTab: newItem.openInNewTab || false,
      // ВАЖНО: Если есть код, очищаем URL (код имеет приоритет)
      iframeUrl: newItem.iframeCode ? undefined : (newItem.iframeUrl || undefined),
      iframeCode: newItem.iframeCode || undefined,
      embeddedAppUrl: newItem.embeddedAppUrl || undefined,
      // ВАЖНО: Сохраняем children для системных элементов, если они есть
      children: isSystemItem && editingItem?.children ? editingItem.children : undefined,
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

    // Оптимистично обновляем локальное состояние
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

    // Сохраняем изменения на бэкенде (фоново)
    void persistMenu(updatedItems);

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
        {/* Инструкция по Drag-and-Drop */}
        <div className={`${themeClasses.spacing.p4} ${themeClasses.utility.roundedLg} ${themeClasses.card.default} ${themeClasses.border.default} bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800`}>
          <div className={`${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap3}`}>
            <Icon name="info" size="sm" className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <p className={`text-sm font-medium text-blue-900 dark:text-blue-100`}>
                {t('admin.menuSettings.dnd.title', 'Как использовать перетаскивание:')}
              </p>
              <ul className={`text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1`}>
                <li>• <strong>{t('admin.menuSettings.dnd.vertical', 'Вертикальное перетаскивание (↑↓)')}</strong> → {t('admin.menuSettings.dnd.verticalDesc', 'Поменять местами (выше/ниже)')}</li>
                <li>• <strong>{t('admin.menuSettings.dnd.horizontal', 'Горизонтальное перетаскивание (→)')}</strong> → {t('admin.menuSettings.dnd.horizontalDesc', 'Сделать вложенным (перетащите вправо)')}</li>
              </ul>
            </div>
          </div>
        </div>

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
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={getAllItemsFlat(items).map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className={themeClasses.spacing.spaceY3}>
                {items
                  .filter((item) => {
                    // Показываем только элементы верхнего уровня
                    // Проверяем, не является ли этот элемент child другого элемента
                    const isChild = items.some((parent) => 
                      parent.children?.some((child) => child.id === item.id)
                    );
                    return !isChild;
                  })
                  .map((item) => (
                    <MenuItem
                      key={item.id}
                      item={item}
                      onToggle={handleToggle}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      depth={0}
                      overId={overId}
                      dropPosition={dropPosition}
                    />
                  ))}
              </div>
            </SortableContext>
            
            {/* DragOverlay для визуальной подсказки */}
            <DragOverlay>
              {activeId ? (
                <div className={`${themeClasses.spacing.p4} ${themeClasses.utility.roundedLg} ${themeClasses.border.default} ${themeClasses.background.surface} ${themeClasses.card.shadow} opacity-80`}>
                  <div className={`${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap4}`}>
                    <Icon name="grip-vertical" size="sm" className={themeClasses.text.secondary} />
                    {items.find((item) => item.id === activeId)?.label || 'Перетаскиваемый элемент'}
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Модальное окно для добавления/редактирования */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
          setSelectedPluginId(''); // Сброс выбранного плагина
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
                setSelectedPluginId(''); // Сброс выбранного плагина
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

          {/* Выбор плагина (только для iframe и embedded, не для external) */}
          {!editingItem && (newItem.type === 'iframe' || newItem.type === 'embedded') && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                {t('admin.menuSettings.form.plugin', 'Плагин')}
              </label>
              <Select
                value={selectedPluginId}
                onChange={(e) => handlePluginSelect(e.target.value)}
                options={[
                  { value: '', label: t('admin.menuSettings.form.pluginNone', 'Без плагина (ручная настройка)') },
                  ...plugins.map(plugin => ({
                    value: plugin.id,
                    label: `${plugin.name} (${plugin.extensionType})`,
                  })),
                ]}
              />
              <p className={`text-xs mt-1 ${themeClasses.text.secondary}`}>
                {t('admin.menuSettings.form.pluginHelperText', 'Выберите плагин для автозаполнения настроек')}
              </p>
            </div>
          )}

          {/* Для системных пунктов тип и id нельзя менять */}
          {editingItem && editingItem.type === 'default' ? (
            <>
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
              {/* Поле пути для плагинов */}
              <Input
                label={t('admin.menuSettings.form.path')}
                value={newItem.path || ''}
                onChange={(e) => setNewItem({ ...newItem, path: e.target.value })}
                placeholder="/plugin/custom"
                helperText={t('admin.menuSettings.form.pathHelperText', 'Путь в меню (например: /plugin/analytics)')}
              />
            </>
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
                label={t('admin.menuSettings.form.path')}
                value={newItem.path || ''}
                onChange={(e) => setNewItem({ ...newItem, path: e.target.value })}
                placeholder="/external/link"
                helperText={t('admin.menuSettings.form.pathHelperText', 'Путь в меню (например: /external/gosuslugi)')}
                required
              />
              <Input
                label={t('admin.menuSettings.form.externalUrl', 'Внешний URL')}
                value={newItem.externalUrl || ''}
                onChange={(e) => setNewItem({ ...newItem, externalUrl: e.target.value })}
                placeholder="https://example.com"
                helperText={t('admin.menuSettings.form.externalUrlHelperText', 'URL внешнего сайта для перенаправления')}
                required
              />
              <Checkbox
                checked={newItem.openInNewTab || false}
                onChange={(checked) => setNewItem({ ...newItem, openInNewTab: checked })}
                label={t('admin.menuSettings.form.openInNewTab', 'Открыть в новой вкладке')}
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
                label={t('admin.menuSettings.form.embeddedAppUrl', 'URL приложения')}
                value={newItem.embeddedAppUrl || ''}
                onChange={(e) => setNewItem({ ...newItem, embeddedAppUrl: e.target.value })}
                placeholder="https://example.com или /uploads/plugins/app/index.html"
                helperText={t('admin.menuSettings.form.embeddedAppUrlHelperText', 'URL встроенного приложения (использует ту же логику что и iframe, но без поддержки HTML кода)')}
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

