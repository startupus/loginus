import { User } from '../../users/entities/user.entity';

/**
 * Адаптер для преобразования User из БД в формат, ожидаемый фронтендом
 */
export class UserAdapter {
  /**
   * Преобразует User в формат для фронтенда
   */
  static toFrontendFormat(user: User | Partial<User> | any): any {
    if (!user) {
      return null;
    }

    // Извлекаем роль из userRoleAssignments (глобальная роль без organizationId и teamId)
    let role: string | undefined = undefined;
    if ((user as any).userRoleAssignments && Array.isArray((user as any).userRoleAssignments)) {
      const globalRoleAssignment = (user as any).userRoleAssignments.find(
        (assignment: any) => 
          assignment.role && 
          !assignment.organizationId && 
          !assignment.teamId
      );
      if (globalRoleAssignment?.role?.name) {
        role = globalRoleAssignment.role.name;
      }
    }
    
    // Если роль уже есть в объекте (например, из getCurrentUser), используем её
    if (!role && (user as any).role) {
      role = (user as any).role;
    }
    
    // Если есть массив roles, берем первую глобальную роль
    if (!role && (user as any).roles && Array.isArray((user as any).roles)) {
      const foundRole = (user as any).roles.find((r: any) => {
        if (typeof r === 'string') return false; // Строки не имеют isGlobal
        return r?.isGlobal && !r?.organizationId && !r?.teamId;
      });
      if (foundRole) {
        if (typeof foundRole === 'object' && foundRole?.name) {
          role = foundRole.name;
        } else if (typeof foundRole === 'string') {
          role = foundRole;
        }
      }
    }

    return {
      id: user.id,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`.trim()
        : user.firstName || user.lastName || user.email || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: (user as any).avatarUrl || null,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.email || ''),
      birthday: null, // Поле birthday отсутствует в User entity
      role: role || 'user', // Добавляем роль, по умолчанию 'user'
      companyId: (user as any).companyId || null,
      permissions: (user as any).permissions || [],
      status: user.isActive ? 'active' : 'inactive',
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    };
  }

  /**
   * Преобразует ответ auth в формат для фронтенда
   */
  static toAuthResponse(authResult: any): any {
    if (!authResult) {
      return null;
    }

    // Если уже есть структура с tokens, преобразуем её
    if (authResult.accessToken && authResult.refreshToken) {
      return {
        user: this.toFrontendFormat(authResult.user),
        tokens: {
          accessToken: authResult.accessToken,
          refreshToken: authResult.refreshToken,
          expiresIn: 3600, // 1 час по умолчанию
        },
      };
    }

    return authResult;
  }
}

