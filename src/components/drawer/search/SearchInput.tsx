// src/components/drawer/search/SearchInput.tsx
import React, { InputHTMLAttributes } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  onSearch: () => void;
  onClear?: () => void;
  multiline?: boolean;
}

/**
 * Composant d'entrée de recherche réutilisable avec bouton de recherche
 */
export function SearchInput({ 
  onSearch, 
  onClear,
  className, 
  value,
  multiline = false,
  ...props 
}: SearchInputProps) {
  const baseClasses = `w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg 
    shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent
    bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${className}`;

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          className={`${baseClasses} min-h-[100px] resize-y`}
          value={value}
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
        />
      ) : (
        <input
          type="text"
          className={baseClasses}
          value={value}
          {...props as React.InputHTMLAttributes<HTMLInputElement>}
        />
      )}
      
      {/* Bouton de nettoyage visible si valeur non vide et si onClear fourni */}
      {value && onClear && (
        <button 
          onClick={onClear}
          className="absolute right-12 top-1/2 -translate-y-1/2 p-2 rounded-md 
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          type="button"
        >
          <FiX size={18} />
        </button>
      )}
      
      {/* Bouton de recherche */}
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