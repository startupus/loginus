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
}) => {
  // const navigate = useNavigate(); // TODO: использовать для навигации
  const { themeMode, setThemeMode } = useTheme();
  const { masked: maskedPhone } = useContactMasking(user.phone, 'phone');

  const handlePhoneVerification = (isActual: boolean) => {
    // TODO: Отправить на сервер информацию об актуальности номера
    console.log('Phone verification:', isActual);
  };

  const handleThemeChange = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className="!max-w-md"
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
          <h3 className="text-lg font-bold text-dark dark:text-white mb-1">
            {user.name}
          </h3>
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
          onClick={() => {
            // TODO: Открыть модалку выбора организации
            console.log('Select organization');
          }}
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
            onClick={onClose}
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
    </Modal>
  );
};

