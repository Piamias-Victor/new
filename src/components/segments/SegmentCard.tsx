// src/components/segments/SegmentCard.tsx
import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

interface SegmentCardProps {
  title: string;
  items: string[];
  color: string;
  darkColor: string;
  itemCount?: number;
  onItemClick?: (item: string) => void;
}

export const SegmentCard: React.FC<SegmentCardProps> = ({
  title,
  items,
  color,
  darkColor,
  itemCount = 5, // Nombre d'éléments à afficher par défaut
  onItemClick
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Limiter le nombre d'éléments affichés si non-expanded
  const displayedItems = expanded ? items : items.slice(0, itemCount);
  const hasMoreItems = items.length > itemCount;
  
  return (
    <div className={`rounded-lg shadow-sm p-4 ${color} dark:${darkColor} transition-all duration-300 hover:shadow-md`}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {items.length} {items.length === 1 ? 'élément' : 'éléments'} trouvés
      </p>
      
      <div className="space-y-2">
        {displayedItems.map((item, index) => (
          <button
            key={index}
            onClick={() => onItemClick && onItemClick(item)}
            className="w-full text-left px-3 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            {item}
          </button>
        ))}
      </div>
      
      {hasMoreItems && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center w-full mt-3 py-1.5 rounded-md bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          {expanded ? (
            <>
              <FiChevronDown className="mr-1.5" size={16} />
              Afficher moins
            </>
          ) : (
            <>
              <FiChevronRight className="mr-1.5" size={16} />
              Afficher {items.length - itemCount} de plus
            </>
          )}
        </button>
      )}
    </div>
  );
};