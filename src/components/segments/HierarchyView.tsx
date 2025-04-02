// src/components/segments/HierarchyView.tsx
import React, { useState } from 'react';
import { FiBox, FiGrid, FiFolder, FiFolderPlus, FiPackage } from 'react-icons/fi';

interface HierarchyItem {
  name: string;
  type: 'universe' | 'category' | 'subcategory' | 'family' | 'subfamily';
  count: number;
  children?: HierarchyItem[];
}

interface HierarchyViewProps {
  title: string;
  icon: React.ReactNode;
  items: HierarchyItem[];
  expandedByDefault?: boolean;
}

export const HierarchyView: React.FC<HierarchyViewProps> = ({
  title,
  icon,
  items,
  expandedByDefault = false
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(
    expandedByDefault ? items.map(item => item.name) : []
  );

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  // Obtenir l'icône pour le type de segment
  const getIconForType = (type: string) => {
    switch (type) {
      case 'universe':
        return <FiGrid size={16} />;
      case 'category':
        return <FiFolder size={16} />;
      case 'subcategory':
        return <FiFolderPlus size={16} />;
      case 'family':
        return <FiBox size={16} />;
      case 'subfamily':
        return <FiPackage size={16} />;
      default:
        return <FiFolder size={16} />;
    }
  };

  // Obtenir la couleur de fond pour le type de segment
  const getBgColorForType = (type: string) => {
    switch (type) {
      case 'universe':
        return 'bg-blue-50 dark:bg-blue-900/30';
      case 'category':
        return 'bg-green-50 dark:bg-green-900/30';
      case 'subcategory':
        return 'bg-teal-50 dark:bg-teal-900/30';
      case 'family':
        return 'bg-amber-50 dark:bg-amber-900/30';
      case 'subfamily':
        return 'bg-purple-50 dark:bg-purple-900/30';
      default:
        return 'bg-gray-50 dark:bg-gray-900/30';
    }
  };

  // Obtenir la couleur de texte pour le type de segment
  const getTextColorForType = (type: string) => {
    switch (type) {
      case 'universe':
        return 'text-blue-600 dark:text-blue-400';
      case 'category':
        return 'text-green-600 dark:text-green-400';
      case 'subcategory':
        return 'text-teal-600 dark:text-teal-400';
      case 'family':
        return 'text-amber-600 dark:text-amber-400';
      case 'subfamily':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Rendre un élément de la hiérarchie de façon récursive
  const renderItem = (item: HierarchyItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;
    const bgColor = getBgColorForType(item.type);
    const textColor = getTextColorForType(item.type);
    const iconComponent = getIconForType(item.type);

    return (
      <div key={`${item.type}-${item.name}`} className="mb-1">
        <div 
          className={`flex items-center rounded-md p-2 ${bgColor} cursor-pointer`}
          onClick={() => hasChildren && toggleExpand(item.name)}
          style={{ marginLeft: `${level * 1}rem` }}
        >
          <div className={`mr-2 ${textColor}`}>{iconComponent}</div>
          <div className="flex-1">
            <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              ({item.count} {item.count === 1 ? 'élément' : 'éléments'})
            </span>
          </div>
          {hasChildren && (
            <div className="text-gray-400">
              {isExpanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </div>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {item.children!.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
          {icon}
        </div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h2>
      </div>
      
      <div className="space-y-1">
        {items.map(item => renderItem(item))}
      </div>
    </div>
  );
};