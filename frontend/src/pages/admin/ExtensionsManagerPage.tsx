import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '../../design-system/layouts/PageTemplate/PageTemplate';
import { Input } from '../../design-system/primitives/Input/Input';
import { Select } from '../../design-system/primitives/Select/Select';
import { Button } from '../../design-system/primitives/Button/Button';
import { Card } from '../../design-system/primitives/Card/Card';
import { Badge } from '../../design-system/primitives/Badge/Badge';
import { Modal } from '../../design-system/composites/Modal/Modal';
import { apiClient } from '../../services/api/client';
import './ExtensionsManagerPage.css';

// Типы расширений
export enum ExtensionType {
  PLUGIN = 'plugin',
  WIDGET = 'widget',
  MENU_ITEM = 'menu_item',
  AUTH = 'auth',
  PAYMENT = 'payment',
  SYSTEM = 'system',
  CONTENT = 'content',
  API = 'api',
}

// Типы UI
export enum UiType {
  NONE = 'none',
  IFRAME = 'iframe',
  EMBEDDED = 'embedded',
  EXTERNAL_LINK = 'external_link',
}

// Интерфейс расширения
export interface Extension {
  id: string;
  slug: string;
  name: string;
  description?: string;
  version: string;
  author?: string;
  authorEmail?: string;
  authorUrl?: string;
  extensionType: ExtensionType;
  uiType?: UiType;
  icon?: string;
  pathOnDisk: string;
  manifest?: Record<string, any>;
  config?: Record<string, any>;
  subscribedEvents?: string[];
  enabled: boolean;
  installedAt: Date;
  updatedAt: Date;
  createdAt: Date;
}

const ExtensionsManagerPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Состояния для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ExtensionType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('name');

  // Модальные окна
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; extension?: Extension }>({
    isOpen: false,
  });
  const [configModal, setConfigModal] = useState<{ isOpen: boolean; extension?: Extension }>({
    isOpen: false,
  });

  // Запрос списка расширений
  const { data: extensions = [], isLoading } = useQuery<Extension[]>({
    queryKey: ['extensions', filterType, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus === 'enabled') params.append('enabled', 'true');
      if (filterStatus === 'disabled') params.append('enabled', 'false');

      const response = await apiClient.get(`/admin/extensions?${params.toString()}`);
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    },
  });

  // Мутации
  const enableMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/admin/extensions/${id}/enable`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] });
    },
  });

  const disableMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/admin/extensions/${id}/disable`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/extensions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] });
      setDeleteModal({ isOpen: false });
    },
  });

  // Фильтрация и сортировка
  const filteredExtensions = useMemo(() => {
    let result = [...extensions];

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (ext) =>
          ext.name.toLowerCase().includes(query) ||
          ext.description?.toLowerCase().includes(query) ||
          ext.slug.toLowerCase().includes(query),
      );
    }

    // Сортировка
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        return new Date(b.installedAt).getTime() - new Date(a.installedAt).getTime();
      } else if (sortBy === 'status') {
        return a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1;
      }
      return 0;
    });

    return result;
  }, [extensions, searchQuery, sortBy]);

  // Обработчики
  const handleToggleStatus = (extension: Extension) => {
    if (extension.enabled) {
      disableMutation.mutate(extension.id);
    } else {
      enableMutation.mutate(extension.id);
    }
  };

  const handleDelete = () => {
    if (deleteModal.extension) {
      deleteMutation.mutate(deleteModal.extension.id);
    }
  };

  // Опции для Select
  const typeOptions = [
    { value: 'all', label: t('admin.extensions.type.all', 'Все типы') },
    { value: ExtensionType.WIDGET, label: t('admin.extensions.type.widget', 'Виджеты') },
    { value: ExtensionType.MENU_ITEM, label: t('admin.extensions.type.menu_item', 'Пункты меню') },
    { value: ExtensionType.PAYMENT, label: t('admin.extensions.type.payment', 'Оплата') },
    { value: ExtensionType.AUTH, label: t('admin.extensions.type.auth', 'Аутентификация') },
    { value: ExtensionType.SYSTEM, label: t('admin.extensions.type.system', 'Система') },
    { value: ExtensionType.CONTENT, label: t('admin.extensions.type.content', 'Контент') },
    { value: ExtensionType.API, label: t('admin.extensions.type.api', 'API') },
  ];

  const statusOptions = [
    { value: 'all', label: t('admin.extensions.status.all', 'Все') },
    { value: 'enabled', label: t('admin.extensions.status.enabled', 'Включено') },
    { value: 'disabled', label: t('admin.extensions.status.disabled', 'Выключено') },
  ];

  const sortOptions = [
    { value: 'name', label: t('admin.extensions.sort.name', 'По имени') },
    { value: 'date', label: t('admin.extensions.sort.date', 'По дате установки') },
    { value: 'status', label: t('admin.extensions.sort.status', 'По статусу') },
  ];

  return (
    <PageTemplate title={t('admin.extensions.title', 'Менеджер расширений')}>
      <div className="extensions-manager">
        {/* Фильтры и поиск */}
        <div className="extensions-manager__filters">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.extensions.search', 'Поиск расширений...')}
            icon="search"
          />
          <Select
            label={t('admin.extensions.filterType', 'Тип')}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ExtensionType | 'all')}
            options={typeOptions}
          />
          <Select
            label={t('admin.extensions.filterStatus', 'Статус')}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'enabled' | 'disabled')}
            options={statusOptions}
          />
          <Select
            label={t('admin.extensions.sortBy', 'Сортировать')}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'status')}
            options={sortOptions}
          />
        </div>

        {/* Список расширений */}
        {isLoading ? (
          <div className="extensions-manager__loading">
            {t('admin.extensions.loading', 'Загрузка...')}
          </div>
        ) : filteredExtensions.length === 0 ? (
          <div className="extensions-manager__empty">
            <p>{t('admin.extensions.noExtensions', 'Расширения не найдены')}</p>
          </div>
        ) : (
          <div className="extensions-manager__grid">
            {filteredExtensions.map((extension) => (
              <Card key={extension.id} className="extension-card">
                <div className="extension-card__header">
                  <div className="extension-card__icon">
                    {extension.icon ? (
                      <img src={extension.icon} alt={extension.name} />
                    ) : (
                      <div className="extension-card__icon-placeholder">
                        {extension.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="extension-card__info">
                    <h3 className="extension-card__name">{extension.name}</h3>
                    <p className="extension-card__version">v{extension.version}</p>
                  </div>
                  <Badge
                    variant={extension.enabled ? 'success' : 'gray'}
                  >
                    {extension.enabled
                      ? t('admin.extensions.status.enabled', 'Включено')
                      : t('admin.extensions.status.disabled', 'Выключено')}
                  </Badge>
                </div>

                {extension.description && (
                  <p className="extension-card__description">{extension.description}</p>
                )}

                <div className="extension-card__meta">
                  <span className="extension-card__type">
                    {t(`admin.extensions.type.${extension.extensionType}`, extension.extensionType)}
                  </span>
                  {extension.author && (
                    <span className="extension-card__author">
                      {t('admin.extensions.by', 'от')} {extension.author}
                    </span>
                  )}
                </div>

                <div className="extension-card__actions">
                  <Button
                    variant={extension.enabled ? 'secondary' : 'primary'}
                    size="small"
                    onClick={() => handleToggleStatus(extension)}
                    disabled={enableMutation.isPending || disableMutation.isPending}
                  >
                    {extension.enabled
                      ? t('admin.extensions.disable', 'Выключить')
                      : t('admin.extensions.enable', 'Включить')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setConfigModal({ isOpen: true, extension })}
                  >
                    {t('admin.extensions.configure', 'Настроить')}
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => setDeleteModal({ isOpen: true, extension })}
                  >
                    {t('admin.extensions.delete', 'Удалить')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Модальное окно удаления */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false })}
          title={t('admin.extensions.deleteModal.title', 'Удалить расширение?')}
        >
          <p>
            {t(
              'admin.extensions.deleteModal.message',
              'Вы уверены, что хотите удалить расширение',
            )}{' '}
            <strong>{deleteModal.extension?.name}</strong>?
          </p>
          <p>
            {t(
              'admin.extensions.deleteModal.warning',
              'Это действие нельзя отменить. Все данные расширения будут удалены.',
            )}
          </p>
          <div className="modal__actions">
            <Button variant="secondary" onClick={() => setDeleteModal({ isOpen: false })}>
              {t('common.cancel', 'Отмена')}
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {t('admin.extensions.delete', 'Удалить')}
            </Button>
          </div>
        </Modal>

        {/* Модальное окно настройки */}
        <Modal
          isOpen={configModal.isOpen}
          onClose={() => setConfigModal({ isOpen: false })}
          title={t('admin.extensions.configModal.title', 'Настройки расширения')}
        >
          <p>
            {t('admin.extensions.configModal.name', 'Расширение')}:{' '}
            <strong>{configModal.extension?.name}</strong>
          </p>
          <p>{t('admin.extensions.configModal.comingSoon', 'Раздел в разработке')}</p>
          <div className="modal__actions">
            <Button variant="secondary" onClick={() => setConfigModal({ isOpen: false })}>
              {t('common.close', 'Закрыть')}
            </Button>
          </div>
        </Modal>
      </div>
    </PageTemplate>
  );
};

export default ExtensionsManagerPage;

