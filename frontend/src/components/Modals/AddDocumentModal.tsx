import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { personalApi } from '../../services/api/personal';
import {
  validateDocumentSeries,
  validateDocumentNumber,
  validateDate,
  validateRequired,
} from '../../utils/formValidation';

export type DocumentType =
  | 'passport'
  | 'internationalPassport'
  | 'birthCertificate'
  | 'drivingLicense'
  | 'vehicleRegistration'
  | 'oms'
  | 'dms'
  | 'inn'
  | 'snils';

export interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  documentType?: DocumentType;
}

const DOCUMENT_TYPES: Record<DocumentType, string> = {
  passport: 'passport',
  internationalPassport: 'internationalPassport',
  birthCertificate: 'birthCertificate',
  drivingLicense: 'drivingLicense',
  vehicleRegistration: 'vehicleRegistration',
  oms: 'oms',
  dms: 'dms',
  inn: 'inn',
  snils: 'snils',
};

/**
 * AddDocumentModal - модальное окно для добавления документа
 */
export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  documentType,
}) => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<DocumentType>(documentType || 'passport');
  const [series, setSeries] = useState('');
  const [number, setNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [issuePlace, setIssuePlace] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Определяем, нужна ли серия для данного типа документа
  const needsSeries = ['passport', 'internationalPassport', 'drivingLicense'].includes(selectedType);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!documentType) {
      const typeValidation = validateRequired(selectedType, t('modals.document.type', 'Тип документа'));
      if (!typeValidation.isValid) {
        newErrors.type = typeValidation.error || '';
      }
    }

    if (needsSeries) {
      const seriesValidation = validateDocumentSeries(series);
      if (!seriesValidation.isValid) {
        newErrors.series = seriesValidation.error || '';
      }
    }

    const numberValidation = validateDocumentNumber(number);
    if (!numberValidation.isValid) {
      newErrors.number = numberValidation.error || '';
    }

    if (issueDate) {
      const dateValidation = validateDate(issueDate, { allowFuture: false });
      if (!dateValidation.isValid) {
        newErrors.issueDate = dateValidation.error || '';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', selectedType);
      if (series) formData.append('series', series);
      formData.append('number', number);
      if (issueDate) formData.append('issueDate', issueDate);
      if (issuePlace) formData.append('issuePlace', issuePlace);
      if (file) formData.append('file', file);

      await personalApi.addDocument(formData);
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      setErrors({ submit: error.message || t('modals.document.error', 'Ошибка при добавлении документа') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSeries('');
    setNumber('');
    setIssueDate('');
    setIssuePlace('');
    setFile(null);
    setErrors({});
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('modals.document.title', 'Добавить документ')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Тип документа */}
        {!documentType && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('modals.document.type', 'Тип документа')}
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as DocumentType)}
              className="w-full rounded-md border border-border px-5 py-[10px] bg-transparent text-text-primary"
            >
              {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {t(`modals.document.types.${value}`, key)}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-sm text-error mt-1">{errors.type}</p>
            )}
          </div>
        )}

        {/* Серия */}
        {needsSeries && (
          <div>
            <Input
              label={t('modals.document.series', 'Серия')}
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              placeholder={t('modals.document.seriesPlaceholder', '0000')}
              error={errors.series}
              fullWidth
            />
          </div>
        )}

        {/* Номер */}
        <div>
          <Input
            label={t('modals.document.number', 'Номер')}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder={t('modals.document.numberPlaceholder', '000000')}
            error={errors.number}
            fullWidth
          />
        </div>

        {/* Дата выдачи */}
        <div>
          <Input
            type="date"
            label={t('modals.document.issueDate', 'Дата выдачи')}
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            error={errors.issueDate}
            fullWidth
          />
        </div>

        {/* Орган выдачи */}
        <div>
          <Input
            label={t('modals.document.issuePlace', 'Орган выдачи')}
            value={issuePlace}
            onChange={(e) => setIssuePlace(e.target.value)}
            placeholder={t('modals.document.issuePlacePlaceholder', 'УВД г. Москвы')}
            fullWidth
          />
        </div>

        {/* Загрузка файла */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('modals.document.upload', 'Загрузить фото/скан')}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="document-file"
            />
            <label
              htmlFor="document-file"
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-gray-1 dark:bg-gray-2 text-text-primary cursor-pointer hover:border-primary transition-colors text-center"
            >
              {file ? file.name : t('modals.document.uploadButton', 'Выбрать файл')}
            </label>
          </div>
          {file && (
            <p className="text-sm text-text-secondary mt-1">
              {t('modals.document.uploaded', 'Файл загружен')}
            </p>
          )}
        </div>

        {errors.submit && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
            {errors.submit}
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            {t('modals.document.cancel', 'Отмена')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? t('modals.document.saving', 'Сохранение...') : t('modals.document.save', 'Сохранить')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

