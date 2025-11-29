import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '../../design-system/layouts/PageTemplate/PageTemplate';
import { Input } from '../../design-system/primitives/Input/Input';
import { Button } from '../../design-system/primitives/Button/Button';
import { Card } from '../../design-system/primitives/Card/Card';
import { Icon } from '../../design-system/primitives/Icon';
import { apiClient } from '../../services/api/client';
import { ExtensionType } from './ExtensionsManagerPage';
import './PluginsUploadPage.css'; // Используем те же стили

const WidgetsUploadPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    enabled: false,
    file: null as File | null,
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiClient.post('/admin/extensions/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
        error.response?.data?.message || t('admin.widgets.upload.error', 'Ошибка загрузки');
      setErrors({ general: message });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверка типа файла
      if (!file.name.endsWith('.zip')) {
        setErrors({ file: t('admin.widgets.upload.invalidFile', 'Файл должен быть .zip архивом') });
        return;
      }

      // Проверка размера (например, максимум 50 MB)
      const maxSize = 50 * 1024 * 1024; // 50 MB
      if (file.size > maxSize) {
        setErrors({
          file: t('admin.widgets.upload.fileTooLarge', 'Файл слишком большой (макс. 50 MB)'),
        });
        return;
      }

      setFormData({ ...formData, file });
      setErrors({});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = t('admin.widgets.upload.nameRequired', 'Название обязательно');
    }
    if (!formData.file) {
      newErrors.file = t('admin.widgets.upload.fileRequired', 'Файл обязателен');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Создание FormData (тип автоматически Widget)
    const data = new FormData();
    data.append('name', formData.name);
    data.append('extensionType', ExtensionType.WIDGET); // Автоматически Widget
    data.append('enabled', formData.enabled.toString());
    if (formData.file) {
      data.append('file', formData.file);
    }

    uploadMutation.mutate(data);
  };

  return (
    <PageTemplate title={t('admin.widgets.upload.title', 'Загрузка виджета')}>
      <div className="plugins-upload">
        <Card className="plugins-upload__card">
          <form onSubmit={handleSubmit} className="plugins-upload__form">
            <div className="form-group">
              <label htmlFor="widget-name">
                {t('admin.widgets.upload.name', 'Название виджета')} <span className="required">*</span>
              </label>
              <Input
                id="widget-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('admin.widgets.upload.namePlaceholder', 'Мой виджет')}
                error={errors.name}
              />
              <p className="form-hint">
                {t('admin.widgets.upload.typeHint', 'Виджеты автоматически получают тип "Widget"')}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="widget-file">
                {t('admin.widgets.upload.file', 'Файл виджета (.zip)')} <span className="required">*</span>
              </label>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                id="widget-file"
                accept=".zip"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              {/* Custom button to trigger file input */}
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                leftIcon={<Icon name="upload" size="sm" />}
                className="file-button"
              >
                {formData.file 
                  ? `${formData.file.name} (${(formData.file.size / 1024 / 1024).toFixed(2)} MB)`
                  : t('admin.widgets.upload.chooseFile', 'Выбрать файл')}
              </Button>
              
              {errors.file && <p className="error-message">{errors.file}</p>}
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="widget-enabled">
                <input
                  type="checkbox"
                  id="widget-enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
                {t('admin.widgets.upload.enableAfterInstall', 'Включить после установки')}
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
                  ? t('admin.widgets.upload.uploading', 'Загрузка...')
                  : t('admin.widgets.upload.submit', 'Загрузить виджет')}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="plugins-upload__info">
          <h3>{t('admin.widgets.upload.info.title', 'Требования к виджету')}</h3>
          <ul>
            <li>{t('admin.widgets.upload.info.zip', 'Файл должен быть .zip архивом')}</li>
            <li>{t('admin.widgets.upload.info.manifest', 'Должен содержать manifest.json')}</li>
            <li>{t('admin.widgets.upload.info.iframe', 'Виджет отображается как iframe карточка')}</li>
            <li>{t('admin.widgets.upload.info.profile', 'Отображается в разделе профиля')}</li>
            <li>{t('admin.widgets.upload.info.size', 'Максимальный размер: 50 MB')}</li>
          </ul>

          <h3>{t('admin.widgets.upload.info.exampleTitle', 'Пример manifest.json')}</h3>
          <pre className="code-block">
            {`{
  "slug": "my-widget",
  "name": "Мой Виджет",
  "description": "Виджет для отображения данных",
  "version": "1.0.0",
  "author": {
    "name": "Автор",
    "email": "author@example.com"
  },
  "extensionType": "widget",
  "ui": {
    "type": "iframe",
    "entryFile": "index.html",
    "icon": "icon.png"
  }
}`}
          </pre>

          <h3>{t('admin.widgets.upload.info.displayTitle', 'Особенности отображения')}</h3>
          <ul>
            <li>{t('admin.widgets.upload.info.adaptive', 'Адаптивная высота и ширина')}</li>
            <li>{t('admin.widgets.upload.info.constraints', 'Ограничения по размерам')}</li>
            <li>{t('admin.widgets.upload.info.grid', 'Grid-система для размещения')}</li>
          </ul>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default WidgetsUploadPage;

