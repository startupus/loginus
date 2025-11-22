/**
 * Утилиты для отладки административной консоли
 * Используйте в консоли браузера для проверки и установки роли
 */

import { useAuthStore } from '../store';

/**
 * Проверяет текущую роль пользователя
 */
export const checkAdminRole = () => {
  const user = useAuthStore.getState().user;
  console.log('Current user:', user);
  console.log('Role:', user?.role || 'NOT SET');
  console.log('Is Admin:', ['super_admin', 'super_admin_staff', 'company_admin', 'company_admin_staff'].includes(user?.role || ''));
  return user;
};

/**
 * Устанавливает роль пользователя (для тестирования)
 */
export const setAdminRole = (role: 'super_admin' | 'super_admin_staff' | 'company_admin' | 'company_admin_staff' | 'user') => {
  const currentUser = useAuthStore.getState().user;
  if (!currentUser) {
    console.error('User not logged in. Please login first.');
    return;
  }
  
  useAuthStore.getState().updateUser({
    role,
    permissions: role === 'super_admin' ? ['*'] : role === 'company_admin' ? ['users:read', 'users:write'] : [],
  });
  
  console.log(`Role set to: ${role}`);
  console.log('Updated user:', useAuthStore.getState().user);
};

// Экспортируем в window для использования в консоли браузера
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).adminDebug = {
    checkRole: checkAdminRole,
    setRole: setAdminRole,
  };
  console.log('Admin debug utilities available: window.adminDebug.checkRole() and window.adminDebug.setRole("super_admin")');
}

