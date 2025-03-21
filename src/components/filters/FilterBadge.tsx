// src/components/filters/FilterBadge.tsx
import React from 'react';
import { FiFilter } from 'react-icons/fi';

interface FilterBadgeProps {
  count: number;
  className?: string;
  size?: 'sm' | 'md';
}

export function FilterBadge({ count, className = '', size = 'md' }: FilterBadgeProps) {
  // Définir les styles en fonction de la taille
  const sizeClasses = size === 'sm' 
    ? 'py-0.5 px-1.5 text-xs' 
    : 'py-1 px-2 text-sm';
  
  return (
    <div className={`bg-sky-100 dark:bg-sky-900/30 rounded-md ${sizeClasses} flex items-center 
      text-sky-700 dark:text-sky-300 font-medium ${className}`}>
      <FiFilter className="mr-1" size={size === 'sm' ? 10 : 12} />
      {count} code{count > 1 ? 's' : ''}
    </div>
  );
}