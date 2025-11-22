import React, { createContext, useContext, ReactNode, useState } from 'react';
import { applyCustomTheme, CustomTheme } from '../utils/themeUtils';

interface ClientConfig {
  id: string;
  name: string;
  theme?: CustomTheme;
  features?: string[];
  branding?: {
    logo?: string;
    favicon?: string;
  };
}

interface ClientContextType {
  client: ClientConfig | null;
  setClient: (client: ClientConfig) => void;
  applyClientTheme: (theme: CustomTheme) => void;
  hasFeature: (feature: string) => boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClient = (): ClientContextType => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within ClientProvider');
  }
  return context;
};

/**
 * useClientSafe - безопасная версия useClient для публичных страниц
 * Возвращает дефолтные значения если ClientProvider не найден
 * Используется в публичных страницах (Help, Landing) где клиент может быть не установлен
 */
export const useClientSafe = (): ClientContextType => {
  try {
    return useClient();
  } catch {
    // Fallback для публичных страниц без клиента
    return {
      client: null,
      setClient: () => {},
      applyClientTheme: () => {},
      hasFeature: () => false,
    };
  }
};

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [client, setClientState] = useState<ClientConfig | null>(null);

  const setClient = (newClient: ClientConfig) => {
    setClientState(newClient);
    if (newClient.theme) {
      applyCustomTheme(newClient.theme);
    }
  };

  const applyClientTheme = (theme: CustomTheme) => {
    applyCustomTheme(theme);
  };

  const hasFeature = (feature: string): boolean => {
    return client?.features?.includes(feature) ?? false;
  };

  return (
    <ClientContext.Provider value={{ client, setClient, applyClientTheme, hasFeature }}>
      {children}
    </ClientContext.Provider>
  );
};


