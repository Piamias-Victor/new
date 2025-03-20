// src/components/drawer/search/SearchInput.tsx
import React, { InputHTMLAttributes } from 'react';
import { FiSearch } from 'react-icons/fi';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch: () => void;
}

/**
 * Composant d'entrée de recherche réutilisable avec bouton de recherche
 */
export function SearchInput({ 
  onSearch, 
  className, 
  ...props 
}: SearchInputProps) {
  return (
    <div className="relative">
      <input
        type="text"
        className={`w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg 
          shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${className}`}
        {...props}
      />
      <button 
        onClick={onSearch}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md 
          text-gray-500 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400
          hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        type="button"
      >
        <FiSearch size={20} />
      </button>
    </div>
  );
}