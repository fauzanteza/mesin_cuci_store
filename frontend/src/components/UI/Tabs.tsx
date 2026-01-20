import React, { useState } from 'react';

interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
}

interface TabsProps {
    items: TabItem[];
    defaultActiveId?: string;
    className?: string;
    activeTab?: string;
    onTabChange?: (id: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ items, defaultActiveId, className = '', activeTab: controlledActiveTab, onTabChange }) => {
    const [internalActiveTab, setInternalActiveTab] = useState(defaultActiveId || items[0]?.id);

    const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

    const handleTabClick = (id: string) => {
        if (onTabChange) {
            onTabChange(id);
        } else {
            setInternalActiveTab(id);
        }
    };

    return (
        <div className={className}>
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {items.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                                ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="animate-fade-in">
                {items.find(item => item.id === activeTab)?.content}
            </div>
        </div>
    );
};

export default Tabs;
