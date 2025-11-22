import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminPermissions } from '../hooks/useAdminPermissions';
import { useAuthStore } from '../store';
import { useCurrentLanguage, buildPathWithLang } from '../utils/routing';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'company_admin';
}

/**
 * Компонент для защиты административных маршрутов
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children, requiredRole }) => {
  const { isAdmin, isSuperAdmin, isCompanyAdmin, userRole } = useAdminPermissions();
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const currentLang = useCurrentLanguage();

  // Отладка в dev режиме
  if (process.env.NODE_ENV === 'development') {
    console.log('[AdminRoute] Check:', {
      userRole,
      isAdmin,
      isSuperAdmin,
      isCompanyAdmin,
      requiredRole,
      isAuthenticated,
      user: user ? { id: user.id, role: user.role } : null,
    });
  }

  // Проверка авторизации
  if (!isAuthenticated || !user) {
    // Редирект на страницу авторизации если пользователь не авторизован
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AdminRoute] Access denied - user not authenticated', { isAuthenticated, user });
    }
    return <Navigate to={buildPathWithLang('/auth', currentLang)} replace />;
  }

  // Проверка прав доступа - пользователь должен быть админом
  if (!isAdmin) {
    // Редирект на главную страницу если пользователь не админ
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AdminRoute] Access denied - user is not admin', { userRole, user });
    }
    return <Navigate to={buildPathWithLang('/', currentLang)} replace />;
  }

  // Проверка конкретной роли если требуется
  if (requiredRole === 'super_admin' && !isSuperAdmin) {
    // Редирект на админ-дашборд если недостаточно прав
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AdminRoute] Access denied - super_admin required', { userRole, isSuperAdmin });
    }
    return <Navigate to={buildPathWithLang('/admin', currentLang)} replace />;
  }

  if (requiredRole === 'company_admin' && !isCompanyAdmin && !isSuperAdmin) {
    // Редирект на админ-дашборд если недостаточно прав
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AdminRoute] Access denied - company_admin required', { userRole, isCompanyAdmin, isSuperAdmin });
    }
    return <Navigate to={buildPathWithLang('/admin', currentLang)} replace />;
  }

  return <>{children}</>;
};

