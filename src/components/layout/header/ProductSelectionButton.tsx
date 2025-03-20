// src/components/layout/header/ProductSelectionButton.tsx
import React from 'react';
import { FiSearch, FiPackage } from 'react-icons/fi';
import { useProductFilter } from '@/contexts/ProductFilterContext';

interface ProductSelectionButtonProps {
  openDrawer: () => void;
}

/**
 * Bouton pour ouvrir le drawer de sélection de produits
 * Affiche le nombre de produits sélectionnés
 */
export function ProductSelectionButton({ openDrawer }: ProductSelectionButtonProps) {
  const { selectedCodes, isFilterActive } = useProductFilter();
  
  return (
    <button
      onClick={openDrawer}
      className={`flex items-center h-10 pl-4 pr-3 border rounded-md shadow-sm transition-colors duration-150 group bg-white dark:bg-gray-800 ${
        isFilterActive 
          ? "border-purple-400 dark:border-purple-600 hover:border-purple-500 dark:hover:border-purple-500" 
          : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
      }`}
    >
      <div className="flex items-center space-x-2">
        <span className={`${isFilterActive ? "text-purple-600 dark:text-purple-400" : "text-purple-500 dark:text-purple-400"}`}>
          <FiPackage size={18} />
        </span>
        <span className={`text-sm font-medium ${
          isFilterActive 
            ? "text-purple-700 dark:text-purple-400" 
            : "text-gray-800 dark:text-gray-200"
        }`}>
          {isFilterActive 
            ? `${selectedCodes.length} produit${selectedCodes.length > 1 ? 's' : ''}` 
            : 'Sélection produits'}
        </span>
      </div>
      <div className={`ml-2 ${
        isFilterActive 
          ? "text-purple-500 dark:text-purple-400" 
          : "text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400"
      } transition-colors duration-150`}>
        <FiSearch size={16} />
      </div>
    </button>
  );
}