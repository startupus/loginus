import { useMemo } from 'react';
import { useAuthStore } from '../store';
import type { UserRole } from '../store/authStore';

/**
 * Хук для проверки прав доступа администратора
 */
export const useAdminPermissions = () => {
  const { user } = useAuthStore();

  const isSuperAdmin = useMemo(() => {
    return user?.role === 'super_admin';
  }, [user?.role]);

  const isSuperAdminStaff = useMemo(() => {
    return user?.role === 'super_admin_staff';
  }, [user?.role]);

  const isCompanyAdmin = useMemo(() => {
    return user?.role === 'company_admin';
  }, [user?.role]);

  const isCompanyAdminStaff = useMemo(() => {
    return user?.role === 'company_admin_staff';
  }, [user?.role]);

  const isAdmin = useMemo(() => {
    return isSuperAdmin || isSuperAdminStaff || isCompanyAdmin || isCompanyAdminStaff;
  }, [isSuperAdmin, isSuperAdminStaff, isCompanyAdmin, isCompanyAdminStaff]);

  const hasRole = (role: UserRole): boolean => {
    if (!user?.role) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user?.permissions) return false;
    // '*' означает все права
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user?.permissions) return false;
    if (user.permissions.includes('*')) return true;
    return permissions.some(permission => user.permissions?.includes(permission));
  };

  const canAccessCompany = (companyId: string | null | undefined): boolean => {
    // Супер-админ имеет доступ ко всем компаниям
    if (isSuperAdmin) return true;
    
    // Админ компании имеет доступ только к своей компании
    if (isCompanyAdmin || isCompanyAdminStaff) {
      return user?.companyId === companyId;
    }

    return false;
  };

  return {
    isSuperAdmin,
    isSuperAdminStaff,
    isCompanyAdmin,
    isCompanyAdminStaff,
    isAdmin,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    canAccessCompany,
    userRole: user?.role,
    companyId: user?.companyId,
  };
};

