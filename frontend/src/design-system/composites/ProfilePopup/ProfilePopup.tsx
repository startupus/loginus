import React from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../Modal';
import { Button } from '../../primitives/Button';
import { Icon } from '../../primitives/Icon';
import { Separator } from '../../primitives/Separator';
import { ServiceLink } from '../ServiceLink';
import { PhoneVerificationCard } from '../PhoneVerificationCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useContactMasking } from '../../../hooks/useContactMasking';
import { OrganizationModal, BirthdayModal } from '../../../components/Modals';
import { useModal } from '../../../hooks/useModal';
import { profileApi } from '../../../services/api/profile';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  login?: string;
  avatar?: string | null;
  unreadMail?: number;
  plusActive?: boolean;
  plusPoints?: number;
}

export interface ProfilePopupProps {
  /**
   * Открыто ли попап
   */
  isOpen: boolean;
  
  /**
   * Callback при закрытии
   */
  onClose: () => void;
  
  /**
   * Данные пользователя
   */
  user: UserProfile;
  
  /**
   * Callback при смене аккаунта
   */
  onSwitchAccount?: () => void;
  
  /**
   * Callback при редактировании профиля
   */
  onEdit?: () => void;
  
  /**
   * Референс на элемент для позиционирования попапа
   */
  anchorRef?: React.RefObject<HTMLElement>;
}

/**
 * ProfilePopup - попап профиля пользователя
 * Отображает информацию о пользователе и быстрые ссылки на сервисы
 */
export const ProfilePopup: React.FC<ProfilePopupProps> = ({
  isOpen,
  onClose,
  user,
  onSwitchAccount,
  onEdit,
  anchorRef,
}) => {
  // const navigate = useNavigate(); // TODO: использовать для навигации
  const { themeMode, setThemeMode } = useTheme();
  const { masked: maskedPhone } = useContactMasking(user.phone, 'phone');
  const organizationModal = useModal();
  const birthdayModal = useModal();

  const handlePhoneVerification = (isActual: boolean) => {
    // TODO: Отправить на сервер информацию об актуальности номера
    console.log('Phone verification:', isActual);
  };

  const handleThemeChange = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  const handleSelectOrganization = (organizationId: string) => {
    // TODO: Реализовать выбор организации
    console.log('Selected organization:', organizationId);
  };

  const handleSaveBirthday = async (data: { birthDate: string; gender?: 'male' | 'female' }) => {
    try {
      await profileApi.updateProfile({
        birthday: data.birthDate,
      });
    } catch (error) {
      console.error('Error saving birthday:', error);
      throw error;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className="!max-w-md"
      position={anchorRef ? 'top-right' : 'center'}
      anchorRef={anchorRef}
    >
      <div className="text-left">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2 text-dark dark:text-white hover:text-primary transition-colors"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white">
              <span className="text-sm font-extrabold leading-none">iD</span>
            </div>
            <span className="text-lg font-bold">Loginus ID</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="!p-2"
          >
            <Icon name="close" size="sm" />
          </Button>
        </div>

        {/* User Info */}
        <div className="mb-6">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary-600 dark:text-primary-400 mb-2"
          >
            <Icon name="settings" size="sm" />
            <span>Управление аккаунтом</span>
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-dark dark:text-white">
              {user.name}
            </h3>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onEdit();
                  onClose();
                }}
                className="!p-1"
              >
                <Icon name="edit" size="sm" />
              </Button>
            )}
          </div>
          <p className="text-sm text-body-color dark:text-dark-6">
            {maskedPhone} {user.login && `• ${user.login}`}
          </p>
        </div>

        {/* Phone Verification Card */}
        <div className="mb-6">
          <PhoneVerificationCard
            phone={user.phone}
            onConfirm={handlePhoneVerification}
          />
        </div>

        {/* Organization Selector */}
        <Button
          variant="outline"
          fullWidth
          className="mb-6 flex items-center justify-between"
          onClick={organizationModal.open}
        >
          <div className="flex items-center gap-2">
            <Icon name="users" size="sm" />
            <span>Выбрать организацию</span>
          </div>
          <Icon name="chevron-right" size="sm" />
        </Button>

        {/* Service Links */}
        <div className="mb-6 space-y-0">
          <ServiceLink
            icon="mail"
            name="Почта"
            status={
              <span>
                {user.unreadMail || 0} непрочитанных писем
              </span>
            }
            badge={user.unreadMail}
            href="https://mail.yandex.ru"
            onClick={onClose}
          />
          
          <Separator />
          
          <ServiceLink
            icon="star"
            name="Плюс"
            status={user.plusActive ? 'Подписка активна' : 'Не подключено'}
            extra={user.plusPoints ? `${user.plusPoints} баллов` : 'нет баллов'}
            href="https://plus.yandex.ru"
            onClick={onClose}
          />
          
          <Separator />
          
          <ServiceLink
            icon="user"
            name="Личные данные"
            status="ФИО, день рождения, пол"
            href="/personal?dialog=personal-data"
            onClick={() => {
              onClose();
            }}
          />
          
          <Separator />
          
          <ServiceLink
            icon="phone"
            name="Телефон"
            status={maskedPhone}
            href="/security/phones"
            onClick={onClose}
          />
        </div>

        {/* Bottom Links */}
        <div className="mb-6 space-y-2">
          <Button
            variant="outline"
            fullWidth
            className="flex items-center justify-start gap-2"
            onClick={handleThemeChange}
          >
            <Icon name={themeMode === 'dark' ? 'sun' : 'moon'} size="sm" />
            <span>Внешний вид</span>
          </Button>
          
          <Link
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-2 transition-colors text-body-color dark:text-dark-6"
          >
            <Icon name="settings" size="sm" />
            <span>Настройки</span>
          </Link>
          
          <Link
            to="/support"
            onClick={onClose}
            className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-1 dark:hover:bg-dark-2 transition-colors text-body-color dark:text-dark-6"
          >
            <Icon name="info" size="sm" />
            <span>Справка</span>
          </Link>
        </div>

        {/* Switch Account */}
        <Button
          variant="outline"
          fullWidth
          className="flex items-center justify-center gap-2"
          onClick={() => {
            onSwitchAccount?.();
            onClose();
          }}
        >
          <Icon name="logout" size="sm" />
          <span>Сменить аккаунт</span>
        </Button>
      </div>

      {/* Organization Modal */}
      <OrganizationModal
        isOpen={organizationModal.isOpen}
        onClose={organizationModal.close}
        onSelect={handleSelectOrganization}
        organizations={[]} // TODO: Загрузить организации из API
      />

      {/* Birthday Modal */}
      <BirthdayModal
        isOpen={birthdayModal.isOpen}
        onClose={birthdayModal.close}
        onSave={handleSaveBirthday}
      />
    </Modal>
  );
};

