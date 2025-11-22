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
    <div className="w-full">
      {/* Tab Headers */}
      <div className={`border-b ${themeClasses.border.default}`}>
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : `border-transparent ${themeClasses.text.secondary} hover:${themeClasses.border.default} hover:${themeClasses.text.primary}`
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">{activeTabContent}</div>
    </div>
  );
};

