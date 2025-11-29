import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '../../design-system/layouts/PageTemplate/PageTemplate';
import { Input } from '../../design-system/primitives/Input/Input';
import { Select } from '../../design-system/primitives/Select/Select';
import { Button } from '../../design-system/primitives/Button/Button';
import { Card } from '../../design-system/primitives/Card/Card';
import { Icon } from '../../design-system/primitives/Icon';
import { apiClient } from '../../services/api/client';
import { ExtensionType } from './ExtensionsManagerPage';
import './PluginsUploadPage.css';

const PluginsUploadPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    extensionType: ExtensionType.PLUGIN,
    enabled: false,
    file: null as File | null,
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // НЕ устанавливаем Content-Type вручную - axios сам установит правильный заголовок с boundary для FormData
      const response = await apiClient.post('/admin/extensions/upload', data, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setUploadProgress(percentCompleted);
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] });
      navigate('/ru/admin/extensions');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || t('admin.plugins.upload.error', 'Ошибка загрузки');
      setErrors({ general: message });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[PluginsUploadPage] File input changed, files:', e.target.files);
    const file = e.target.files?.[0];
    if (file) {
      console.log('[PluginsUploadPage] File selected:', file.name, file.size);
      // Проверка типа файла
      if (!file.name.endsWith('.zip')) {
        setErrors({ file: t('admin.plugins.upload.invalidFile', 'Файл должен быть .zip архивом') });
        return;
      }

      // Проверка размера (например, максимум 50 MB)
      const maxSize = 50 * 1024 * 1024; // 50 MB
      if (file.size > maxSize) {
        setErrors({
          file: t('admin.plugins.upload.fileTooLarge', 'Файл слишком большой (макс. 50 MB)'),
        });
        return;
      }

      setFormData({ ...formData, file });
      setErrors({});
    } else {
      console.log('[PluginsUploadPage] No file selected');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = t('admin.plugins.upload.nameRequired', 'Название обязательно');
    }
    if (!formData.file) {
      newErrors.file = t('admin.plugins.upload.fileRequired', 'Файл обязателен');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Создание FormData
    const data = new FormData();
    data.append('name', formData.name);
    data.append('extensionType', formData.extensionType);
    data.append('enabled', formData.enabled.toString());
    if (formData.file) {
      data.append('file', formData.file);
    }

    uploadMutation.mutate(data);
  };

  const typeOptions = [
    { value: ExtensionType.PLUGIN, label: t('admin.extensions.type.plugin', 'Плагин') },
    { value: ExtensionType.MENU_ITEM, label: t('admin.extensions.type.menu_item', 'Пункт меню') },
    { value: ExtensionType.PAYMENT, label: t('admin.extensions.type.payment', 'Оплата') },
    { value: ExtensionType.AUTH, label: t('admin.extensions.type.auth', 'Аутентификация') },
    { value: ExtensionType.SYSTEM, label: t('admin.extensions.type.system', 'Система') },
    { value: ExtensionType.CONTENT, label: t('admin.extensions.type.content', 'Контент') },
    { value: ExtensionType.API, label: t('admin.extensions.type.api', 'API') },
  ];

  return (
    <PageTemplate title={t('admin.plugins.upload.title', 'Загрузка плагина')}>
      <div className="plugins-upload">
        <Card className="plugins-upload__card">
          <form onSubmit={handleSubmit} className="plugins-upload__form">
            <div className="form-group">
              <label htmlFor="plugin-name">
                {t('admin.plugins.upload.name', 'Название плагина')} <span className="required">*</span>
              </label>
              <Input
                id="plugin-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('admin.plugins.upload.namePlaceholder', 'Мой плагин')}
                error={errors.name}
              />
            </div>

            <div className="form-group">
              <label htmlFor="plugin-type">
                {t('admin.plugins.upload.type', 'Тип расширения')} <span className="required">*</span>
              </label>
              <Select
                id="plugin-type"
                value={formData.extensionType}
                onChange={(e) =>
                  setFormData({ ...formData, extensionType: e.target.value as ExtensionType })
                }
                options={typeOptions}
              />
            </div>

            <div className="form-group">
              <label htmlFor="plugin-file">
                {t('admin.plugins.upload.file', 'Файл плагина (.zip)')} <span className="required">*</span>
              </label>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                id="plugin-file"
                accept=".zip"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              {/* Custom button to trigger file input */}
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => {
                  console.log('[PluginsUploadPage] Button clicked, fileInputRef:', fileInputRef.current);
                  e.preventDefault();
                  e.stopPropagation();
                  if (fileInputRef.current) {
                    console.log('[PluginsUploadPage] Triggering file input click');
                    fileInputRef.current.click();
                  } else {
                    console.error('[PluginsUploadPage] fileInputRef.current is null!');
                  }
                }}
                leftIcon={<Icon name="upload" size="sm" />}
                className="file-button"
              >
                {formData.file 
                  ? `${formData.file.name} (${(formData.file.size / 1024 / 1024).toFixed(2)} MB)`
                  : t('admin.plugins.upload.chooseFile', 'Выбрать файл')}
              </Button>
              
              {errors.file && <p className="error-message">{errors.file}</p>}
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="plugin-enabled">
                <input
                  type="checkbox"
                  id="plugin-enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
                {t('admin.plugins.upload.enableAfterInstall', 'Включить после установки')}
              </label>
            </div>

            {errors.general && (
              <div className="error-banner">
                <p>{errors.general}</p>
              </div>
            )}

            {uploadMutation.isPending && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="progress-text">{uploadProgress}%</p>
              </div>
            )}

            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/ru/admin/extensions')}
              >
                {t('common.cancel', 'Отмена')}
              </Button>
              <Button type="submit" variant="primary" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending
                  ? t('admin.plugins.upload.uploading', 'Загрузка...')
                  : t('admin.plugins.upload.submit', 'Загрузить плагин')}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="plugins-upload__info">
          <h3>{t('admin.plugins.upload.info.title', 'Требования к плагину')}</h3>
          <ul>
            <li>{t('admin.plugins.upload.info.zip', 'Файл должен быть .zip архивом')}</li>
            <li>{t('admin.plugins.upload.info.manifest', 'Должен содержать manifest.json')}</li>
            <li>{t('admin.plugins.upload.info.structure', 'Структура папок: src/, frontend/')}</li>
            <li>{t('admin.plugins.upload.info.size', 'Максимальный размер: 50 MB')}</li>
          </ul>

          <h3>{t('admin.plugins.upload.info.exampleTitle', 'Пример manifest.json')}</h3>
          <pre className="code-block">
            {`{
  "slug": "my-plugin",
  "name": "Мой Плагин",
  "description": "Описание плагина",
  "version": "1.0.0",
  "author": {
    "name": "Автор",
    "email": "author@example.com"
  },
  "extensionType": "plugin",
  "ui": {
    "type": "iframe",
    "entryFile": "index.html",
    "icon": "icon.png"
  },
  "events": {
    "subscribes": ["user.login", "user.logout"]
  }
}`}
          </pre>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default PluginsUploadPage;

