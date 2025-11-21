import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  openDropdown: string | null;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  toggleDropdown: (path: string) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

/**
 * Проверяет, является ли текущее устройство мобильным или планшетом
 * xl breakpoint в Tailwind = 1280px
 */
const isMobileOrTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 1280; // xl breakpoint
};

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Инициализируем состояние в зависимости от размера экрана
  // isOpen = true означает "закрыт" на мобильных (из-за инверсной логики в Sidebar.tsx)
  const [isOpen, setIsOpen] = useState(() => isMobileOrTablet());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Отслеживаем изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      const mobile = isMobileOrTablet();
      // На десктопе (xl+) всегда открываем сайдбар (isOpen = false)
      // На мобильных/планшетах закрываем (isOpen = true)
      if (!mobile) {
        setIsOpen(false); // Открыт на десктопе
      } else if (!isOpen) {
        // Если перешли с десктопа на мобильный, закрываем сайдбар
        setIsOpen(true); // Закрыт на мобильных
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const closeSidebar = () => setIsOpen(false);
  const openSidebar = () => setIsOpen(true);
  const toggleDropdown = (path: string) => setOpenDropdown((prev) => (prev === path ? null : path));

  const value = useMemo(
    () => ({
      isOpen,
      openDropdown,
      toggleSidebar,
      closeSidebar,
      openSidebar,
      toggleDropdown,
    }),
    [isOpen, openDropdown]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = (): SidebarContextType => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return ctx;
};


