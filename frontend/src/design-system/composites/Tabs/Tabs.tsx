import React, { useState } from 'react';
import { themeClasses } from '../../utils/themeClasses';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  /**
   * Массив вкладок
   */
  tabs: Tab[];
  
  /**
   * Активная вкладка по умолчанию
   */
  defaultTab?: string;
  
  /**
   * Callback смены вкладки
   */
  onChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, onChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={themeClasses.tabs.container}>
      {/* Tab Headers */}
      <div className={`${themeClasses.tabs.headersContainer} ${themeClasses.border.default}`}>
        <nav className={themeClasses.tabs.nav}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                ${themeClasses.tabs.button}
                ${
                  activeTab === tab.id
                    ? themeClasses.tabs.buttonActive
                    : themeClasses.tabs.buttonInactive
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className={themeClasses.tabs.content}>{activeTabContent}</div>
    </div>
  );
};

