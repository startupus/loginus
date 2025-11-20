import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../primitives/Icon';

export interface LinkButtonProps {
  /**
   * Текст ссылки
   */
  children: React.ReactNode;
  
  /**
   * URL или путь
   */
  href: string;
  
  /**
   * Показать иконку стрелки
   */
  showIcon?: boolean;
  
  /**
   * Иконка (по умолчанию arrow-right)
   */
  icon?: React.ReactNode;
  
  /**
   * Вариант стиля
   */
  variant?: 'default' | 'primary' | 'ghost';
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * LinkButton - ссылка-кнопка с иконкой
 * Используется для CTA ссылок на landing страницах
 */
export const LinkButton: React.FC<LinkButtonProps> = ({
  children,
  href,
  showIcon = true,
  icon,
  variant = 'default',
  className = '',
}) => {
  const variantClasses = {
    default: 'text-text-secondary hover:text-primary',
    primary: 'text-primary hover:text-primary/80',
    ghost: 'text-text-secondary hover:text-primary',
  };

  const defaultIcon = (
    <Icon name="arrow-right" size="sm" />
  );

  const linkContent = (
    <span className={`inline-flex items-center gap-2 px-8 py-4 text-base font-medium transition-colors ${variantClasses[variant]} ${className}`}>
      {children}
      {showIcon && (icon || defaultIcon)}
    </span>
  );

  if (href.startsWith('http') || href.startsWith('#')) {
    return (
      <a href={href}>
        {linkContent}
      </a>
    );
  }

  return (
    <Link to={href}>
      {linkContent}
    </Link>
  );
};

