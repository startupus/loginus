import React, { useState, useEffect } from 'react';
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
import { Modal } from '../../design-system/composites/Modal';
import { ErrorMessage } from '../../design-system/composites/ErrorMessage';
import { LoadingState } from '../../design-system/composites/LoadingState';
import { EmptyState } from '../../design-system/composites/EmptyState';
import { paymentApi } from '../../services/api/payment';
import { themeClasses } from '../../design-system/utils/themeClasses';

// Интерфейс способа оплаты
export interface PaymentMethodConfig {
  id: string;
  type: 'card' | 'bank_account';
  bankName: string;
  lastFour?: string; // Последние 4 цифры карты
  accountNumber?: string; // Номер счета
  expiryDate?: string; // Срок действия карты (MM/YY)
  status: 'active' | 'inactive';
  order?: number;
}

// Компонент для сортируемого элемента способа оплаты
interface PaymentMethodItemProps {
  method: PaymentMethodConfig;
  onToggle: (id: string) => void;
  onEdit: (method: PaymentMethodConfig) => void;
  onDelete: (id: string) => void;
}

const PaymentMethodItem: React.FC<PaymentMethodItemProps> = ({ method, onToggle, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: method.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : method.status === 'active' ? 1 : 0.6,
  };

  const isActive = method.status === 'active';

  // Определение иконки в зависимости от типа
  const getIcon = () => {
    if (method.type === 'card') {
      return 'credit-card';
    }
    return 'building';
  };

  // Определение информации о способе оплаты
  const getMethodInfo = () => {
    if (method.type === 'card') {
      return method.lastFour ? `****${method.lastFour}` : t('admin.paymentMethods.card');
    }
    return method.accountNumber || t('admin.paymentMethods.bankAccount');
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap4} ${themeClasses.spacing.p4} ${themeClasses.utility.roundedLg} ${themeClasses.border.default} ${
        isDragging ? 'border-primary shadow-lg' : ''
      } ${
        isActive
          ? themeClasses.background.surface
          : themeClasses.background.iconContainer
      } ${themeClasses.utility.transitionAll}`}
    >
      {/* Иконка для перетаскивания */}
      <div
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing ${themeClasses.text.secondary} hover:opacity-80 touch-none select-none`}
        style={{ touchAction: 'none', userSelect: 'none' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Icon name="grip-vertical" size="sm" />
      </div>

      {/* Иконка типа способа оплаты */}
      <Icon 
        name={getIcon()} 
        size="sm" 
        className={isActive ? themeClasses.text.secondary : themeClasses.utility.opacity50}
      />

      {/* Информация о способе оплаты */}
      <div className={themeClasses.utility.flex1}>
        <div className={`font-medium ${isActive ? themeClasses.text.primary : themeClasses.utility.opacity60}`}>
          {method.bankName}
        </div>
        <div className={`${themeClasses.typographySize.bodySmall} ${isActive ? themeClasses.text.secondary : themeClasses.utility.opacity50}`}>
          {getMethodInfo()}
          {method.expiryDate && ` • ${method.expiryDate}`}
          {` • ${t(`admin.paymentMethods.type.${method.type === 'bank_account' ? 'bankAccount' : method.type}`)}`}
        </div>
      </div>

      {/* Кнопки действий */}
      <div className={`${themeClasses.utility.flexItemsCenter} ${themeClasses.spacing.gap2}`} onClick={(e) => e.stopPropagation()}>
        {/* Кнопка редактирования - только иконка */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(method);
          }}
          iconOnly
          aria-label={t('common.edit')}
        >
          <Icon name="edit" size="sm" />
        </Button>
        {/* Кнопка удаления - только иконка */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(method.id);
          }}
          iconOnly
          className={`${themeClasses.text.error} hover:opacity-80`}
          aria-label={t('common.delete')}
        >
          <Icon name="trash" size="sm" />
        </Button>
      </div>

      {/* Тумблер включения/выключения - всегда справа, последний элемент */}
      <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
        <Switch
          checked={isActive}
          onChange={() => onToggle(method.id)}
        />
      </div>
    </div>
  );
};

const PaymentMethodsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
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
          console.warn('[PaymentMethodsPage] Failed to load admin module:', error);
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
          console.warn('[PaymentMethodsPage] Failed to reload admin module on language change:', error);
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
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethodConfig | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);
  const [newMethod, setNewMethod] = useState<Partial<PaymentMethodConfig>>({
    type: 'card',
    status: 'active',
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

  // Загрузка способов оплаты
  const { data: methodsResponse, isLoading } = useQuery({
    queryKey: ['payment', 'methods'],
    queryFn: () => paymentApi.getMethods(),
  });

  // Примечание: все операции (добавление, редактирование, удаление, переключение) 
  // работают с мок-данными локально через queryClient.setQueryData без запросов на сервер

  const methods: PaymentMethodConfig[] = (methodsResponse?.data?.data || methodsResponse?.data || []) as PaymentMethodConfig[];

  // Обработка drag & drop (локальное обновление без запроса на сервер)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = methods.findIndex((method) => method.id === active.id);
    const newIndex = methods.findIndex((method) => method.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newMethods = arrayMove(methods, oldIndex, newIndex);
      // Обновляем порядок
      const updatedMethods = newMethods.map((method, index) => ({
        ...method,
        order: index + 1,
      }));

      // Обновляем локальное состояние через React Query без запроса на сервер
      queryClient.setQueryData(['payment', 'methods'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          data: updatedMethods,
        };
      });
    }
  };

  // Переключение включения/выключения способа оплаты (локальное обновление без запроса на сервер)
  const handleToggle = (id: string) => {
    const updatedMethods = methods.map((method) =>
      method.id === id 
        ? { ...method, status: method.status === 'active' ? 'inactive' : 'active' as const }
        : method
    );
    
    // Обновляем локальное состояние через React Query без запроса на сервер
    queryClient.setQueryData(['payment', 'methods'], (oldData: any) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        data: updatedMethods,
      };
    });
  };

  // Открытие модального окна подтверждения удаления
  const handleDeleteClick = (id: string) => {
    const method = methods.find((method) => method.id === id);
    setMethodToDelete(method || null);
    setIsDeleteModalOpen(true);
  };

  // Подтверждение удаления способа оплаты (локальное обновление без запроса на сервер)
  const handleConfirmDelete = () => {
    if (!methodToDelete) return;
    
    const updatedMethods = methods.filter((method) => method.id !== methodToDelete.id);
    // Обновляем порядок
    const reorderedMethods = updatedMethods.map((method, index) => ({
      ...method,
      order: index + 1,
    }));
    
    // Обновляем локальное состояние через React Query без запроса на сервер
    queryClient.setQueryData(['payment', 'methods'], (oldData: any) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        data: reorderedMethods,
      };
    });
    
    setIsDeleteModalOpen(false);
    setMethodToDelete(null);
  };

  // Открытие модального окна для редактирования
  const handleEdit = (method: PaymentMethodConfig) => {
    setEditingMethod(method);
    setNewMethod({ ...method });
    setIsAddModalOpen(true);
  };

  // Открытие модального окна для добавления
  const handleAdd = () => {
    setEditingMethod(null);
    setNewMethod({
      type: 'card',
      status: 'active',
      order: methods.length + 1,
      id: `payment-${Date.now()}`,
      bankName: '',
      lastFour: '',
      accountNumber: '',
      expiryDate: '',
    });
    setIsAddModalOpen(true);
  };

  // Сохранение способа оплаты
  const handleSave = () => {
    setErrorMessage(null);
    
    // Валидация обязательных полей
    if (!newMethod.bankName || !newMethod.bankName.trim()) {
      setErrorMessage(t('admin.paymentMethods.errors.bankNameRequired'));
      return;
    }

    // Валидация для карты
    if (newMethod.type === 'card') {
      if (!newMethod.lastFour || !newMethod.lastFour.trim()) {
        setErrorMessage(t('admin.paymentMethods.errors.lastFourRequired'));
        return;
      }
      if (newMethod.lastFour && !/^\d{4}$/.test(newMethod.lastFour)) {
        setErrorMessage(t('admin.paymentMethods.errors.lastFourInvalid'));
        return;
      }
    }

    // Валидация для банковского счета
    if (newMethod.type === 'bank_account') {
      if (!newMethod.accountNumber || !newMethod.accountNumber.trim()) {
        setErrorMessage(t('admin.paymentMethods.errors.accountNumberRequired'));
        return;
      }
    }

    // Формируем полный объект способа оплаты
    const paymentMethod: PaymentMethodConfig = {
      id: newMethod.id || `payment-${Date.now()}`,
      type: newMethod.type || 'card',
      status: (newMethod.status || 'active') as 'active' | 'inactive',
      order: editingMethod ? editingMethod.order : methods.length + 1,
      bankName: newMethod.bankName.trim(),
      lastFour: newMethod.type === 'card' ? newMethod.lastFour?.trim() : undefined,
      accountNumber: newMethod.type === 'bank_account' ? newMethod.accountNumber?.trim() : undefined,
      expiryDate: newMethod.expiryDate?.trim() || undefined,
    };

    let updatedMethods: PaymentMethodConfig[];

    if (editingMethod) {
      // Редактирование существующего способа оплаты
      updatedMethods = methods.map((method) =>
        method.id === editingMethod.id ? { ...paymentMethod, id: editingMethod.id } : method
      );
    } else {
      // Добавление нового способа оплаты
      updatedMethods = [...methods, paymentMethod];
      // Обновляем порядок
      updatedMethods = updatedMethods.map((method, index) => ({
        ...method,
        order: index + 1,
      }));
    }

    // Обновляем локальное состояние через React Query без запроса на сервер (мок-данные)
    queryClient.setQueryData(['payment', 'methods'], (oldData: any) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        data: updatedMethods,
      };
    });

    // Обновляем UI состояние
    setIsAddModalOpen(false);
    setEditingMethod(null);
    setErrorMessage(null);
    setNewMethod({
      type: 'card',
      status: 'active',
      order: 0,
    });
  };

  // Показываем loading если данные еще загружаются или модуль admin еще не загружен
  if (isLoading || !adminModuleLoaded) {
    return (
      <AdminPageTemplate title={t('admin.paymentMethods.title')} showSidebar={true}>
        <LoadingState text={t('common.loading')} />
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate
      title={t('admin.paymentMethods.title')}
      showSidebar={true}
    >
      <div className={themeClasses.spacing.spaceY6}>
        {/* Описание с кнопкой */}
        <div className={`${themeClasses.spacing.p4} ${themeClasses.utility.roundedLg} ${themeClasses.card.default} ${themeClasses.border.default}`}>
          <div className={`${themeClasses.utility.flexColSmRow} sm:items-center sm:justify-between ${themeClasses.spacing.gap4}`}>
            <p className={`${themeClasses.typographySize.bodySmall} ${themeClasses.utility.flex1} ${themeClasses.text.secondary}`}>
              {t('admin.paymentMethods.description')}
            </p>
            <div className="flex-shrink-0">
              <Button
                variant="primary"
                leftIcon={<Icon name="plus" size="sm" />}
                onClick={handleAdd}
                className={themeClasses.utility.wFullSmAuto}
              >
                {t('admin.paymentMethods.addMethod')}
              </Button>
            </div>
          </div>
        </div>

        {/* Список способов оплаты */}
        {methods.length === 0 ? (
          <EmptyState
            icon="credit-card"
            title={t('admin.paymentMethods.noMethods')}
            iconSize="xl"
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={methods.map((method) => method.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className={themeClasses.spacing.spaceY3}>
                {methods.map((method) => (
                  <PaymentMethodItem
                    key={method.id}
                    method={method}
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
          setEditingMethod(null);
          setErrorMessage(null);
          setNewMethod({
            type: 'card',
            status: 'active',
            order: 0,
          });
        }}
        title={editingMethod ? t('admin.paymentMethods.editMethod') : t('admin.paymentMethods.addMethod')}
      >
        <div className={themeClasses.spacing.spaceY4}>
          {errorMessage && (
            <ErrorMessage error={errorMessage} />
          )}
          
          <div>
            <label className={`block ${themeClasses.typographySize.bodySmall} font-medium ${themeClasses.spacing.mb2} ${themeClasses.text.primary}`}>
              {t('admin.paymentMethods.form.type')}
            </label>
            <select
              value={newMethod.type || 'card'}
              onChange={(e) => {
                const newType = e.target.value as 'card' | 'bank_account';
                setNewMethod({
                  ...newMethod,
                  type: newType,
                  lastFour: newType === 'card' ? newMethod.lastFour : undefined,
                  accountNumber: newType === 'bank_account' ? newMethod.accountNumber : undefined,
                });
                setErrorMessage(null);
              }}
              className={themeClasses.input.default}
            >
              <option value="card">{t('admin.paymentMethods.type.card')}</option>
              <option value="bank_account">{t('admin.paymentMethods.type.bankAccount')}</option>
            </select>
          </div>

          <Input
            label={t('admin.paymentMethods.form.bankName')}
            value={newMethod.bankName || ''}
            onChange={(e) => setNewMethod({ ...newMethod, bankName: e.target.value })}
            required
          />

          {newMethod.type === 'card' && (
            <>
              <Input
                label={t('admin.paymentMethods.form.lastFour')}
                value={newMethod.lastFour || ''}
                onChange={(e) => setNewMethod({ ...newMethod, lastFour: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="4242"
                maxLength={4}
                required
              />
              <Input
                label={t('admin.paymentMethods.form.expiryDate')}
                value={newMethod.expiryDate || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  const formatted = value.length >= 2 
                    ? `${value.slice(0, 2)}/${value.slice(2)}` 
                    : value;
                  setNewMethod({ ...newMethod, expiryDate: formatted });
                }}
                placeholder="12/25"
                maxLength={5}
              />
            </>
          )}

          {newMethod.type === 'bank_account' && (
            <Input
              label={t('admin.paymentMethods.form.accountNumber')}
              value={newMethod.accountNumber || ''}
              onChange={(e) => setNewMethod({ ...newMethod, accountNumber: e.target.value })}
              placeholder="****1234"
              required
            />
          )}

          <div className={`${themeClasses.utility.flex} ${themeClasses.utility.justifyBetween} ${themeClasses.spacing.gap3} ${themeClasses.spacing.pt4}`}>
            <Button
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingMethod(null);
                setNewMethod({
                  type: 'card',
                  status: 'active',
                  order: 0,
                });
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMethodToDelete(null);
        }}
        title={t('admin.paymentMethods.confirmDeleteTitle')}
      >
        <div className={themeClasses.spacing.spaceY4}>
          <p className={themeClasses.text.primary}>
            {t('admin.paymentMethods.confirmDelete')}
          </p>
          {methodToDelete && (
            <div className={`${themeClasses.spacing.p4} ${themeClasses.utility.roundedLg} ${themeClasses.background.gray2}`}>
              <p className={`${themeClasses.typographySize.bodySmall} ${themeClasses.text.secondary}`}>
                {t('admin.paymentMethods.deleteMethodName')}: <span className={`font-medium ${themeClasses.text.primary}`}>{methodToDelete.bankName}</span>
              </p>
            </div>
          )}
          <div className={`${themeClasses.utility.flex} ${themeClasses.utility.justifyBetween} ${themeClasses.spacing.gap3} ${themeClasses.spacing.pt4}`}>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setMethodToDelete(null);
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
          </div>
        </div>
      </Modal>
    </AdminPageTemplate>
  );
};

export default PaymentMethodsPage;

