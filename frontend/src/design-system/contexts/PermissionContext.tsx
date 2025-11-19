import React, { createContext, useContext, ReactNode } from 'react';

type Role = 'guest' | 'user' | 'admin' | 'owner';

interface PermissionContextType {
  role: Role;
  features: Record<string, boolean>;
  hasRole: (min: Role) => boolean;
  hasFeature: (feature: string) => boolean;
}

const roleOrder: Role[] = ['guest', 'user', 'admin', 'owner'];

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = (): PermissionContextType => {
  const ctx = useContext(PermissionContext);
  if (!ctx) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return ctx;
};

export const PermissionProvider: React.FC<{
  children: ReactNode;
  role?: Role;
  features?: Record<string, boolean>;
}> = ({ children, role = 'user', features = {} }) => {
  const hasRole = (min: Role) => roleOrder.indexOf(role) >= roleOrder.indexOf(min);
  const hasFeature = (feature: string) => !!features[feature];

  return (
    <PermissionContext.Provider value={{ role, features, hasRole, hasFeature }}>
      {children}
    </PermissionContext.Provider>
  );
};


