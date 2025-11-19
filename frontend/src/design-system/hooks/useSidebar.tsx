import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  openDropdown: string | null;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  toggleDropdown: (path: string) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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


